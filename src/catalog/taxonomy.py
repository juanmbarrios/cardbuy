"""Taxonomy reference data for TCG Marketplace."""

from .models import Condition, Language

# Base taxonomy for domain model
taxonomy_data = {
    "conditions": [c.value for c in Condition],
    "languages": [l.value for l in Language],
    "core_entities": ["game", "set", "card", "card_variant", "inventory_record"],
    "catalog_attributes": {
        "game": ["name", "slug", "release_year", "description"],
        "set": ["game_id", "name", "slug", "code", "release_date"],
        "card": ["set_id", "name", "collector_number", "language", "condition", "price", "quantity"],
    },
}
