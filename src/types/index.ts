import type {
  AppSettings,
  CakeOfTheDay,
  Category,
  CustomizationGroup,
  Order,
  OrderItem,
  Product,
  User,
} from './shared';

export type {
  AppSettings,
  CakeOfTheDay,
  Category,
  CreateOrderPayload,
  CustomizationGroup,
  CustomizationOption,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PickupType,
  Product,
  ProductCustomizationLink,
  SelectionType,
  StampCardStatus,
  User,
} from './shared';

export interface CartOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  additionalPrice: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  basePrice: number;
  quantity: number;
  selectedOptions: CartOption[];
  lineTotal: number;
}

export type ApiOrderItem = {
  id: string;
  productNameSnapshot?: string;
  unitPriceSnapshot?: number | string;
  quantity: number;
  lineTotal?: number | string;
  customizations?: {
    groupNameSnapshot?: string;
    optionNameSnapshot?: string;
    additionalPriceSnapshot?: number | string;
  }[];
};

export function mapOrder(raw: Record<string, unknown>): Order {
  const items = (raw.items as ApiOrderItem[] | undefined)?.map((item) => ({
    id: item.id,
    name: item.productNameSnapshot ?? 'Item',
    quantity: item.quantity,
    unitPrice: Number(item.unitPriceSnapshot ?? 0),
    lineTotal: Number(item.lineTotal ?? 0),
    customizations: item.customizations?.map((c) => ({
      name: c.groupNameSnapshot ?? '',
      option: c.optionNameSnapshot ?? '',
      price: Number(c.additionalPriceSnapshot ?? 0),
    })),
  })) as OrderItem[];

  return {
    ...(raw as unknown as Order),
    items: items ?? [],
    total: Number(raw.total ?? 0),
    subtotal: raw.subtotal !== undefined ? Number(raw.subtotal) : undefined,
    tax: raw.tax !== undefined ? Number(raw.tax) : undefined,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : raw.createdAt instanceof Date
          ? raw.createdAt.toISOString()
          : '',
  };
}

export function mapProduct(raw: Record<string, unknown>): Product {
  const groups = (raw.customizationGroups as
    | {
        groupId: string;
        sortOrder?: number;
        group: Record<string, unknown>;
      }[]
    | undefined)?.map((link) => ({
    groupId: link.groupId,
    sortOrder: link.sortOrder,
    group: mapCustomizationGroup(link.group),
  }));

  return {
    ...(raw as unknown as Product),
    soldOut: Boolean(raw.isSoldOut),
    active: raw.isActive !== false,
    price: Number(raw.price ?? 0),
    sortOrder:
      raw.sortOrder === null || raw.sortOrder === undefined
        ? undefined
        : Number(raw.sortOrder),
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : raw.createdAt
          ? String(raw.createdAt)
          : undefined,
    isTopSale: Boolean(raw.isTopSale),
    discountPercent:
      raw.discountPercent === null || raw.discountPercent === undefined
        ? null
        : Number(raw.discountPercent),
    compareAtPrice:
      raw.compareAtPrice === null || raw.compareAtPrice === undefined
        ? null
        : Number(raw.compareAtPrice),
    customizationGroups: groups,
  };
}

export function mapCategory(raw: Record<string, unknown>): Category {
  return {
    ...(raw as unknown as Category),
    active: raw.isActive !== false,
  };
}

export function mapCustomizationGroup(
  raw: Record<string, unknown>,
): CustomizationGroup {
  const options =
    (raw.options as {
      id: string;
      name: string;
      additionalPrice?: number | string;
      isAvailable?: boolean;
      isActive?: boolean;
      sortOrder?: number;
    }[]) ?? [];
  return {
    id: raw.id as string,
    name: raw.name as string,
    required: Boolean(raw.isRequired),
    isRequired: Boolean(raw.isRequired),
    selectionType: (raw.selectionType as CustomizationGroup['selectionType']) ?? 'SINGLE',
    maxSelections: (raw.maxSelections as number | null) ?? null,
    active: raw.isActive !== false,
    isActive: raw.isActive !== false,
    options: options.map((o) => ({
      id: o.id,
      name: o.name,
      price: Number(o.additionalPrice ?? 0),
      additionalPrice: Number(o.additionalPrice ?? 0),
      isAvailable: o.isAvailable !== false,
      isActive: o.isActive !== false,
      sortOrder: o.sortOrder,
    })),
  };
}

export function mapCakeOfDay(raw: Record<string, unknown> | null): CakeOfTheDay | null {
  if (!raw) return null;
  return {
    ...(raw as unknown as CakeOfTheDay),
    product: raw.product
      ? mapProduct(raw.product as Record<string, unknown>)
      : null,
  };
}

export function mapUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    email: raw.email as string,
    name: raw.name as string,
    phone: (raw.phone as string | null) ?? null,
    avatarUrl:
      typeof raw.avatarUrl === 'string' && raw.avatarUrl
        ? raw.avatarUrl
        : null,
    role: raw.role as User['role'],
    features: (raw.features as User['features']) ?? { reporting: false },
  };
}

export function mapAppSettings(raw: Record<string, unknown>): AppSettings {
  const pickup = (raw.pickup as Record<string, unknown>) ?? {};
  const stamp = (raw.stampCard as Record<string, unknown>) ?? {};
  return {
    currency: (raw.currency as string) ?? 'EUR',
    taxRate: Number(raw.taxRate ?? 0),
    timezone: (raw.timezone as string) ?? 'Europe/Dublin',
    homeBannerImageUrl:
      typeof raw.homeBannerImageUrl === 'string' && raw.homeBannerImageUrl
        ? raw.homeBannerImageUrl
        : null,
    stampCard: {
      enabled: stamp.enabled !== false,
      stampsRequired: Number(stamp.stampsRequired ?? 8),
      title: (stamp.title as string) ?? 'Stamp Card',
      subtitle:
        (stamp.subtitle as string) ??
        'Collect 8 drinks on the app — the 9th is free',
    },
    pickup: {
      openTime: (pickup.openTime as string) ?? '08:00',
      closeTime: (pickup.closeTime as string) ?? '18:00',
      slotIntervalMinutes: Number(pickup.slotIntervalMinutes ?? 15),
      maxDaysAhead: Number(pickup.maxDaysAhead ?? 7),
      asapEstimateMinutes:
        pickup.asapEstimateMinutes === null ||
        pickup.asapEstimateMinutes === undefined
          ? null
          : Number(pickup.asapEstimateMinutes),
    },
  };
}
