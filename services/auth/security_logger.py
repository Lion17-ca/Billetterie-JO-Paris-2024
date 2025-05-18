import logging
import os
from datetime import datetime

# Configuration du logging
log_directory = "/logs"
if not os.path.exists(log_directory):
    try:
        os.makedirs(log_directory)
    except Exception as e:
        print(f"Erreur lors de la création du répertoire de logs: {e}")
        # Fallback sur le répertoire courant
        log_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
        if not os.path.exists(log_directory):
            os.makedirs(log_directory)

# Logger pour les événements de sécurité
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Formatter pour les logs
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Handler pour les fichiers
file_handler = logging.FileHandler(os.path.join(log_directory, "security.log"))
file_handler.setFormatter(formatter)

# Handler pour la console
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

# Ajouter les handlers au logger
security_logger.addHandler(file_handler)
security_logger.addHandler(console_handler)

def log_login_attempt(email, success, ip_address=None, details=None):
    """
    Enregistre une tentative de connexion.
    
    Args:
        email: L'email utilisé pour la tentative de connexion
        success: Booléen indiquant si la tentative a réussi
        ip_address: L'adresse IP de l'utilisateur (optionnel)
        details: Détails supplémentaires (optionnel)
    """
    status = "SUCCESS" if success else "FAILED"
    message = f"LOGIN {status} - Email: {email}"
    
    if ip_address:
        message += f" - IP: {ip_address}"
    
    if details:
        message += f" - Details: {details}"
    
    if success:
        security_logger.info(message)
    else:
        security_logger.warning(message)

def log_mfa_attempt(email, success, ip_address=None, details=None):
    """
    Enregistre une tentative d'authentification MFA.
    
    Args:
        email: L'email de l'utilisateur
        success: Booléen indiquant si la tentative a réussi
        ip_address: L'adresse IP de l'utilisateur (optionnel)
        details: Détails supplémentaires (optionnel)
    """
    status = "SUCCESS" if success else "FAILED"
    message = f"MFA {status} - Email: {email}"
    
    if ip_address:
        message += f" - IP: {ip_address}"
    
    if details:
        message += f" - Details: {details}"
    
    if success:
        security_logger.info(message)
    else:
        security_logger.warning(message)

def log_security_event(event_type, user_email=None, ip_address=None, details=None):
    """
    Enregistre un événement de sécurité général.
    
    Args:
        event_type: Type d'événement (ex: 'PASSWORD_CHANGE', 'ACCOUNT_LOCKED')
        user_email: L'email de l'utilisateur concerné (optionnel)
        ip_address: L'adresse IP de l'utilisateur (optionnel)
        details: Détails supplémentaires (optionnel)
    """
    message = f"SECURITY EVENT: {event_type}"
    
    if user_email:
        message += f" - User: {user_email}"
    
    if ip_address:
        message += f" - IP: {ip_address}"
    
    if details:
        message += f" - Details: {details}"
    
    security_logger.info(message)
