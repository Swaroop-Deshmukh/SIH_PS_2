"""FeedSure 360 — Authentication & Role-Based Access Control (RBAC).

Provides JWT token issuance, PBKDF2 password hashing, user models,
and role permissions for SIH 2026.
"""
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from typing import Any, Dict, Optional
from jose import jwt, JWTError
from pydantic import BaseModel, Field

# Secret key for prototype demo — configurable via environment
SECRET_KEY = os.getenv("FEEDSURE_JWT_SECRET", "feedsure-360-sih-2026-secret-key-production-ready")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Role definitions and capabilities
ROLES: Dict[str, Dict[str, Any]] = {
    "farmer": {
        "name": "Dairy Farmer",
        "description": "Performs rapid testing, views nutritional advisory, manages feed basket and farm profile.",
        "permissions": ["test:create", "test:read", "farm:edit", "advisory:read", "passport:verify"],
    },
    "field_officer": {
        "name": "Field Extension Officer",
        "description": "Visits farms, collects multi-point scans, verifies test escalation, monitors local feed trends.",
        "permissions": ["test:create", "test:read", "farm:read", "escalate:review", "advisory:read", "zone:read"],
    },
    "nutritionist": {
        "name": "Dairy Nutritionist",
        "description": "Reviews chemometrics evidence, adjusts dry matter and crude protein models, approves ration revisions.",
        "permissions": ["test:read", "chemometrics:review", "ration:optimize", "advisory:create", "advisory:read"],
    },
    "lab_technician": {
        "name": "Quality Assurance Lab",
        "description": "Performs wet-chemistry reference testing (Kjeldahl, Van Soest), uploads calibration benchmarks.",
        "permissions": ["test:read", "calibration:upload", "ood:review", "lab:submit"],
    },
    "admin": {
        "name": "System Administrator",
        "description": "Full access to models, devices, users, and audit logs.",
        "permissions": ["*"],
    },
}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    roles: Dict[str, Any]


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=4, max_length=100)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    password: str = Field(..., min_length=4, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="farmer")
    organization: Optional[str] = ""
    phone: Optional[str] = ""


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """PBKDF2-HMAC-SHA256 password hashing with salt."""
    if not salt:
        salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000,
        dklen=32
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifies plain password against stored salt$hash."""
    try:
        salt, key_hex = stored_hash.split("$", 1)
        expected = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100000,
            dklen=32
        )
        return hmac.compare_digest(key_hex, expected.hex())
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates signed JWT token with expiry."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
