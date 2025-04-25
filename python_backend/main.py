from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import Dict, List, Optional
from pymongo import MongoClient
from cachetools import TTLCache
from web3 import Web3
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from datetime import datetime, timedelta
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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

# MongoDB Atlas setup
MONGO_URI = "mongodb+srv://jaig7335:lO5ooxCd7T401NDI@marketplace.wfnlm0a.mongodb.net/?retryWrites=true&w=majority&appName=marketplace"
client = MongoClient(MONGO_URI)
db = client["marketplace"]
models_collection = db["models"]
interactions_collection = db["user_interactions"]
search_interactions_collection = db["search_interactions"]

# Blockchain setup
INFURA_PROJECT_ID = os.getenv("INFURA_PROJECT_ID")
if not INFURA_PROJECT_ID:
    raise ValueError("INFURA_PROJECT_ID environment variable not set")
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
    search_term: Optional[str] = None

class GetInteractionsRequest(BaseModel):
    user_address: str

# Initialize MongoDB collections
def init_db():
    try:
        models_collection.create_index("id", unique=True)
        interactions_collection.create_index([("user_address", 1), ("model_id", 1), ("interaction_type", 1)])
        search_interactions_collection.create_index([("user_address", 1), ("model_id", 1), ("search_term", 1)])
        logger.info("MongoDB initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing MongoDB: {e}")
        raise

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
            formatted_model = {
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
                "uploader": model[7],
                "timestamp": datetime.fromtimestamp(model[8]) if model[8] else datetime.now()
            }
            formatted_models.append(formatted_model)
        logger.info(f"Fetched {len(formatted_models)} models from blockchain")
        return formatted_models
    except Exception as e:
        logger.error(f"Error fetching blockchain models: {e}")
        return []

# Load models from MongoDB
def load_models():
    try:
        models = list(models_collection.find())
        for model in models:
            model["tags"] = model["tags"] if isinstance(model["tags"], list) else model["tags"].split(",")
            model["isNFT"] = bool(model["isNFT"])
            if "timestamp" in model and isinstance(model["timestamp"], datetime):
                model["timestamp"] = model["timestamp"].isoformat()
        logger.debug(f"Number of models loaded: {len(models)}")
        return models
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return []

# Save models to MongoDB
def save_models_to_db(models):
    try:
        models_collection.delete_many({})
        for model in models:
            model["tags"] = ",".join(model["tags"]) if isinstance(model["tags"], list) else model["tags"]
            model["isNFT"] = int(model["isNFT"])
            if "timestamp" in model and isinstance(model["timestamp"], str):
                model["timestamp"] = datetime.fromisoformat(model["timestamp"])
            models_collection.insert_one(model)
        logger.info(f"Saved {len(models)} models to MongoDB")
    except Exception as e:
        logger.error(f"Error saving models to MongoDB: {e}")
        raise

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
        interactions = interactions_collection.find({"user_address": user_address}).sort("timestamp", -1).limit(50)
        result = {"viewed": [], "purchased": [], "favorited": [], "workflow": []}
        for interaction in interactions:
            if interaction["interaction_type"] in result:
                result[interaction["interaction_type"]].append(interaction["model_id"])
        logger.info(f"Retrieved interactions for user {user_address}")
        return result
    except Exception as e:
        logger.error(f"Error retrieving user interactions: {e}")
        return {"viewed": [], "purchased": [], "favorited": [], "workflow": []}

# Get search interactions
def get_search_interactions(user_address: str) -> List[Dict]:
    try:
        searches = list(search_interactions_collection.find({"user_address": user_address}).sort("timestamp", -1).limit(50))
        logger.info(f"Retrieved search interactions for user {user_address}")
        return searches
    except Exception as e:
        logger.error(f"Error retrieving search interactions: {e}")
        return []

# Get interaction count for cache key
def get_interaction_count(user_address: str) -> int:
    try:
        count = interactions_collection.count_documents({"user_address": user_address})
        return count
    except Exception as e:
        logger.error(f"Error retrieving interaction count: {e}")
        return 0

# Get search interaction count for cache key
def get_search_interaction_count(user_address: str) -> int:
    try:
        count = search_interactions_collection.count_documents({"user_address": user_address})
        return count
    except Exception as e:
        logger.error(f"Error retrieving search interaction count: {e}")
        return 0

# Get recent search terms for cache key
def get_recent_search_terms(user_address: str) -> str:
    try:
        searches = list(search_interactions_collection.find({"user_address": user_address}).sort("timestamp", -1).limit(10))
        terms = [s["search_term"] for s in searches if s["search_term"]]
        return hashlib.md5("".join(terms).encode()).hexdigest()
    except Exception as e:
        logger.error(f"Error retrieving recent search terms: {e}")
        return ""

