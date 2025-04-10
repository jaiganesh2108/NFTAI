from lightfm import LightFM
import numpy as np

class Recommender:
    def __init__(self, users, items, interactions, user_features, item_features):
        self.users = users
        self.items = items
        self.interactions = interactions
        self.user_features = user_features
        self.item_features = item_features

        print("[model.py] Initializing LightFM model...")
        self.model = LightFM(loss='warp')

    def train(self, epochs=1):
        print("[train] Preparing training data...")
        try:
            self.model.fit(
                self.interactions,
                user_features=self.user_features,
                item_features=self.item_features,
                epochs=epochs,
                num_threads=1  # Safe threading
            )
            print("[train] Training completed inside train()")
        except Exception as e:
            print(f"[train] Error during training: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print("[train] Exiting train() method")

    def recommend(self, user_id, user_id_map, item_id_map):
        print(f"[recommend] Generating scores for user {user_id}...")

        internal_user_id = user_id_map[user_id]
        item_ids = list(item_id_map.values())  # list of internal item IDs

        scores = self.model.predict(
            user_ids=internal_user_id,
            item_ids=np.array(item_ids),
            user_features=self.user_features,
            item_features=self.item_features
        )

        item_index_map = {v: k for k, v in item_id_map.items()}
        item_score_pairs = list(zip([item_index_map[iid] for iid in item_ids], scores))
        ranked = sorted(item_score_pairs, key=lambda x: -x[1])
        return ranked
