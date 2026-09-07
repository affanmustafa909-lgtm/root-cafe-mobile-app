export type Role = 'OWNER' | 'MANAGER' | 'STAFF' | 'CUSTOMER';
export type OrderStatus =
  | 'RECEIVED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'DECLINED';
export type PaymentMethod = 'PAY_AT_CAFE';
export type PaymentStatus = 'UNPAID' | 'PAID';
export type PickupType = 'ASAP' | 'SCHEDULED';
export type SelectionType = 'SINGLE' | 'MULTI';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  features: { reporting: boolean; [key: string]: boolean };
}

export interface OrderItemCustomization {
  name: string;
  option: string;
  price?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  customizations?: OrderItemCustomization[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customer?: { id?: string; name: string; phone?: string; email?: string };
  pickupType?: PickupType;
  pickupDate?: string | null;
  pickupTime?: string | null;
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  total: number;
  paymentStatus?: PaymentStatus | string;
  paymentMethod?: PaymentMethod | string;
  notes?: string | null;
  createdAt: string;
  statusChangedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string | null;
  sortOrder?: number;
  active?: boolean;
  isActive?: boolean;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  additionalPrice?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  required?: boolean;
  isRequired?: boolean;
  selectionType?: SelectionType;
  maxSelections?: number | null;
  active?: boolean;
  isActive?: boolean;
  options: CustomizationOption[];
}

export interface ProductCustomizationLink {
  groupId: string;
  sortOrder?: number;
  group: CustomizationGroup;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  categoryId?: string;
  category?: Category;
  imageUrl?: string | null;
  imageUrlHot?: string | null;
  imageUrlCold?: string | null;
  allergens?: string | null;
  soldOut?: boolean;
  isSoldOut?: boolean;
  isAvailable?: boolean;
  isTopSale?: boolean;
  discountPercent?: number | null;
  compareAtPrice?: number | null;
  active?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  customizationGroups?: ProductCustomizationLink[];
}

export interface CakeOfTheDay {
  id: string;
  date: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  productId?: string | null;
  product?: Product | null;
}

export interface AppSettings {
  currency: string;
  taxRate: number;
  timezone: string;
  homeBannerImageUrl?: string | null;
  stampCard?: {
    enabled: boolean;
    stampsRequired: number;
    title: string;
    subtitle: string;
  };
  pickup: {
    openTime: string;
    closeTime: string;
    slotIntervalMinutes: number;
    maxDaysAhead: number;
    asapEstimateMinutes: number | null;
  };
}

export interface StampCardStatus {
  enabled: boolean;
  stampsRequired: number;
  title: string;
  subtitle: string;
  stamps: number;
  stampsTowardReward: number;
  freeDrinkAvailable: boolean;
  freeDrinksEarned: number;
}

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  optionIds: string[];
}

export interface CreateOrderPayload {
  pickupType: PickupType;
  pickupDate?: string;
  pickupTime?: string;
  notes?: string;
  redeemFreeDrink?: boolean;
  items: CreateOrderItemPayload[];
}
