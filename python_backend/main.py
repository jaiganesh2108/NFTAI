from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import Dict, List
from collections import defaultdict
import numpy as np

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
    user_address: str | None = None
    preferred_categories: List[str] | None = None
    preferred_tags: List[str] | None = None
    price_range: List[int]
    top_n: int
    search_term: str | None = None

# In-memory user data (replace with database like SQLite/MongoDB in production)
user_data: Dict[str, Dict] = defaultdict(lambda: {
    "search_history": [],
    "viewed_models": [],
    "purchased_models": []
})

# In-memory model database
models_db = [
    # Same as provided
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
    # ... other models
]

def calculate_relevance_score(model: Dict, request: RecommendationRequest, user_history: Dict) -> float:
    """Calculate a relevance score for a model."""
    score = 0.0

    # Search term relevance (weight: 0.4)
    if request.search_term:
        search_lower = request.search_term.lower()
        if search_lower in model["name"].lower():
            score += 0.2
        if search_lower in model["description"].lower():
            score += 0.1
        if any(search_lower in tag.lower() for tag in model["tags"]):
            score += 0.1

    # Category match (weight: 0.2)
    if request.preferred_categories and model["category"] in request.preferred_categories:
        score += 0.2

    # Tag match (weight: 0.2)
    if request.preferred_tags:
        matching_tags = sum(1 for tag in model["tags"] if tag in request.preferred_tags)
        score += 0.2 * (matching_tags / max(len(request.preferred_tags), 1))

    # Price fit (weight: 0.1)
    if request.price_range[0] <= model["price"] <= request.price_range[1]:
        price_range_width = request.price_range[1] - request.price_range[0]
        if price_range_width > 0:
            price_fit = 1 - abs(model["price"] - (request.price_range[0] + request.price_range[1]) / 2) / price_range_width
            score += 0.1 * price_fit

    # User history (weight: 0.2)
    if user_history["search_history"]:
        history_terms = set(term.lower() for term in user_history["search_history"])
        if any(term in model["name"].lower() or term in model["description"].lower() for term in history_terms):
            score += 0.1
        if any(any(term in tag.lower() for tag in model["tags"]) for term in history_terms):
            score += 0.1

    # Trending/New bonus (weight: 0.1)
    if model["trending"]:
        score += 0.05
    if model["new"]:
        score += 0.05

    return score

@app.post("/recommend")
async def recommend(data: RecommendationRequest):
    logger.info(f"Received request data: {data}")

    # Update user search history
    if data.user_address and data.search_term:
        user_data[data.user_address]["search_history"].append(data.search_term)
        # Limit history to last 10 searches
        user_data[data.user_address]["search_history"] = user_data[data.user_address]["search_history"][-10:]

    # Get user history
    user_history = user_data.get(data.user_address, {"search_history": [], "viewed_models": [], "purchased_models": []})

    # Filter models by basic criteria
    filtered_models = models_db.copy()

    # Apply price range filter
    filtered_models = [m for m in filtered_models if data.price_range[0] <= m["price"] <= data.price_range[1]]

    # Calculate scores for each model
    scored_models = []
    for model in filtered_models:
        score = calculate_relevance_score(model, data, user_history)
        scored_models.append((model, score))

    # Sort by score and limit to top_n
    scored_models.sort(key=lambda x: x[1], reverse=True)
    recommendations = [model for model, _ in scored_models[:data.top_n]]

    return {"recommendations": recommendations}

# Optional: Endpoint to log viewed models
@app.post("/log_view")
async def log_view(data: dict):
    user_address = data.get("user_address")
    model_id = data.get("model_id")
    if user_address and model_id:
        if model_id not in user_data[user_address]["viewed_models"]:
            user_data[user_address]["viewed_models"].append(model_id)
            user_data[user_address]["viewed_models"] = user_data[user_address]["viewed_models"][-10:]  # Limit to 10
        logger.info(f"Logged view for user {user_address}, model {model_id}")
        return {"status": "success"}
    raise HTTPException(status_code=400, detail="Invalid request")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)