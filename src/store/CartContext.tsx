import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../constants/config';
import type { CartItem, CartOption } from '../types';
import { calcLineTotal, calcCartSubtotal } from '../utils/pricing';
import { createLocalId } from '../utils/pickup';

type AddCartInput = {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  basePrice: number;
  quantity: number;
  selectedOptions: CartOption[];
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (input: AddCartInput) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, input: Partial<AddCartInput>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  replaceItems: (items: CartItem[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.cart);
        if (raw) setItems(JSON.parse(raw) as CartItem[]);
      } catch {
        /* ignore corrupt cart */
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items)).catch(
      () => undefined,
    );
  }, [items, isHydrated]);

  const addItem = useCallback((input: AddCartInput) => {
    const lineTotal = calcLineTotal(
      input.basePrice,
      input.selectedOptions,
      input.quantity,
    );
    setItems((prev) => [
      ...prev,
      {
        id: createLocalId(),
        productId: input.productId,
        productName: input.productName,
        productImageUrl: input.productImageUrl,
        basePrice: input.basePrice,
        quantity: input.quantity,
        selectedOptions: input.selectedOptions,
        lineTotal,
      },
    ]);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          if (quantity < 1) return item;
          return {
            ...item,
            quantity,
            lineTotal: calcLineTotal(
              item.basePrice,
              item.selectedOptions,
              quantity,
            ),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const updateItem = useCallback((id: string, input: Partial<AddCartInput>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = {
          ...item,
          ...input,
          selectedOptions: input.selectedOptions ?? item.selectedOptions,
          quantity: input.quantity ?? item.quantity,
          basePrice: input.basePrice ?? item.basePrice,
        };
        return {
          ...next,
          lineTotal: calcLineTotal(
            next.basePrice,
            next.selectedOptions,
            next.quantity,
          ),
        };
      }),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const replaceItems = useCallback((next: CartItem[]) => setItems(next), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: calcCartSubtotal(items),
      isHydrated,
      addItem,
      updateQuantity,
      updateItem,
      removeItem,
      clearCart,
      replaceItems,
    }),
    [
      items,
      isHydrated,
      addItem,
      updateQuantity,
      updateItem,
      removeItem,
      clearCart,
      replaceItems,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
