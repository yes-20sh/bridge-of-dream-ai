import secrets
import string
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed one."""
    try:
        return bcrypt.checkpw(
            plain_password[:72].encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the given password."""
    return bcrypt.hashpw(
        password[:72].encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')

def generate_random_password(length: int = 12) -> str:
    """Generate a random alphanumeric password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password