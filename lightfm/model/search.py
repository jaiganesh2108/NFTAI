def search_items(query, items_metadata):
    keywords = query.lower().split()
    results = []

    for item in items_metadata:
        name = item['name'].lower()
        tags = [tag.lower() for tag in item['tags']]
        score = sum(1 for kw in keywords if kw in name or kw in tags)

        if score > 0:
            results.append((score, item))

    results.sort(reverse=True, key=lambda x: x[0])
    return [item for score, item in results]
