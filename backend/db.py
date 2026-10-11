import os
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("MONGODB_DB_NAME", "aetheros")

_client = None
_db = None

# In-memory fallbacks if Atlas is not yet configured or temporarily offline
_IN_MEMORY_USERS = {}
_IN_MEMORY_SESSIONS = {}

def get_db():
    global _client, _db
    if _db is not None:
        return _db
    
    uri = os.getenv("MONGODB_URI", "").strip()
    if not uri:
        return None
    
    try:
        # short timeout (3s) so app doesn't hang if credentials or network is unreachable
        _client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        _client.admin.command('ping')
        _db = _client[DB_NAME]
        print(f"[db] Connected successfully to MongoDB Atlas database: {DB_NAME}")
        return _db
    except Exception as e:
        print(f"[db] Warning: Could not connect to MongoDB Atlas ({e}). Falling back to memory storage.")
        _db = None
        return None

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return hashed, salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    hashed, _ = hash_password(password, salt)
    return hmac.compare_digest(hashed, expected_hash)

def init_default_users():
    """Initializes default admin and regular user accounts if they do not exist."""
    db = get_db()
    
    default_users = [
        {
            "username": "admin",
            "email": "admin@aetheros.io",
            "name": "System Administrator",
            "role": "admin",
            "password": "AdminPassword123!",
        },
        {
            "username": "user",
            "email": "user@aetheros.io",
            "name": "Operational User",
            "role": "user",
            "password": "UserPassword123!",
        }
    ]
    
    for u in default_users:
        if db is not None:
            existing = db.users.find_one({"$or": [{"username": u["username"]}, {"email": u["email"]}]})
            if not existing:
                pwd_hash, salt = hash_password(u["password"])
                db.users.insert_one({
                    "username": u["username"],
                    "email": u["email"],
                    "name": u["name"],
                    "role": u["role"],
                    "password_hash": pwd_hash,
                    "salt": salt,
                    "created_at": datetime.now(timezone.utc)
                })
                print(f"[db] Created default {u['role']} user: {u['username']}")
        else:
            if u["username"] not in _IN_MEMORY_USERS:
                pwd_hash, salt = hash_password(u["password"])
                _IN_MEMORY_USERS[u["username"]] = {
                    "username": u["username"],
                    "email": u["email"],
                    "name": u["name"],
                    "role": u["role"],
                    "password_hash": pwd_hash,
                    "salt": salt,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }

def find_user(identifier: str):
    """Finds user by username or email."""
    db = get_db()
    if db is not None:
        return db.users.find_one({"$or": [{"username": identifier.lower()}, {"email": identifier.lower()}]})
    
    for user in _IN_MEMORY_USERS.values():
        if user["username"].lower() == identifier.lower() or user["email"].lower() == identifier.lower():
            return user
    return None

def create_user(username: str, email: str, name: str, password: str, role: str = "user"):
    db = get_db()
    pwd_hash, salt = hash_password(password)
    user_doc = {
        "username": username.lower(),
        "email": email.lower(),
        "name": name,
        "role": role,
        "password_hash": pwd_hash,
        "salt": salt,
        "created_at": datetime.now(timezone.utc)
    }
    
    if db is not None:
        db.users.insert_one(user_doc)
    else:
        _IN_MEMORY_USERS[username.lower()] = user_doc
    return user_doc

def save_session(session_token: str, user_data: dict):
    db = get_db()
    session_doc = {
        "token": session_token,
        "username": user_data["username"],
        "email": user_data["email"],
        "role": user_data["role"],
        "name": user_data.get("name", user_data["username"]),
        "created_at": datetime.now(timezone.utc)
    }
    if db is not None:
        db.sessions.create_index("token", unique=True)
        db.sessions.insert_one(session_doc)
    else:
        _IN_MEMORY_SESSIONS[session_token] = session_doc

def get_session(session_token: str):
    if not session_token:
        return None
    db = get_db()
    if db is not None:
        return db.sessions.find_one({"token": session_token})
    return _IN_MEMORY_SESSIONS.get(session_token)

def delete_session(session_token: str):
    if not session_token:
        return
    db = get_db()
    if db is not None:
        db.sessions.delete_one({"token": session_token})
    else:
        _IN_MEMORY_SESSIONS.pop(session_token, None)

def log_activity(action: str, performed_by: str, details: dict = None):
    """Logs system, user, and agent activities into MongoDB Atlas activity_logs collection."""
    db = get_db()
    entry = {
        "action": action,
        "performed_by": performed_by,
        "details": details or {},
        "timestamp": datetime.now(timezone.utc)
    }
    if db is not None:
        try:
            db.activity_logs.insert_one(entry)
        except Exception as e:
            print(f"[db] Warning: could not write activity log: {e}")

def seed_business_datasets():
    """Migrates/seeds CSV datasets from backend/data into separate MongoDB Atlas collections."""
    db = get_db()
    if db is None:
        return
    
    import csv
    from pathlib import Path
    
    data_dir = Path(__file__).parent / "data"
    csv_files = list(data_dir.glob("*.csv"))
    
    print(f"[seed] Checking {len(csv_files)} business datasets for MongoDB Atlas...")
    for f in csv_files:
        col_name = f.stem  # e.g., 'customers', 'deals', 'financial_reports', etc.
        try:
            count = db[col_name].count_documents({})
            if count == 0:
                docs = []
                with open(f, mode="r", encoding="utf-8") as csv_f:
                    reader = csv.DictReader(csv_f)
                    for row in reader:
                        typed_row = {}
                        for k, v in row.items():
                            if v is None or v == "":
                                typed_row[k] = None
                                continue
                            try:
                                if "." in v:
                                    typed_row[k] = float(v)
                                else:
                                    typed_row[k] = int(v)
                            except ValueError:
                                typed_row[k] = v
                        typed_row["_imported_at"] = datetime.now(timezone.utc)
                        docs.append(typed_row)
                if docs:
                    db[col_name].insert_many(docs)
                    print(f"  + [{col_name}] Seeded {len(docs)} documents into MongoDB Atlas.")
            else:
                pass
        except Exception as e:
            print(f"  ! Error checking/seeding collection '{col_name}': {e}")

