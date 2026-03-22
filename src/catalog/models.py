"""Domain models for catalog and taxonomy."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List, Optional


class Condition(str, Enum):
    MINT = "mint"
    NEAR_MINT = "near_mint"
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class Language(str, Enum):
    EN = "en"
    ES = "es"
    JP = "jp"
    FR = "fr"
    DE = "de"
    IT = "it"


@dataclass
class Game:
    id: str
    name: str
    slug: str
    release_year: Optional[int] = None
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class Set:
    id: str
    game_id: str
    name: str
    slug: str
    code: Optional[str] = None
    release_date: Optional[datetime] = None
    description: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class CardVariant:
    id: str
    card_id: str
    name: str
    rarity: Optional[str] = None
    is_foil: bool = False
    alternate_art: bool = False
    extra_attributes: dict = field(default_factory=dict)


@dataclass
class Card:
    id: str
    set_id: str
    name: str
    collector_number: str
    language: Language
    condition: Condition
    price: float = 0.0
    quantity: int = 0
    variants: List[CardVariant] = field(default_factory=list)
    attributes: dict = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class InventoryRecord:
    id: str
    card_id: str
    seller_id: str
    quantity: int
    condition: Condition
    language: Language
    price: float
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
