from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import Dict, List, Optional
import sqlite3
from cachetools import TTLCache
from web3 import Web3
import time
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from datetime import datetime, timedelta
import hashlib

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Blockchain setup
INFURA_PROJECT_ID = os.getenv("INFURA_PROJECT_ID", "your_infura_project_id_here")
w3 = Web3(Web3.HTTPProvider(f"https://sepolia.infura.io/v3/{INFURA_PROJECT_ID}"))
contract_address = "0xF40613e98Ba82C88E581BBdDaDD5CD072AeDba19"
abi = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "modelId", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": False, "internalType": "string", "name": "ipfsHash", "type": "string"},
            {"indexed": True, "internalType": "address", "name": "uploader", "type": "address"}
        ],
        "name": "ModelUploaded",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_description", "type": "string"},
            {"internalType": "string", "name": "_ipfsHash", "type": "string"},
            {"internalType": "string", "name": "_tags", "type": "string"},
            {"internalType": "string", "name": "_category", "type": "string"},
            {"internalType": "bool", "name": "_isPublic", "type": "bool"},
            {"internalType": "uint256", "name": "_price", "type": "uint256"}
        ],
        "name": "uploadModel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllModels",
        "outputs": [
            {
                "components": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "string", "name": "description", "type": "string"},
                    {"internalType": "string", "name": "ipfsHash", "type": "string"},
                    {"internalType": "string", "name": "tags", "type": "string"},
                    {"internalType": "string", "name": "category", "type": "string"},
                    {"internalType": "bool", "name": "isPublic", "type": "bool"},
                    {"internalType": "uint256", "name": "price", "type": "uint256"},
                    {"internalType": "address", "name": "uploader", "type": "address"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
                ],
                "internalType": "struct AIModelRegistry.Model[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
contract = w3.eth.contract(address=contract_address, abi=abi)

# Pydantic models
class RecommendationRequest(BaseModel):
    user_address: Optional[str] = None
    preferred_categories: Optional[List[str]] = None
    preferred_tags: Optional[List[str]] = None
    price_range: List[int]
    top_n: int
    search_term: Optional[str] = None

class SyncModelsRequest(BaseModel):
    models: List[Dict]

class InteractionRequest(BaseModel):
    user_address: str
    model_id: int
    interaction_type: str
    search_term: Optional[str] = None  # Added for search interactions

# Database setup
def init_db():
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_interactions (
                user_address TEXT,
                model_id INTEGER,
                interaction_type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS search_interactions (
                user_address TEXT,
                model_id INTEGER,
                search_term TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS models (
                id INTEGER PRIMARY KEY,
                name TEXT,
                category TEXT,
                tags TEXT,
                price INTEGER,
                description TEXT,
                isNFT INTEGER,
                blockchain TEXT,
                owner TEXT,
                ipfsHash TEXT,
                uploader TEXT
            )
        """)
        conn.commit()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise
    finally:
        conn.close()

init_db()

# In-memory cache (TTL: 5 minutes)
cache = TTLCache(maxsize=100, ttl=300)

# Fetch models from blockchain
def fetch_blockchain_models():
    try:
        if not w3.is_connected():
            logger.error("Failed to connect to Ethereum node")
            return []
        blockchain_models = contract.functions.getAllModels().call()
        formatted_models = []
        for idx, model in enumerate(blockchain_models):
            tags_array = model[3].split(",") if model[3] else []
            price_in_eth = float(Web3.from_wei(model[6], "ether"))
            price_in_dollars = int(price_in_eth * 200)  # Assuming 1 ETH = $200
            formatted_models.append({
                "id": idx + 1,
                "name": model[0],
                "category": model[4] or "Text Generation",
                "tags": tags_array,
                "description": model[1],
                "price": price_in_dollars or 299,
                "isNFT": not model[5],
                "blockchain": "Ethereum" if not model[5] else None,
                "owner": f"{model[7][:6]}...{model[7][-4:]}" if model[7] else None,
                "ipfsHash": model[2],
                "uploader": model[7]
            })
        logger.info(f"Fetched {len(formatted_models)} models from blockchain")
        return formatted_models
    except Exception as e:
        logger.error(f"Error fetching blockchain models: {e}")
        return []

# Load models from SQLite
def load_models():
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM models")
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        models = [dict(zip(columns, row)) for row in rows]
        for model in models:
            model["tags"] = model["tags"].split(",") if model["tags"] else []
            model["isNFT"] = bool(model["isNFT"])
        logger.info(f"Loaded {len(models)} models from database")
        return models
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return []
    finally:
        conn.close()

# Save models to SQLite
def save_models_to_db(models):
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM models")
        for model in models:
            cursor.execute("""
                INSERT INTO models (id, name, category, tags, price, description, isNFT, blockchain, owner, ipfsHash, uploader)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                model["id"], model["name"], model["category"], ",".join(model["tags"]), model["price"],
                model["description"], int(model["isNFT"]), model["blockchain"], model["owner"],
                model["ipfsHash"], model["uploader"]
            ))
        conn.commit()
        logger.info(f"Saved {len(models)} models to database")
    except Exception as e:
        logger.error(f"Error saving models to database: {e}")
        raise
    finally:
        conn.close()

# Initialize models from blockchain
models_db = load_models()
if not models_db:
    logger.info("No models found in database, fetching from blockchain")
    models_db = fetch_blockchain_models()
    if models_db:
        save_models_to_db(models_db)
    models_db = load_models()

# TF-IDF computation
def compute_tfidf():
    corpus = [f"{model['name']} {model['description'] or ''} {' '.join(model['tags'])}" for model in models_db]
    if not corpus or all(not doc.strip() for doc in corpus):
        logger.warning("Empty or invalid corpus, returning empty TF-IDF matrix")
        return TfidfVectorizer(stop_words="english"), None
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        logger.info("TF-IDF matrix computed successfully")
        return vectorizer, tfidf_matrix
    except ValueError as e:
        logger.error(f"Error computing TF-IDF: {e}")
        return vectorizer, None

tfidf_vectorizer, tfidf_matrix = compute_tfidf()

# Get user interactions
def get_user_interactions(user_address: str) -> Dict:
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("""
            SELECT model_id, interaction_type FROM user_interactions 
            WHERE user_address = ? ORDER BY timestamp DESC LIMIT 50
        """, (user_address,))
        rows = cursor.fetchall()
        interactions = {"viewed": [], "purchased": [], "favorited": [], "workflow": []}
        for model_id, interaction_type in rows:
            if interaction_type in interactions:
                interactions[interaction_type].append(model_id)
        logger.info(f"Retrieved interactions for user {user_address}")
        return interactions
    except Exception as e:
        logger.error(f"Error retrieving user interactions: {e}")
        return {"viewed": [], "purchased": [], "favorited": [], "workflow": []}
    finally:
        conn.close()

# Get search interactions
def get_search_interactions(user_address: str) -> List[Dict]:
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("""
            SELECT model_id, search_term, timestamp FROM search_interactions 
            WHERE user_address = ? ORDER BY timestamp DESC LIMIT 50
        """, (user_address,))
        rows = cursor.fetchall()
        searches = [{"model_id": row[0], "search_term": row[1], "timestamp": row[2]} for row in rows]
        logger.info(f"Retrieved search interactions for user {user_address}")
        return searches
    except Exception as e:
        logger.error(f"Error retrieving search interactions: {e}")
        return []
    finally:
        conn.close()

# Get interaction count for cache key
def get_interaction_count(user_address: str) -> int:
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM user_interactions WHERE user_address = ?", (user_address,))
        count = cursor.fetchone()[0]
        return count
    except Exception as e:
        logger.error(f"Error retrieving interaction count: {e}")
        return 0
    finally:
        conn.close()

# Get search interaction count for cache key
def get_search_interaction_count(user_address: str) -> int:
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM search_interactions WHERE user_address = ?", (user_address,))
        count = cursor.fetchone()[0]
        return count
    except Exception as e:
        logger.error(f"Error retrieving search interaction count: {e}")
        return 0
    finally:
        conn.close()

# Get recent search terms for cache key
def get_recent_search_terms(user_address: str) -> str:
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("""
            SELECT search_term FROM search_interactions 
            WHERE user_address = ? ORDER BY timestamp DESC LIMIT 10
        """, (user_address,))
        terms = [row[0] for row in cursor.fetchall() if row[0]]
        return hashlib.md5("".join(terms).encode()).hexdigest()
    except Exception as e:
        logger.error(f"Error retrieving recent search terms: {e}")
        return ""
    finally:
        conn.close()

# Collaborative filtering
def calculate_collaborative_score(model_id: int, user_interactions: Dict, all_users: List[str]) -> float:
    user_vector = np.zeros(len(models_db))
    for viewed in user_interactions["viewed"]:
        if viewed - 1 < len(models_db):
            user_vector[viewed - 1] = 1
    for purchased in user_interactions["purchased"]:
        if purchased - 1 < len(models_db):
            user_vector[purchased - 1] = 2
    for favorited in user_interactions["favorited"]:
        if favorited - 1 < len(models_db):
            user_vector[favorited - 1] = 1.5
    for workflow in user_interactions["workflow"]:
        if workflow - 1 < len(models_db):
            user_vector[workflow - 1] = 1.8

    similar_users_scores = []
    for other_user in all_users:
        if other_user != user_interactions.get("user_address"):
            other_interactions = get_user_interactions(other_user)
            other_vector = np.zeros(len(models_db))
            for viewed in other_interactions["viewed"]:
                if viewed - 1 < len(models_db):
                    other_vector[viewed - 1] = 1
            for purchased in other_interactions["purchased"]:
                if purchased - 1 < len(models_db):
                    other_vector[purchased - 1] = 2
            for favorited in other_interactions["favorited"]:
                if favorited - 1 < len(models_db):
                    other_vector[favorited - 1] = 1.5
            for workflow in other_interactions["workflow"]:
                if workflow - 1 < len(models_db):
                    other_vector[workflow - 1] = 1.8
            similarity = cosine_similarity([user_vector], [other_vector])[0][0]
            if similarity > 0:
                weight = 2 if model_id in other_interactions["purchased"] else 1.8 if model_id in other_interactions["workflow"] else 1.5 if model_id in other_interactions["favorited"] else 1
                similar_users_scores.append(similarity * weight)

    return np.mean(similar_users_scores) if similar_users_scores else 0

# Content-based filtering
def calculate_content_score(model: Dict, request: RecommendationRequest, search_interactions: List[Dict]) -> float:
    if tfidf_matrix is None:
        logger.warning("TF-IDF matrix is None, returning default content score")
        return 0.0
    # Combine current search term with past search terms
    query = request.search_term or ""
    past_terms = [s["search_term"] for s in search_interactions if s["search_term"]]
    if past_terms:
        query += " " + " ".join(past_terms[:5])  # Limit to 5 recent terms
    if request.preferred_categories:
        query += " " + " ".join(request.preferred_categories)
    if request.preferred_tags:
        query += " " + " ".join(request.preferred_tags)
    if not query.strip():
        return 0
    query_vec = tfidf_vectorizer.transform([query])
    model_idx = next(i for i, m in enumerate(models_db) if m["id"] == model["id"])
    similarity = cosine_similarity(query_vec, tfidf_matrix[model_idx:model_idx+1])[0][0]
    return similarity

# Relevance score
def calculate_relevance_score(model: Dict, request: RecommendationRequest, user_interactions: Dict, search_interactions: List[Dict], all_users: List[str]) -> float:
    score = 0.0
    content_score = calculate_content_score(model, request, search_interactions)
    score += 0.5 * content_score
    collab_score = calculate_collaborative_score(model["id"], user_interactions, all_users)
    score += 0.3 * collab_score
    if request.price_range[0] <= model["price"] <= request.price_range[1]:
        score += 0.2
    if model["id"] in user_interactions.get("viewed", []):
        score += 0.05
    if model["id"] in user_interactions.get("favorited", []):
        score += 0.075
    if model["id"] in user_interactions.get("purchased", []):
        score += 0.1
    if model["id"] in user_interactions.get("workflow", []):
        score += 0.15
    # Boost for searched models with recency and frequency
    search_count = sum(1 for s in search_interactions if s["model_id"] == model["id"])
    if search_count > 0:
        # Base boost for search interaction
        score += 0.3
        # Additional boost for frequency
        score += 0.05 * min(search_count, 5)  # Cap at 5 searches
        # Recency boost: +0.1 if searched within last 7 days
        recent_searches = [s for s in search_interactions if s["model_id"] == model["id"]]
        for search in recent_searches:
            search_time = datetime.strptime(search["timestamp"], "%Y-%m-%d %H:%M:%S")
            if datetime.now() - search_time < timedelta(days=7):
                score += 0.1
                break
    return score

@app.options("/recommend")
async def options_recommend():
    return {"status": "ok"}

@app.options("/sync_models")
async def options_sync_models():
    return {"status": "ok"}

@app.post("/recommend")
async def recommend(data: RecommendationRequest, request: Request):
    logger.debug(f"Received /recommend request: {data}, headers: {request.headers}")
    interaction_count = get_interaction_count(data.user_address) if data.user_address else 0
    search_interaction_count = get_search_interaction_count(data.user_address) if data.user_address else 0
    recent_search_hash = get_recent_search_terms(data.user_address) if data.user_address else ""
    cache_key = f"{data.user_address}:{data.search_term}:{','.join(data.preferred_categories or [])}:{','.join(data.preferred_tags or [])}:{data.price_range[0]}:{data.price_range[1]}:{data.top_n}:{interaction_count}:{search_interaction_count}:{recent_search_hash}"
    if cache_key in cache:
        logger.info(f"Returning cached recommendations for {cache_key}")
        return cache[cache_key]

    logger.info(f"Processing recommendation request: {data}")
    
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT user_address FROM user_interactions")
        all_users = [row[0] for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Error retrieving all users: {e}")
        all_users = []
    finally:
        conn.close()

    user_interactions = get_user_interactions(data.user_address) if data.user_address else {
        "viewed": [], "purchased": [], "favorited": [], "workflow": []
    }
    search_interactions = get_search_interactions(data.user_address) if data.user_address else []
    filtered_models = [m for m in models_db if data.price_range[0] <= m["price"] <= data.price_range[1]]
    scored_models = []
    for model in filtered_models:
        score = calculate_relevance_score(model, data, user_interactions, search_interactions, all_users)
        scored_models.append((model, score))
    scored_models.sort(key=lambda x: x[1], reverse=True)
    recommendations = [model for model, _ in scored_models[:data.top_n]]
    cache[cache_key] = {"recommendations": recommendations}
    return {"recommendations": recommendations}

@app.post("/log_interaction")
async def log_interaction(data: InteractionRequest, request: Request):
    logger.debug(f"Received /log_interaction request: {data}, headers: {request.headers}")
    if data.interaction_type not in ["view", "purchase", "favorite", "workflow", "search"]:
        raise HTTPException(status_code=400, detail="Invalid interaction type")
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        if data.interaction_type == "search" and data.search_term:
            cursor.execute("""
                INSERT INTO search_interactions (user_address, model_id, search_term)
                VALUES (?, ?, ?)
            """, (data.user_address, data.model_id, data.search_term))
        else:
            cursor.execute("""
                INSERT INTO user_interactions (user_address, model_id, interaction_type)
                VALUES (?, ?, ?)
            """, (data.user_address, data.model_id, data.interaction_type))
        conn.commit()
        logger.info(f"Logged {data.interaction_type} for user {data.user_address}, model {data.model_id}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error logging interaction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

@app.post("/sync_models")
async def sync_models(data: SyncModelsRequest, request: Request):
    logger.debug(f"Received /sync_models request: {data}, headers: {request.headers}")
    try:
        save_models_to_db(data.models)
        global models_db, tfidf_vectorizer, tfidf_matrix
        models_db = load_models()
        tfidf_vectorizer, tfidf_matrix = compute_tfidf()
        logger.info("Models synced and TF-IDF recomputed")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error syncing models: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)