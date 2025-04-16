from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import Dict, List, Optional 
from collections import defaultdict
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import sqlite3
from cachetools import TTLCache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request validation
class RecommendationRequest(BaseModel):
    user_address: Optional[str] = None
    preferred_categories: Optional[List[str]] = None
    preferred_tags: Optional[List[str]] = None
    price_range: List[int]
    top_n: int
    search_term: Optional[str] = None

# Database setup (SQLite)
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
            CREATE TABLE IF NOT EXISTS models (
                id INTEGER PRIMARY KEY,
                name TEXT,
                category TEXT,
                tags TEXT,
                price INTEGER,
                rating REAL,
                reputation TEXT,
                description TEXT,
                usageCount TEXT,
                trending INTEGER,
                new INTEGER,
                image TEXT,
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

# Initialize database
init_db()

# In-memory cache (TTL: 1 hour)
cache = TTLCache(maxsize=100, ttl=3600)

# Model database (loaded from SQLite)
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
            model["trending"] = bool(model["trending"])
            model["new"] = bool(model["new"])
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
                INSERT INTO models (id, name, category, tags, price, rating, reputation, description, usageCount, trending, new, image, isNFT, blockchain, owner, ipfsHash, uploader)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                model["id"], model["name"], model["category"], ",".join(model["tags"]), model["price"], model["rating"],
                model["reputation"], model["description"], model["usageCount"], int(model["trending"]), int(model["new"]),
                model["image"], int(model["isNFT"]), model["blockchain"], model["owner"], model["ipfsHash"], model["uploader"]
            ))
        conn.commit()
        logger.info("Sample models saved to database")
    except Exception as e:
        logger.error(f"Error saving models to database: {e}")
        raise
    finally:
        conn.close()

# Sample data
sample_models = [
    {
        "id": 1,
        "name": "NeuralText Pro",
        "category": "Text Generation",
        "tags": ["GPT", "Text", "Generative"],
        "price": 299,
        "rating": 4.8,
        "reputation": "High",
        "description": "Advanced language model for creative writing and content generation with support for multiple languages.",
        "usageCount": "13.2k",
        "trending": True,
        "new": False,
        "image": "http://example.com/image1.jpg",
        "isNFT": True,
        "blockchain": "Ethereum",
        "owner": "0x1234...abcd",
        "ipfsHash": "Qm...abcd",
        "uploader": "0x1234abcd5678efgh9012ijkl"
    },
    {
        "id": 2,
        "name": "VisionAI Studio",
        "category": "Image Recognition",
        "tags": ["Vision", "Recognition", "CNN"],
        "price": 499,
        "rating": 4.6,
        "reputation": "High",
        "description": "State-of-the-art computer vision model for object detection, image classification, and scene understanding.",
        "usageCount": "8.7k",
        "trending": True,
        "new": True,
        "image": "http://example.com/image2.jpg",
        "isNFT": False,
        "blockchain": None,
        "owner": None,
        "ipfsHash": None,
        "uploader": "0x5678efgh9012ijkl3456mnop"
    },
    {
        "id": 3,
        "name": "SynthWave Audio",
        "category": "Audio Processing",
        "tags": ["Audio", "Speech", "Generation"],
        "price": 199,
        "rating": 4.3,
        "reputation": "Medium",
        "description": "Audio generation and processing system for creating realistic speech, music, and sound effects.",
        "usageCount": "5.4k",
        "trending": False,
        "new": True,
        "image": "http://example.com/image3.jpg",
        "isNFT": True,
        "blockchain": "Polygon",
        "owner": "0x5678...efgh",
        "ipfsHash": "Qm...efgh",
        "uploader": "0x9012ijkl3456mnop7890qrst"
    },
    {
        "id": 4,
        "name": "DataMiner Pro",
        "category": "Data Analysis",
        "tags": ["Analytics", "Prediction", "ML"],
        "price": 399,
        "rating": 4.5,
        "reputation": "High",
        "description": "Machine learning model for advanced data analytics, pattern recognition, and predictive modeling.",
        "usageCount": "7.1k",
        "trending": False,
        "new": False,
        "image": "http://example.com/image4.jpg",
        "isNFT": False,
        "blockchain": None,
        "owner": None,
        "ipfsHash": None,
        "uploader": "0x3456mnop7890qrst1234abcd"
    }
]

# Load or initialize models
models_db = load_models()
if not models_db:
    logger.info("No models found in database, initializing with sample data")
    models_db = sample_models
    save_models_to_db(models_db)
    models_db = load_models()

# Precompute TF-IDF for model descriptions and tags
def compute_tfidf():
    corpus = [f"{model['name']} {model['description']} {' '.join(model['tags'])}" for model in models_db]
    if not corpus or all(not doc.strip() for doc in corpus):
        logger.warning("Empty or invalid corpus, returning empty TF-IDF matrix")
        return TfidfVectorizer(stop_words=None), None
    vectorizer = TfidfVectorizer(stop_words=None)  # Disabled stop words to avoid empty vocabulary
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
        logger.info("TF-IDF matrix computed successfully")
        return vectorizer, tfidf_matrix
    except ValueError as e:
        logger.error(f"Error computing TF-IDF: {e}")
        return vectorizer, None

