from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Annotated
from jose import JWTError, jwt
from passlib.context import CryptContext
import pyotp
import secrets
import os
import time
import models
import schemas
from database import get_db
from security_logger import log_login_attempt, log_mfa_attempt, log_security_event

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "YOUR_SECRET_KEY")  # À remplacer par une clé sécurisée en production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Initialisation de l'application
app = FastAPI(title="Service d'Authentification - Billetterie JO")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permettre toutes les origines en développement
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=600,  # Cache les pré-requêtes OPTIONS pendant 10 minutes
)

# Configuration de la sécurité
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Fonctions utilitaires
def verify_password(plain_password, hashed_password):
    """Vérifie si un mot de passe en clair correspond à un mot de passe haché.
    
    Args:
        plain_password (str): Le mot de passe en clair à vérifier.
        hashed_password (str): Le mot de passe haché stocké dans la base de données.
        
    Returns:
        bool: True si le mot de passe correspond, False sinon.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Génère un hash sécurisé pour un mot de passe.
    
    Args:
        password (str): Le mot de passe en clair à hacher.
        
    Returns:
        str: Le mot de passe haché.
    """
    return pwd_context.hash(password)

def generate_security_key():
    """Génère une clé de sécurité cryptographiquement sûre.
    
    Cette clé est utilisée comme première clé de sécurité lors de la création d'un compte utilisateur.
    Elle est stockée dans la base de données utilisateur et utilisée pour la génération et la validation des billets.
    
    Returns:
        str: Une chaîne hexadécimale de 64 caractères (32 octets).
    """
    return secrets.token_hex(32)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crée un token JWT (JSON Web Token) pour l'authentification.
    
    Args:
        data (dict): Les données à encoder dans le token, généralement l'identifiant de l'utilisateur
                    et ses rôles (admin, employé).
        expires_delta (Optional[timedelta], optional): Durée de validité du token. 
                                                     Si non spécifié, expire après 15 minutes.
    
    Returns:
        str: Le token JWT encodé.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
    """Récupère l'utilisateur actuel à partir du token JWT.
    
    Cette fonction est utilisée comme dépendance pour les routes qui nécessitent une authentification.
    Elle vérifie la validité du token JWT et récupère l'utilisateur correspondant dans la base de données.
    
    Args:
        token (str): Le token JWT extrait de l'en-tête Authorization.
        db (Session): Session de base de données SQLAlchemy.
        
    Returns:
        schemas.User: L'utilisateur authentifié.
        
    Raises:
        HTTPException: Si le token est invalide ou si l'utilisateur n'existe pas.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = models.get_user_by_email(db, email=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Health check pour Railway
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "auth"}

# Routes
@app.post("/register", response_model=schemas.User)
async def register_user(user: schemas.UserCreate, db: Annotated[Session, Depends(get_db)]):
    """Enregistre un nouvel utilisateur dans le système.
    
    Cette route permet de créer un nouveau compte utilisateur. Elle génère automatiquement
    une clé de sécurité pour l'utilisateur et un secret pour l'authentification multi-facteurs.
    
    Args:
        user (schemas.UserCreate): Les données de l'utilisateur à créer.
        db (Session): Session de base de données SQLAlchemy.
        
    Returns:
        schemas.User: L'utilisateur créé.
        
    Raises:
        HTTPException: Si l'email est déjà enregistré.
    """
    db_user = models.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Génération de la première clé de sécurité
    security_key_1 = generate_security_key()
    
    # Création du secret pour l'authentification MFA
    mfa_secret = pyotp.random_base32()
    
    hashed_password = get_password_hash(user.password)
    return models.create_user(db=db, user=user, hashed_password=hashed_password, 
                             security_key_1=security_key_1, mfa_secret=mfa_secret)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(request: Request, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Annotated[Session, Depends(get_db)]):
    """Authentifie un utilisateur et génère un token JWT.
    
    Cette route est utilisée pour le processus de connexion. Elle vérifie les identifiants de l'utilisateur
    et génère un token JWT si les identifiants sont valides. Toutes les tentatives de connexion sont journalisées
    pour des raisons de sécurité.
    
    Args:
        request (Request): La requête HTTP, utilisée pour récupérer l'adresse IP du client.
        form_data (OAuth2PasswordRequestForm): Les données de formulaire contenant l'email et le mot de passe.
        db (Session): Session de base de données SQLAlchemy.
        
    Returns:
        schemas.Token: Le token JWT et les informations sur les rôles de l'utilisateur.
        
    Raises:
        HTTPException: Si les identifiants sont invalides.
    """
    # Récupérer l'adresse IP du client
    client_ip = request.client.host
    
    # Vérifier si l'utilisateur existe
    user = models.get_user_by_email(db, email=form_data.username)
    if not user:
        # Journaliser la tentative de connexion échouée
        log_login_attempt(
            email=form_data.username,
            success=False,
            ip_address=client_ip,
            details="Email non enregistré"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email non enregistré. Veuillez vérifier votre email ou créer un compte.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier le mot de passe
    if not verify_password(form_data.password, user.hashed_password):
        # Journaliser la tentative de connexion échouée
        log_login_attempt(
            email=form_data.username,
            success=False,
            ip_address=client_ip,
            details="Mot de passe incorrect"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mot de passe incorrect. Veuillez réessayer.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérification MFA à implémenter ici
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "is_employee": user.is_employee,
            "is_admin": user.is_admin
        }, 
        expires_delta=access_token_expires
    )
    
    # Journaliser la connexion réussie
    log_login_attempt(
        email=user.email,
        success=True,
        ip_address=client_ip,
        details=f"Connexion réussie. Roles: admin={user.is_admin}, employee={user.is_employee}"
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "is_employee": user.is_employee,
        "is_admin": user.is_admin
    }

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    """Récupère les informations de l'utilisateur actuellement authentifié.
    
    Cette route permet à un utilisateur de récupérer ses propres informations.
    Elle nécessite que l'utilisateur soit authentifié.
    
    Args:
        current_user (schemas.User): L'utilisateur actuellement authentifié, injecté par la dépendance get_current_user.
        
    Returns:
        schemas.User: Les informations de l'utilisateur.
    """
    return current_user

@app.post("/mfa/setup", response_model=schemas.MFASetup)
async def setup_mfa(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    """Configure l'authentification multi-facteurs (MFA) pour l'utilisateur.
    
    Cette route génère un secret MFA pour l'utilisateur et renvoie les informations nécessaires
    pour configurer une application d'authentification (comme Google Authenticator).
    
    Args:
        current_user (schemas.User): L'utilisateur actuellement authentifié.
        
    Returns:
        schemas.MFASetup: Les informations de configuration MFA, y compris le secret et l'URI pour le QR code.
    """
    # Génération d'un nouveau secret MFA si nécessaire
    if not current_user.mfa_secret:
        current_user.mfa_secret = pyotp.random_base32()
        # Sauvegarder dans la base de données
    
    # Création de l'URI pour le QR code
    totp = pyotp.TOTP(current_user.mfa_secret)
    provisioning_uri = totp.provisioning_uri(
        name=current_user.email, 
        issuer_name="Billetterie JO"
    )
    
    # Pour le projet académique, générer et renvoyer le code actuel
    current_code = totp.now()
    
    return {
        "secret": current_user.mfa_secret,
        "uri": provisioning_uri,
        "current_code": current_code,  # Code MFA actuel pour la démonstration
        "valid_until": int(time.time()) + 30  # Valide pendant 30 secondes
    }

@app.post("/mfa/verify")
async def verify_mfa(request: Request, token_data: schemas.MFAToken, current_user: Annotated[schemas.User, Depends(get_current_user)]):
    """Vérifie un code MFA fourni par l'utilisateur.
    
    Cette route vérifie si le code MFA fourni par l'utilisateur est valide.
    Si le code est valide, l'utilisateur est marqué comme ayant configuré MFA.
    Toutes les tentatives de vérification MFA sont journalisées pour des raisons de sécurité.
    
    Args:
        request (Request): La requête HTTP, utilisée pour récupérer l'adresse IP du client.
        token_data (schemas.MFAToken): Les données contenant le code MFA à vérifier.
        current_user (schemas.User): L'utilisateur actuellement authentifié.
        
    Returns:
        dict: Un dictionnaire contenant le statut de la vérification.
        
    Raises:
        HTTPException: Si le code MFA est invalide.
    """
    # Récupérer l'adresse IP du client
    client_ip = request.client.host
    
    totp = pyotp.TOTP(current_user.mfa_secret)
    
    # Pour le projet académique, accepter également le code 123456
    if not totp.verify(token_data.token) and token_data.token != "123456":
        # Journaliser l'échec de vérification MFA
        log_mfa_attempt(
            email=current_user.email,
            success=False,
            ip_address=client_ip,
            details="Code MFA invalide"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA token",
        )
    
    # Marquer l'utilisateur comme ayant configuré MFA
    current_user.mfa_enabled = True
    # Sauvegarder dans la base de données
    
    # Journaliser la vérification MFA réussie
    log_mfa_attempt(
        email=current_user.email,
        success=True,
        ip_address=client_ip,
        details="Vérification MFA réussie"
    )
    
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
