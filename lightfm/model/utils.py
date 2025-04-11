import re
from difflib import get_close_matches

def search_items(items, query, item_tags, top_n=10):
    """
    Search items by name or tags using fuzzy matching.
    """
    query = query.lower()
    matches = []

    for item in items:
        item_id = item.lower()
        tags = item_tags.get(item, [])
        tags_str = " ".join(tags).lower()

        if query in item_id or query in tags_str:
            matches.append(item)

        # Also consider fuzzy matching
        elif get_close_matches(query, [item_id] + tags, n=1, cutoff=0.6):
            matches.append(item)

    return list(set(matches))[:top_n]

def filter_items_by_extension(items, extensions, item_tags):
    """
    Filter items based on file extensions (e.g., .pt, .zip, .onnx).
    """
    extensions = [ext.lower() for ext in extensions]
    filtered = []

    for item in items:
        tags = item_tags.get(item, [])
        file_exts = [tag.lower() for tag in tags if tag.startswith(".")]
        if any(ext in file_exts for ext in extensions):
            filtered.append(item)

    return filtered
