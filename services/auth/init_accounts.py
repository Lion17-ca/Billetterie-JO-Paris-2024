import os
import pyotp
import secrets
import logging
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from models import User

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def get_password_hash(password):
    """Import the function here to avoid circular imports"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

def init_admin_and_employee_accounts():
    """
    Initialize admin and employee accounts if they don't already exist.
    This function is called when the auth service starts.
    """
    try:
        # Get database session
        db = next(get_db())
        
        logger.info("Checking for existing admin and employee accounts...")
        
        # Check if admin account exists
        admin_email = "admin@example.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        
        if not admin:
            # Create admin account
            admin_password = "Admin123!"
            hashed_password = get_password_hash(admin_password)
            security_key = secrets.token_hex(32)
            mfa_secret = pyotp.random_base32()
            
            admin = User(
                email=admin_email,
                first_name="Admin",
                last_name="User",
                hashed_password=hashed_password,
                security_key_1=security_key,
                mfa_secret=mfa_secret,
                is_admin=True,
                is_employee=False,
                mfa_enabled=False,
                is_active=True
            )
            
            db.add(admin)
            logger.info(f"Created admin account: {admin_email}")
        else:
            logger.info(f"Admin account already exists: {admin_email}")
        
        # Check if employee account exists
        employee_email = "employee@example.com"
        employee = db.query(User).filter(User.email == employee_email).first()
        
        if not employee:
            # Create employee account
            employee_password = "Employee123!"
            hashed_password = get_password_hash(employee_password)
            security_key = secrets.token_hex(32)
            mfa_secret = pyotp.random_base32()
            
            employee = User(
                email=employee_email,
                first_name="Employee",
                last_name="User",
                hashed_password=hashed_password,
                security_key_1=security_key,
                mfa_secret=mfa_secret,
                is_admin=False,
                is_employee=True,
                mfa_enabled=False,
                is_active=True
            )
            
            db.add(employee)
            logger.info(f"Created employee account: {employee_email}")
        else:
            logger.info(f"Employee account already exists: {employee_email}")
        
        # Commit changes
        db.commit()
        
        # Print account information for reference
        logger.info("\n=== Pre-configured Accounts ===")
        logger.info("Admin account:")
        logger.info(f"  Email: {admin_email}")
        logger.info("  Password: Admin123!")
        logger.info("\nEmployee account:")
        logger.info(f"  Email: {employee_email}")
        logger.info("  Password: Employee123!")
        logger.info("=============================\n")
        
    except Exception as e:
        logger.error(f"Error initializing accounts: {str(e)}")
        # Don't re-raise the exception to avoid crashing the application startup

if __name__ == "__main__":
    init_admin_and_employee_accounts()
