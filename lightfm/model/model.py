from lightfm import LightFM
from lightfm.evaluation import precision_at_k
import numpy as np

class Recommender:
    def __init__(self, users, items, interactions, user_features, item_features, user_id_map, item_id_map, item_tags):
        print("[model.py] Initializing LightFM model...")
        self.model = LightFM(loss='warp')
        self.users = users
        self.items = items
        self.interactions = interactions
        self.user_features = user_features
        self.item_features = item_features
        self.user_id_map = user_id_map
        self.item_id_map = item_id_map
        self.item_tags = item_tags

    def train(self, epochs=10, num_threads=2):
        print("[train] Training model...")
        self.model.fit(
            self.interactions,
            user_features=self.user_features,
            item_features=self.item_features,
            epochs=epochs,
            num_threads=num_threads
        )
        print("[train] Model trained.")

    def recommend(self, user_id, top_n=5):
        print(f"[recommend] Recommending for user: {user_id}")
        user_index = self.user_id_map.get(user_id)
        if user_index is None:
            print("[recommend] User not found.")
            return []

        scores = self.model.predict(
            user_index,
            np.arange(len(self.items)),
            user_features=self.user_features,
            item_features=self.item_features
        )

        top_indices = np.argsort(-scores)[:top_n]
        recommended_items = [self.items[i] for i in top_indices]
        print(f"[recommend] Top {top_n} items: {recommended_items}")
        return recommended_items

    def get_item_info(self, item_id):
        tags = self.item_tags.get(item_id, [])
        return {
            'item_id': item_id,
            'tags': tags
        }

    def evaluate_precision(self, test_interactions):
        score = precision_at_k(self.model, test_interactions, k=3).mean()
        print(f"[evaluate] Precision@3: {score}")
        return score
