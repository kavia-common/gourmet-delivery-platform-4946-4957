import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export const CartContext = createContext(null);

// PUBLIC_INTERFACE
export function useCart() {
  /** Hook to access cart context */
  return useContext(CartContext);
}

// PUBLIC_INTERFACE
export function CartProvider({ children }) {
  /** Provides cart operations: addItem, removeItem, updateQty, clear, totals */
  const [items, setItems] = useState([]);
  const [isOpen, setOpen] = useState(false);

  // Load persisted cart
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const deliveryFee = items.length ? 4.99 : 0;
  const total = subtotal + deliveryFee;

  const value = useMemo(() => ({
    items, isOpen, subtotal, deliveryFee, total,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    // PUBLIC_INTERFACE
    addItem: (item) => {
      setItems(prev => {
        const idx = prev.findIndex(i => i.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + (item.qty || 1) };
          return next;
        }
        return [...prev, { ...item, qty: item.qty || 1 }];
      });
      setOpen(true);
    },
    // PUBLIC_INTERFACE
    updateQty: (id, qty) => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    },
    // PUBLIC_INTERFACE
    removeItem: (id) => setItems(prev => prev.filter(i => i.id !== id)),
    // PUBLIC_INTERFACE
    clear: () => setItems([])
  }), [items, subtotal, deliveryFee, total, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
