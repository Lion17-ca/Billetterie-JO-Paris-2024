from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv
import logging
from typing import Dict, Any
from rate_limiter import auth_limiter, api_limiter

# Chargement des variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("api-gateway")

# Configuration de l'application
app = FastAPI(title="API Gateway - Billetterie JO")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines exactes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration des services
SERVICE_ENDPOINTS = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://localhost:8000"),
    "tickets": os.getenv("TICKETS_SERVICE_URL", "http://localhost:8001"),
    "admin": os.getenv("ADMIN_SERVICE_URL", "http://localhost:8003"),
    "validation": os.getenv("VALIDATION_SERVICE_URL", "http://localhost:8002"),
}

# Client HTTP asynchrone
http_client = httpx.AsyncClient()

# Middleware pour le logging des requêtes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Middleware pour ajouter des en-têtes de sécurité HTTP
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Ajouter des en-têtes de sécurité
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data: https://api.qrserver.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
    
    return response

# Middleware pour limiter le taux de requêtes
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    
    # Appliquer différentes limites selon le type de requête
    if request.url.path.startswith("/auth/token"):
        # Limiter les tentatives d'authentification
        allowed, wait_time = auth_limiter.is_allowed(client_ip)
        if not allowed:
            logger.warning(f"Rate limit exceeded for auth request from {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Trop de tentatives de connexion. Veuillez réessayer dans {wait_time} secondes."
                }
            )
    else:
        # Limiter les requêtes API générales
        allowed, wait_time = api_limiter.is_allowed(client_ip)
        if not allowed:
            logger.warning(f"Rate limit exceeded for API request from {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "detail": f"Trop de requêtes. Veuillez réessayer dans {wait_time} secondes."
                }
            )
    
    # Ajouter des en-têtes pour informer le client des limites
    response = await call_next(request)
    
    if request.url.path.startswith("/auth/token"):
        remaining = auth_limiter.get_remaining_requests(client_ip)
        response.headers["X-RateLimit-Limit"] = str(auth_limiter.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(auth_limiter.window_size)
    else:
        remaining = api_limiter.get_remaining_requests(client_ip)
        response.headers["X-RateLimit-Limit"] = str(api_limiter.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(api_limiter.window_size)
    
    return response

# Fonction pour router les requêtes vers les services appropriés
async def route_request(service: str, path: str, request: Request):
    if service not in SERVICE_ENDPOINTS:
        raise HTTPException(status_code=404, detail=f"Service {service} not found")
    
    # Construire l'URL de destination
    target_url = f"{SERVICE_ENDPOINTS[service]}{path}"
    
    # Extraire les headers, les paramètres de query et le body de la requête
    headers = dict(request.headers)
    headers.pop("host", None)  # Supprimer le header host pour éviter les conflits
    
    # Récupérer les paramètres de query
    params = dict(request.query_params)
    
    try:
        # Récupérer le body de la requête si présent
        body = await request.body()
        body = body if body else None
        
        # Effectuer la requête vers le service cible
        method = request.method.lower()
        if method == "get":
            response = await http_client.get(target_url, headers=headers, params=params)
        elif method == "post":
            response = await http_client.post(target_url, headers=headers, params=params, content=body)
        elif method == "put":
            response = await http_client.put(target_url, headers=headers, params=params, content=body)
        elif method == "delete":
            response = await http_client.delete(target_url, headers=headers, params=params)
        else:
            raise HTTPException(status_code=405, detail=f"Method {method} not allowed")
        
        # Retourner la réponse du service
        return JSONResponse(
            content=response.json() if response.content else {},
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except httpx.RequestError as e:
        logger.error(f"Error routing request to {target_url}: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service {service} unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Routes pour chaque service
@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API Gateway"""
    return {"status": "healthy", "services": SERVICE_ENDPOINTS}

# Routes pour le service d'authentification
@app.api_route("/auth{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_route(request: Request, path: str):
    """Route pour le service d'authentification"""
    return await route_request("auth", path, request)

# Routes pour le service de billetterie
@app.api_route("/tickets{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def tickets_route(request: Request, path: str):
    """Route pour le service de billetterie"""
    return await route_request("tickets", path, request)

# Routes pour le service d'administration
@app.api_route("/admin{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def admin_route(request: Request, path: str):
    """Route pour le service d'administration"""
    return await route_request("admin", path, request)

# Routes pour le service de validation
@app.api_route("/validation{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def validation_route(request: Request, path: str):
    """Route pour le service de validation"""
    return await route_request("validation", path, request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
