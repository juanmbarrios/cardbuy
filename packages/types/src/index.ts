// Tipos compartidos del dominio TCG — CardBuy

export type Game =
  | "POKEMON"
  | "MTG"
  | "YUGIOH"
  | "ONE_PIECE"
  | "LORCANA"
  | "DRAGON_BALL"
  | "FLESH_AND_BLOOD"
  | "DIGIMON"
  | "VANGUARD";

export type CardCondition =
  | "MINT"
  | "NEAR_MINT"
  | "EXCELLENT"
  | "GOOD"
  | "LIGHT_PLAYED"
  | "PLAYED"
  | "POOR";

export type CardLanguage =
  | "SPANISH"
  | "ENGLISH"
  | "JAPANESE"
  | "PORTUGUESE"
  | "FRENCH"
  | "GERMAN"
  | "ITALIAN"
  | "KOREAN"
  | "CHINESE_SIMPLIFIED"
  | "CHINESE_TRADITIONAL";

export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "RESERVED"
  | "SOLD"
  | "CANCELLED"
  | "EXPIRED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "DISPUTED";

export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
