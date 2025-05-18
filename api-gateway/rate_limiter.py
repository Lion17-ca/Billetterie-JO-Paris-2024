import time
from collections import defaultdict
from typing import Dict, List, Tuple

class RateLimiter:
    """
    Classe simple de limitation de taux de requêtes basée sur l'adresse IP.
    Utilise un algorithme de fenêtre glissante pour limiter le nombre de requêtes
    dans une période donnée.
    """
    
    def __init__(self, max_requests: int = 10, window_size: int = 60):
        """
        Initialise le limiteur de taux.
        
        Args:
            max_requests: Nombre maximum de requêtes autorisées dans la fenêtre de temps
            window_size: Taille de la fenêtre de temps en secondes
        """
        self.max_requests = max_requests
        self.window_size = window_size
        self.requests: Dict[str, List[float]] = defaultdict(list)
    
    def is_allowed(self, ip_address: str) -> Tuple[bool, int]:
        """
        Vérifie si une requête est autorisée pour une adresse IP donnée.
        
        Args:
            ip_address: L'adresse IP à vérifier
            
        Returns:
            Tuple contenant:
                - Un booléen indiquant si la requête est autorisée
                - Le nombre de secondes avant que la prochaine requête soit autorisée
        """
        current_time = time.time()
        
        # Nettoyer les anciennes requêtes
        self.requests[ip_address] = [
            req_time for req_time in self.requests[ip_address]
            if current_time - req_time < self.window_size
        ]
        
        # Vérifier si le nombre de requêtes dépasse la limite
        if len(self.requests[ip_address]) >= self.max_requests:
            # Calculer le temps d'attente
            oldest_request = min(self.requests[ip_address])
            wait_time = int(self.window_size - (current_time - oldest_request))
            return False, wait_time
        
        # Enregistrer cette requête
        self.requests[ip_address].append(current_time)
        return True, 0
    
    def get_remaining_requests(self, ip_address: str) -> int:
        """
        Renvoie le nombre de requêtes restantes pour une adresse IP donnée.
        
        Args:
            ip_address: L'adresse IP à vérifier
            
        Returns:
            Le nombre de requêtes restantes
        """
        current_time = time.time()
        
        # Nettoyer les anciennes requêtes
        self.requests[ip_address] = [
            req_time for req_time in self.requests[ip_address]
            if current_time - req_time < self.window_size
        ]
        
        return max(0, self.max_requests - len(self.requests[ip_address]))

# Créer des instances pour différents types de requêtes
auth_limiter = RateLimiter(max_requests=5, window_size=60)  # 5 requêtes d'authentification par minute
api_limiter = RateLimiter(max_requests=60, window_size=60)  # 60 requêtes API par minute
