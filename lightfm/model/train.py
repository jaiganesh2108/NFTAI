from lightfm import LightFM
from lightfm.evaluation import precision_at_k
from model import Recommender

def train_model(interactions, user_features, item_features, epochs=10, num_threads=2):
    """
    Trains the LightFM model and returns the trained model instance.
    """
    model = LightFM(loss='warp')
    model.fit(interactions, user_features=user_features, item_features=item_features, epochs=epochs, num_threads=num_threads)
    
    return model

def evaluate_model(model, interactions, user_features, item_features, k=5):
    """
    Evaluates the model's precision@k.
    """
    precision = precision_at_k(model, interactions, user_features=user_features, item_features=item_features, k=k).mean()
    print(f"[✓] Model Precision@{k}: {precision:.4f}")
    return precision

def train_recommender(recommender: Recommender, epochs=10):
    print("[train] Preparing training data...")
    model = train_model(recommender.interactions, recommender.user_features, recommender.item_features, epochs)
    recommender.set_model(model)
    evaluate_model(model, recommender.interactions, recommender.user_features, recommender.item_features)
    return recommender
