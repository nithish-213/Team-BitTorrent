from dotenv import load_dotenv
load_dotenv()
import secrets
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from agent import run_agent
from retrieval import PAGES, get_retriever
from tools import PENDING
import db

app = FastAPI(title="AetherOS Enterprise Agent API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentReq(BaseModel):
    query: str
    current_page: str = "dashboard"
    history: list[dict] = []
    active_filters: dict = {}
    active_sort: Optional[str] = None
    selected_record: Optional[dict] = None

class LoginReq(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., min_length=1)

class RegisterReq(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    name: str
    password: str = Field(..., min_length=6)
    role: str = "user"

@app.on_event("startup")
def startup():
    get_retriever()
    db.init_default_users()
    db.seed_business_datasets()

@app.get("/")
def root():
    return {
        "service": "AetherOS Enterprise Agent API",
        "status": "online",
        "documentation": "/docs",
        "frontend": "http://localhost:5173",
        "endpoints": {
            "health": "/health",
            "auth_login": "/auth/login",
            "auth_register": "/auth/register",
            "auth_logout": "/auth/logout",
            "auth_me": "/auth/me",
            "admin_metrics": "/admin/metrics",
            "agent": "/agent"
        }
    }

def get_current_user(authorization: Optional[str] = Header(None)):
    """Authenticates the incoming bearer token and returns session user dict."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required. Please sign in.")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format.")
    
    token = parts[1]
    session = db.get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or invalid. Please sign in again.")
    
    return session

def require_admin(user: dict = Depends(get_current_user)):
    """Ensures the caller has the admin role."""
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Administrator privileges required.")
    return user

# ----------------- Auth Endpoints -----------------

@app.post("/auth/register")
def register(req: RegisterReq):
    username_clean = req.username.strip().lower()
    email_clean = req.email.strip().lower()
    name_clean = req.name.strip() or username_clean
    
    # Validation
    if len(username_clean) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")
    if "@" not in email_clean or "." not in email_clean:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    # Check if user already exists
    if db.find_user(username_clean):
        raise HTTPException(status_code=400, detail="Username is already taken.")
    if db.find_user(email_clean):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    # New registrations default to "user" role for security
    user = db.create_user(
        username=username_clean,
        email=email_clean,
        name=name_clean,
        password=req.password,
        role="user"
    )
    
    # Auto-login upon registration
    session_token = secrets.token_hex(32)
    user_payload = {
        "username": user["username"],
        "email": user["email"],
        "name": user.get("name", user["username"]),
        "role": user["role"]
    }
    db.save_session(session_token, user_payload)
    
    return {
        "status": "success",
        "message": "Account created successfully.",
        "token": session_token,
        "user": user_payload
    }

@app.post("/auth/login")
def login(req: LoginReq):
    user = db.find_user(req.username.strip())
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
    if not db.verify_password(req.password, user["salt"], user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    
    session_token = secrets.token_hex(32)
    user_payload = {
        "username": user["username"],
        "email": user["email"],
        "name": user.get("name", user["username"]),
        "role": user["role"]
    }
    db.save_session(session_token, user_payload)
    
    return {
        "status": "success",
        "token": session_token,
        "user": user_payload
    }

@app.post("/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            db.delete_session(parts[1])
    return {"status": "success", "message": "Signed out successfully."}

@app.get("/auth/me")
def me(user: dict = Depends(get_current_user)):
    return {
        "user": {
            "username": user["username"],
            "email": user["email"],
            "name": user.get("name", user["username"]),
            "role": user["role"]
        }
    }

# ----------------- System & Metrics Endpoints -----------------

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "pages": len(PAGES),
        "retrieval_mode": get_retriever().mode,
        "database": "mongodb_atlas" if db.get_db() is not None else "in_memory_fallback"
    }

@app.get("/data/territories")
def get_territories():
    """Returns custom provisioned territories stored in MongoDB Atlas."""
    database = db.get_db()
    if database is None:
        return {"territories": []}
        
    try:
        docs = list(database.regional_sales.find({"territory_name": {"$exists": True}}, {"_id": 0}))
        for d in docs:
            if hasattr(d.get("created_at"), "isoformat"):
                d["created_at"] = d["created_at"].isoformat()
        return {"territories": docs}
    except Exception as e:
        print(f"[territories] Error: {e}")
        return {"territories": []}

@app.get("/admin/metrics", dependencies=[Depends(require_admin)])
def admin_metrics():
    """Admin-only system performance, database status, and trace indicators."""
    from llm import _COOLDOWN
    import time
    
    database_status = "connected" if db.get_db() is not None else "fallback_local"
    cooldown_count = sum(1 for until in _COOLDOWN.values() if until > time.time())
    
    return {
        "system": {
            "catalog_pages": len(PAGES),
            "retrieval_mode": get_retriever().mode,
            "database_backend": database_status,
            "active_cooldowns": cooldown_count,
            "pending_confirmations": len(PENDING)
        },
        "cooldowns": [
            {"provider_model": f"{p}/{m}", "expires_in_seconds": max(0, int(until - time.time()))}
            for (p, m), until in _COOLDOWN.items() if until > time.time()
        ]
    }

@app.get("/admin/collections", dependencies=[Depends(require_admin)])
def list_collections():
    """Returns overview of all collections and document counts in MongoDB Atlas."""
    database = db.get_db()
    if database is None:
        raise HTTPException(status_code=503, detail="MongoDB Atlas is not currently connected.")
    
    col_names = database.list_collection_names()
    stats = []
    
    # Categorize collections for administrative clarity
    system_cols = {"users", "sessions", "activity_logs"}
    
    for name in sorted(col_names):
        try:
            count = database[name].count_documents({})
        except Exception:
            count = 0
            
        category = "System & Auth" if name in system_cols else "Business Dataset"
        stats.append({
            "name": name,
            "count": count,
            "category": category
        })
    
    return {
        "database": db.DB_NAME,
        "total_collections": len(stats),
        "collections": stats
    }

@app.get("/admin/collections/{col_name}", dependencies=[Depends(require_admin)])
def get_collection_data(col_name: str, limit: int = 50, skip: int = 0):
    """Admin endpoint to inspect documents in any MongoDB Atlas collection."""
    database = db.get_db()
    if database is None:
        raise HTTPException(status_code=503, detail="MongoDB Atlas is not currently connected.")
        
    if col_name not in database.list_collection_names():
        raise HTTPException(status_code=404, detail=f"Collection '{col_name}' does not exist.")
        
    total = database[col_name].count_documents({})
    # Exclude password hashes & salts when inspecting users
    projection = {"_id": 0}
    if col_name == "users":
        projection["password_hash"] = 0
        projection["salt"] = 0
        
    cursor = database[col_name].find({}, projection).sort("_id", -1).skip(skip).limit(min(limit, 100))
    docs = list(cursor)
    
    # Convert any non-serializable objects (like datetime) to string and clean NaN/inf
    import math
    for doc in docs:
        for k, v in list(doc.items()):
            if hasattr(v, "isoformat"):
                doc[k] = v.isoformat()
            elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                doc[k] = None
                
    return {
        "collection": col_name,
        "total": total,
        "returned": len(docs),
        "documents": docs
    }

@app.post("/admin/collections/reseed", dependencies=[Depends(require_admin)])
def reseed_collections(user: dict = Depends(get_current_user)):
    """Triggers refresh/seeding of all business datasets into MongoDB Atlas."""
    db.seed_business_datasets()
    db.log_activity("reseed_datasets", user["username"], {"message": "Admin triggered collection sync"})
    return {"status": "success", "message": "Collections verified and synced to MongoDB Atlas."}

# ----------------- Application & Copilot Endpoints -----------------

@app.post("/agent")
def agent(req: AgentReq, user: Optional[dict] = Depends(get_current_user)):
    """Runs agent with trace information stripped for regular users, with full screen and user context."""
    user_context = {
        "username": user.get("username", "anonymous") if user else "anonymous",
        "role": user.get("role", "user") if user else "user",
        "name": user.get("name", "User") if user else "User"
    }
    result = run_agent(
        query=req.query,
        current_page=req.current_page,
        history=req.history,
        active_filters=req.active_filters,
        active_sort=req.active_sort,
        selected_record=req.selected_record,
        user_context=user_context
    )
    
    # If the user is a regular user, exclude internal trace diagnostics
    if user and user.get("role") != "admin":
        result_copy = dict(result)
        # Regular user receives answer, actions, ui_state, citations, and pending_confirmation
        # Internal trace metrics (latency, candidate vector scores, tool steps, provider) are restricted
        result_copy.pop("trace", None)
        username = user.get("username", "anonymous")
        db.log_activity("agent_query", username, {"query": req.query, "page": req.current_page, "filters": req.active_filters})
        return result_copy
    
    if user:
        db.log_activity("agent_query", user.get("username", "admin"), {"query": req.query, "page": req.current_page, "filters": req.active_filters})
        
    return result

@app.post("/confirm/{cid}")
def confirm(cid: str, user: dict = Depends(get_current_user)):
    item = PENDING.pop(cid, None)
    if not item:
        raise HTTPException(404, "Unknown or already-handled confirmation id")
        
    desc = item["description"] if isinstance(item, dict) else item
    action_type = item.get("action") if isinstance(item, dict) else None
    args = item.get("args", {}) if isinstance(item, dict) else {}
    
    # 1. If action is territory creation, persist into MongoDB Atlas regional_sales collection
    if action_type == "create_territory":
        database = db.get_db()
        if database is not None:
            from datetime import datetime, timezone
            new_territory_doc = {
                "territory_name": args.get("name"),
                "region": args.get("region"),
                "created_by": user["username"],
                "created_at": datetime.now(timezone.utc),
                "status": "Active"
            }
            database.regional_sales.insert_one(new_territory_doc)
            
    # 2. Log confirmation to MongoDB Atlas activity_logs
    db.log_activity("confirmed_action", user["username"], {
        "confirmation_id": cid,
        "description": desc,
        "details": args
    })
    
    return {"type": "state_change", "status": "done", "description": desc, "confirmed_by": user["username"]}

@app.post("/cancel/{cid}")
def cancel(cid: str, user: dict = Depends(get_current_user)):
    item = PENDING.pop(cid, None)
    desc = item["description"] if isinstance(item, dict) else item
    db.log_activity("cancelled_action", user["username"], {"confirmation_id": cid, "description": desc})
    return {"status": "cancelled", "cancelled_by": user["username"]}
