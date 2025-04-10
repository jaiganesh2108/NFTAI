from lightfm.data import Dataset

def load_sample_data():
    users = ['user1', 'user2', 'user3']
    items = ['item1', 'item2', 'item3']

    interactions_raw = [
        ('user1', 'item1'),
        ('user2', 'item2'),
        ('user3', 'item3'),
    ]

    dataset = Dataset()
    dataset.fit(users, items)

    interactions, _ = dataset.build_interactions(interactions_raw)

    user_features = dataset.build_user_features(((user, []) for user in users))
    item_features = dataset.build_item_features(((item, []) for item in items))

    user_id_map, user_feature_map, item_id_map, item_feature_map = dataset.mapping()
    return users, items, interactions, user_features, item_features, user_id_map, item_id_map