tfidf_vectorizer, tfidf_matrix = compute_tfidf()

def get_user_interactions(user_address: str) -> Dict:
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("""
            SELECT model_id, interaction_type FROM user_interactions 
            WHERE user_address = ? ORDER BY timestamp DESC LIMIT 50
        """, (user_address,))
        rows = cursor.fetchall()
        interactions = {"viewed": [], "purchased": [], "favorited": []}
        for model_id, interaction_type in rows:
            if interaction_type in interactions:
                interactions[interaction_type].append(model_id)
        logger.info(f"Retrieved interactions for user {user_address}")
        return interactions
    except Exception as e:
        logger.error(f"Error retrieving user interactions: {e}")
        return {"viewed": [], "purchased": [], "favorited": []}
    finally:
        conn.close()

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
            similarity = cosine_similarity([user_vector], [other_vector])[0][0]
            if similarity > 0:
                similar_users_scores.append(similarity * (1 if model_id in other_interactions["purchased"] else 0.5))

    return np.mean(similar_users_scores) if similar_users_scores else 0

def calculate_content_score(model: Dict, request: RecommendationRequest) -> float:
    if tfidf_matrix is None:
        logger.warning("TF-IDF matrix is None, returning default content score")
        return 0.0
    query = f"{request.search_term or ''} {' '.join(request.preferred_tags or [])}"
    if request.preferred_categories:
        query += " " + " ".join(request.preferred_categories)
    if not query.strip():
        return 0
    query_vec = tfidf_vectorizer.transform([query])
    model_idx = next(i for i, m in enumerate(models_db) if m["id"] == model["id"])
    similarity = cosine_similarity(query_vec, tfidf_matrix[model_idx:model_idx+1])[0][0]
    return similarity

def calculate_relevance_score(model: Dict, request: RecommendationRequest, user_interactions: Dict, all_users: List[str]) -> float:
    score = 0.0
    content_score = calculate_content_score(model, request)
    score += 0.4 * content_score
    collab_score = calculate_collaborative_score(model["id"], user_interactions, all_users)
    score += 0.3 * collab_score
    if request.price_range[0] <= model["price"] <= request.price_range[1]:
        price_range_width = request.price_range[1] - request.price_range[0]
        if price_range_width > 0:
            price_fit = 1 - abs(model["price"] - (request.price_range[0] + request.price_range[1]) / 2) / price_range_width
            score += 0.1 * price_fit
    score += 0.05 * (model["rating"] / 5.0)
    reputation_scores = {"High": 1.0, "Medium": 0.5, "Low": 0.2}
    score += 0.05 * reputation_scores.get(model["reputation"], 0.2)
    if model["trending"]:
        score += 0.05
    if model["new"]:
        score += 0.05
    return score

@app.post("/recommend")
async def recommend(data: RecommendationRequest):
    cache_key = f"{data.user_address}:{data.search_term}:{','.join(data.preferred_categories or [])}:{','.join(data.preferred_tags or [])}:{data.price_range[0]}:{data.price_range[1]}:{data.top_n}"
    if cache_key in cache:
        logger.info(f"Returning cached recommendations for {cache_key}")
        return cache[cache_key]

    logger.info(f"Received recommendation request: {data}")
    if data.user_address and data.search_term:
        try:
            conn = sqlite3.connect("marketplace.db")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO user_interactions (user_address, model_id, interaction_type) 
                VALUES (?, ?, 'search')
            """, (data.user_address, 0))
            conn.commit()
            logger.info(f"Logged search for user {data.user_address}")
        except Exception as e:
            logger.error(f"Error logging search: {e}")
        finally:
            conn.close()

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
        "viewed": [], "purchased": [], "favorited": []
    }
    filtered_models = [m for m in models_db if data.price_range[0] <= m["price"] <= data.price_range[1]]
    scored_models = []
    for model in filtered_models:
        score = calculate_relevance_score(model, data, user_interactions, all_users)
        scored_models.append((model, score))
    scored_models.sort(key=lambda x: x[1], reverse=True)
    recommendations = [model for model, _ in scored_models[:data.top_n]]
    cache[cache_key] = {"recommendations": recommendations}
    return {"recommendations": recommendations}

@app.post("/log_interaction")
async def log_interaction(data: dict):
    user_address = data.get("user_address")
    model_id = data.get("model_id")
    interaction_type = data.get("interaction_type")
    if not all([user_address, model_id, interaction_type in ["view", "purchase", "favorite"]]):
        raise HTTPException(status_code=400, detail="Invalid request")
    try:
        conn = sqlite3.connect("marketplace.db")
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_interactions (user_address, model_id, interaction_type)
            VALUES (?, ?, ?)
        """, (user_address, model_id, interaction_type))
        conn.commit()
        logger.info(f"Logged {interaction_type} for user {user_address}, model {model_id}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error logging interaction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)