from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from model import Recommender
from train import train_recommender
from data_loader import load_real_data

app = FastAPI(title="AI Model Recommender API")

# Load real dataset and train model at startup
users, items, interactions, user_features, item_features, user_id_map, item_id_map = load_real_data()
reco = Recommender(users, items, interactions, user_features, item_features)
reco.user_id_map = user_id_map
reco.item_id_map = item_id_map
train_recommender(reco, epochs=10)

class RecommendRequest(BaseModel):
    user_id: str
    num_items: int = 5

@app.get("/")
def home():
    return {"message": "AI Model Recommender is running"}

@app.post("/recommend")
def recommend(request: RecommendRequest):
    try:
        recommendations = reco.recommend(request.user_id, request.num_items)
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