# Content-based filtering
def calculate_content_score(model: Dict, request: RecommendationRequest, search_interactions: List[Dict]) -> float:
    if tfidf_matrix is None:
        logger.warning("TF-IDF matrix is None, returning 0.0")
        return 0.0
    
    # Build query with strong emphasis on search terms
    query_parts = []
    if request.search_term:
        query_parts.append(request.search_term * 4)  # Quadruple weight for current search
    past_searches = sorted(
        search_interactions,
        key=lambda x: datetime.fromisoformat(x["timestamp"]),
        reverse=True
    )[:5]  # Last 5 searches
    past_terms = [s["search_term"] for s in past_searches if s["search_term"]]
    if past_terms:
        query_parts.append(" ".join(past_terms * 2))  # Double weight for past searches
    if request.preferred_categories:
        query_parts.append(" ".join(request.preferred_categories))
    if request.preferred_tags:
        query_parts.append(" ".join(request.preferred_tags))
    
    query = " ".join(query_parts).strip()
    if not query:
        return 0.0
    
    query_vec = tfidf_vectorizer.transform([query])
    model_idx = next(i for i, m in enumerate(models_db) if m["id"] == model["id"])
    similarity = cosine_similarity(query_vec, tfidf_matrix[model_idx:model_idx+1])[0][0]
    
    # Boost for exact matches
    if request.search_term:
        search_lower = request.search_term.lower()
        if search_lower in model["name"].lower() or (model["description"] and search_lower in model["description"].lower()):
            similarity += 0.7  # Stronger boost for exact matches
    return similarity * 4.0  # Amplify content relevance

# Collaborative filtering
def calculate_collaborative_score(model_id: int, user_interactions: Dict, all_users: List[str]) -> float:
    # Skip for users with no meaningful interactions
    if not any(user_interactions[key] for key in ["viewed", "purchased", "favorited", "workflow"]):
        return 0.0
    
    user_vector = np.zeros(len(models_db))
    for interaction_type, weight in [("viewed", 1), ("purchased", 2), ("favorited", 1.5), ("workflow", 1.8)]:
        for mid in user_interactions[interaction_type]:
            if mid - 1 < len(models_db):
                user_vector[mid - 1] = weight
    
    similar_users_scores = []
    sampled_users = all_users[:20]  # Limit to 20 users for performance
    for other_user in sampled_users:
        if other_user != user_interactions.get("user_address"):
            other_interactions = get_user_interactions(other_user)
            other_vector = np.zeros(len(models_db))
            for interaction_type, weight in [("viewed", 1), ("purchased", 2), ("favorited", 1.5), ("workflow", 1.8)]:
                for mid in other_interactions[interaction_type]:
                    if mid - 1 < len(models_db):
                        other_vector[mid - 1] = weight
            similarity = cosine_similarity([user_vector], [other_vector])[0][0]
            if similarity > 0 and model_id in other_interactions["viewed"]:
                weight = 2 if model_id in other_interactions["purchased"] else 1.5 if model_id in other_interactions["favorited"] else 1
                similar_users_scores.append(similarity * weight)
    
    return np.mean(similar_users_scores) if similar_users_scores else 0.0

# Relevance score
def calculate_relevance_score(model: Dict, request: RecommendationRequest, user_interactions: Dict, search_interactions: List[Dict], all_users: List[str]) -> float:
    score = 0.0
    
    # Content-based score (dominant factor)
    content_score = calculate_content_score(model, request, search_interactions)
    score += 0.85 * content_score  # High weight for search relevance
    
    # Collaborative score (minimal for sparse users)
    collab_score = calculate_collaborative_score(model["id"], user_interactions, all_users)
    score += 0.1 * collab_score
    
    # Price range match
    if request.price_range[0] <= model["price"] <= request.price_range[1]:
        score += 0.05
    
    # Interaction-based boosts
    for interaction_type, boost in [("viewed", 0.1), ("favorited", 0.2), ("purchased", 0.3), ("workflow", 0.4)]:
        if model["id"] in user_interactions.get(interaction_type, []):
            score += boost
    
    # Search interaction boosts
    search_count = sum(1 for s in search_interactions if s["model_id"] == model["id"])
    if search_count > 0:
        score += 0.6 + 0.3 * min(search_count, 5)  # Stronger boost for search frequency
        recent_searches = [s for s in search_interactions if s["model_id"] == model["id"]]
        for search in recent_searches:
            search_time = datetime.fromisoformat(search["timestamp"])
            if datetime.now() - search_time < timedelta(days=7):
                score += 0.5  # Strong recency boost
                break
    
    # Category and tag matching
    if request.preferred_categories and model["category"] in request.preferred_categories:
        score += 0.4
    if request.preferred_tags and any(tag in model["tags"] for tag in request.preferred_tags):
        score += 0.3
    
    return score

@app.options("/recommend")
async def options_recommend():
    return {"status": "ok"}

