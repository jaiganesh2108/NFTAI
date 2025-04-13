from lightfm.data import Dataset

def load_data():
    users = ['wallet1', 'wallet2', 'wallet3']

    # AI models with file type and tags
    items = [
        'stable-diffusion-v1',
        'gpt-codegen',
        'llama2-finetuned',
        'blockchain-model-x'
    ]

    # interactions = (user_id, item_id)
    interactions_raw = [
        ('wallet1', 'stable-diffusion-v1'),
        ('wallet2', 'gpt-codegen'),
        ('wallet3', 'blockchain-model-x'),
        ('wallet1', 'llama2-finetuned'),
    ]

    item_tags = {
        'stable-diffusion-v1': ['image-generation', 'diffusion', '.ckpt'],
        'gpt-codegen': ['code-generation', 'nlp', '.pt'],
        'llama2-finetuned': ['text-generation', 'fine-tuned', '.bin'],
        'blockchain-model-x': ['blockchain', 'security', '.zip']
    }

    dataset = Dataset()
    dataset.fit(users, items)

    interactions, _ = dataset.build_interactions(interactions_raw)

    user_features = dataset.build_user_features(((user, []) for user in users))

    # Use tags as item features
    item_features = dataset.build_item_features(
        ((item, item_tags[item]) for item in items)
    )

    user_id_map, user_feature_map, item_id_map, item_feature_map = dataset.mapping()

    return users, items, interactions, user_features, item_features, user_id_map, item_id_map, item_tags
