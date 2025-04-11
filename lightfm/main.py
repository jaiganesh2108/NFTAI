from model.model import Recommender
from model.train import train_recommender
from model.data_loader import load_real_data

def main():
    print(">>> [Main Entry] Starting Program")

    try:
        print("[•] Step 1: Initializing recommender system...")
        users, items, interactions, user_features, item_features, user_id_map, item_id_map = load_real_data()
        reco = Recommender(users, items, interactions, user_features, item_features)
        reco.user_id_map = user_id_map
        reco.item_id_map = item_id_map

        print("[•] Step 2: Training model...")
        train_recommender(reco, epochs=10)

        print("[✓] Recommender system is trained and ready!")

        # Example use
        sample_user = users[0]
        print(f"[→] Recommendations for user {sample_user}:")
        print(reco.recommend(sample_user))

    except Exception as e:
        print(f"[✗] A major error occurred: {e}")

    print(">>> [Main Exit] Program Finished")

if __name__ == "__main__":
    main()
