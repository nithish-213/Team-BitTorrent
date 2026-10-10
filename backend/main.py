from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import run_agent
from retrieval import PAGES, get_retriever
from tools import PENDING

app = FastAPI(title="Context-Aware Application Agent")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class AgentReq(BaseModel):
    query: str
    current_page: str = "dashboard"
    history: list[dict] = []

@app.on_event("startup")
def warm():
    get_retriever()

@app.get("/health")
def health():
    return {"pages": len(PAGES), "retrieval_mode": get_retriever().mode}

@app.post("/agent")
def agent(req: AgentReq):
    return run_agent(req.query, req.current_page, req.history)

@app.post("/confirm/{cid}")
def confirm(cid: str):
    desc = PENDING.pop(cid, None)
    if not desc:
        raise HTTPException(404, "Unknown or already-handled confirmation id")
    return {"type": "state_change", "status": "done", "description": desc}

@app.post("/cancel/{cid}")
def cancel(cid: str):
    PENDING.pop(cid, None)
    return {"status": "cancelled"}
