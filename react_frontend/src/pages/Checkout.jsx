import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/client';
import OrderStatusModal from '../components/OrderStatusModal';

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, clear } = useCart();
  const { token } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [status, setStatus] = useState(null);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      // Attempt to include restaurantId if items share a restaurant context (optional)
      const restaurantId = items.length > 0 ? items[0].restaurantId || items[0].rid || null : null;
      const payload = {
        restaurantId: restaurantId || undefined,
        items: items.map(i => ({
          id: i.id,
          qty: i.qty,
          price: i.price,
          name: i.name
        })),
        subtotal,
        deliveryFee,
        total
      };
      const res = await Api.createOrder(payload, token);
      setStatus(res);
      clear();
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container page">
      <div className="header">
        <h2 className="title">Checkout</h2>
      </div>
      {items.length === 0 ? (
        <div className="list-empty">Your cart is empty.</div>
      ) : (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 10 }}>
            {items.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>{i.name} × {i.qty}</div>
                <div>${(i.price * i.qty).toFixed(2)}</div>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Subtotal</span><strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-muted">Delivery</span><strong>${deliveryFee.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total</span><strong>${total.toFixed(2)}</strong>
            </div>
          </div>
          <button className="btn mt-4" onClick={placeOrder} disabled={placing} aria-busy={placing}>
            {placing ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      )}
      <OrderStatusModal open={!!status} onClose={() => setStatus(null)} status={status} />
    </div>
  );
}
