import matplotlib
matplotlib.use('TkAgg')

import matplotlib.pyplot as plt

def show_recommendations(user_id, ranked_items):
    print(f"\nTop recommendations for {user_id}:")
    for item_id, score in ranked_items:
        print(f"  {item_id} (score: {score:.4f})")

def visualize_recommendations(all_recommendations):
    import matplotlib.pyplot as plt

    plt.figure(figsize=(10, 5))
    for idx, (user_id, recs) in enumerate(all_recommendations.items()):
        item_labels = [item_id for item_id, _ in recs]
        scores = [score for _, score in recs]
        plt.subplot(1, len(all_recommendations), idx + 1)
        plt.bar(item_labels, scores, color='skyblue')
        plt.title(f"User: {user_id}")
        plt.xticks(rotation=45)
        plt.ylabel("Score")
    plt.tight_layout()

    # Comment out this line:
    # plt.show()
    print("[✓] Visualization data prepared, skipped plt.show() to avoid crash.")
    plt.savefig("recommendations.png")
    print("[✓] Visualization saved to recommendations.png")


