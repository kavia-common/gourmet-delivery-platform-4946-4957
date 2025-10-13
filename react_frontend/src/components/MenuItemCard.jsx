import React from 'react';
import { useCart } from '../context/CartContext';

export default function MenuItemCard({ item }) {
  const { addItem } = useCart();
  return (
    <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <h4 className="m-0" style={{ fontSize: 16 }}>{item.name}</h4>
        <p className="m-0 text-muted">{item.description}</p>
        <p className="m-0" style={{ fontWeight: 700 }}>${item.price.toFixed(2)}</p>
      </div>
      <button
        className="btn"
        onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
        aria-label={`Add ${item.name} to cart`}
      >
        Add
      </button>
    </div>
  );
}
