from recommender.model import Recommender
from recommender.sample_data import load_sample_data
from recommender.utils import show_recommendations, visualize_recommendations
import traceback

def main():
    try:
        print("[•] Step 1: Initializing recommender system...")
        reco = users, items, interactions, user_features, item_features, user_id_map, item_id_map = load_sample_data()
        reco = Recommender(users, items, interactions, user_features, item_features)
        reco.user_id_map = user_id_map
        reco.item_id_map = item_id_map


        print("[•] Step 2: Training model...")
        reco.train(epochs=1)
        print("[DEBUG] Checking if model exists: ", hasattr(reco, 'model'))
        print("[DEBUG] Training likely succeeded")
        print("[✓] Step 3: Training complete.")

        all_recommendations = {}

        print("[•] Step 4: Generating recommendations...")
        for user_id in users:
            ranked = reco.recommend(user_id, user_id_map, item_id_map)
            all_recommendations[user_id] = ranked
            show_recommendations(user_id, ranked)
        print("[✓] Step 5: Recommendations generated.")

        print("[•] Step 6: Visualizing recommendations...")
        try:
            visualize_recommendations(all_recommendations)
            print("[✓] Step 7: Visualization done.")
        except Exception as viz_err:
            print(f"[✗] Visualization failed: {viz_err}")

        print("[✓] Step 8: All tasks completed successfully.")

    except Exception as e:
        print(f"[✗] A major error occurred: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    print(">>> [Main Entry] Starting Program")
    main()
    print(">>> [Main Exit] Program Finished")