@app.options("/sync_models")
async def options_sync_models():
    return {"status": "ok"}

@app.options("/get_interactions")
async def options_get_interactions():
    return {"status": "ok"}

@app.post("/recommend")
async def recommend(data: RecommendationRequest, request: Request):
    logger.debug(f"Received /recommend request: {data}, headers: {request.headers}")
    
    # Simplified cache key
    interaction_count = get_interaction_count(data.user_address) if data.user_address else 0
    search_interaction_count = get_search_interaction_count(data.user_address) if data.user_address else 0
    cache_key = f"{data.user_address}:{data.search_term}:{data.price_range[0]}:{data.price_range[1]}:{data.top_n}:{interaction_count}:{search_interaction_count}"
    if cache_key in cache:
        logger.info(f"Returning cached recommendations for {cache_key}")
        return cache[cache_key]
    
    logger.info(f"Processing recommendation request: {data}")
    
    # Fetch unique users
    try:
        all_users = [doc["user_address"] for doc in interactions_collection.distinct("user_address")]
    except Exception as e:
        logger.error(f"Error retrieving all users: {e}")
        all_users = []
    
    # Get user interactions and search history
    user_interactions = get_user_interactions(data.user_address) if data.user_address else {
        "viewed": [], "purchased": [], "favorited": [], "workflow": []
    }
    search_interactions = get_search_interactions(data.user_address) if data.user_address else []
    
    # Filter models by price range and relevance
    filtered_models = []
    for model in models_db:
        if data.price_range[0] <= model["price"] <= data.price_range[1]:
            # Include only relevant models
            is_relevant = False
            if search_interactions and any(s["model_id"] == model["id"] for s in search_interactions):
                is_relevant = True
            elif request.search_term and request.search_term.lower() in (model["name"] + (model["description"] or "")).lower():
                is_relevant = True
            elif any(model["id"] in user_interactions[key] for key in user_interactions):
                is_relevant = True
            elif request.preferred_categories and model["category"] in request.preferred_categories:
                is_relevant = True
            elif request.preferred_tags and any(tag in model["tags"] for tag in request.preferred_tags):
                is_relevant = True
            if is_relevant:
                filtered_models.append(model)
    
    if not filtered_models:
        logger.info("No relevant models found within price range")
        return {"recommendations": []}
    
    # Score and rank models
    scored_models = []
    for model in filtered_models:
        score = calculate_relevance_score(model, data, user_interactions, search_interactions, all_users)
        if score > 0:  # Only include models with positive relevance
            scored_models.append((model, score))
    
    # Sort by score and select top N
    scored_models.sort(key=lambda x: x[1], reverse=True)
    recommendations = [model for model, _ in scored_models[:data.top_n]]
    
    # If no recommendations but search history exists, prioritize past searched models
    if not recommendations and search_interactions:
        past_searched_ids = {s["model_id"] for s in search_interactions}
        recommendations = [
            m for m in filtered_models if m["id"] in past_searched_ids
        ][:data.top_n]
    
    # Log and cache results
    logger.info(f"Generated {len(recommendations)} recommendations")
    cache[cache_key] = {"recommendations": recommendations}
    return {"recommendations": recommendations}

@app.post("/log_interaction")
async def log_interaction(data: InteractionRequest, request: Request):
    logger.debug(f"Received /log_interaction request: {data}, headers: {request.headers}")
    if data.interaction_type not in ["view", "purchase", "favorite", "workflow", "search"]:
        raise HTTPException(status_code=400, detail="Invalid interaction type")
    try:
        if data.interaction_type == "search" and data.search_term:
            search_interactions_collection.insert_one({
                "user_address": data.user_address,
                "model_id": data.model_id,
                "search_term": data.search_term,
                "timestamp": datetime.now()
            })
        else:
            interactions_collection.insert_one({
                "user_address": data.user_address,
                "model_id": data.model_id,
                "interaction_type": data.interaction_type,
                "timestamp": datetime.now()
            })
        logger.info(f"Logged {data.interaction_type} for user {data.user_address}, model {data.model_id}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error logging interaction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

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

@app.post("/get_interactions")
async def get_interactions(data: GetInteractionsRequest, request: Request):
    logger.debug(f"Received /get_interactions request: {data}, headers: {request.headers}")
    try:
        user_interactions = get_user_interactions(data.user_address)
        search_interactions = get_search_interactions(data.user_address)
        response = {
            "user_interactions": user_interactions,
            "search_interactions": [
                {
                    "model_id": s["model_id"],
                    "search_term": s["search_term"],
                    "timestamp": s["timestamp"].isoformat()
                } for s in search_interactions
            ]
        }
        logger.info(f"Retrieved interactions for user {data.user_address}")
        return response
    except Exception as e:
        logger.error(f"Error retrieving interactions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)