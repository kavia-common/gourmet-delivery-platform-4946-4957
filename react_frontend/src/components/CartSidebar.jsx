import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartSidebar() {
  const { isOpen, closeCart, items, updateQty, removeItem, subtotal, deliveryFee, total } = useCart();
  return (
    <aside
      className={`cart-sidebar ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
      aria-label="Shopping cart sidebar"
      role="complementary"
    >
      <div className="cart-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className="m-0">Your Cart</h3>
        <button className="btn outline" onClick={closeCart} aria-label="Close cart">Close</button>
      </div>

      <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
        {items.length === 0 ? (
          <div className="list-empty">Your cart is empty</div>
        ) : items.map(it => (
          <div key={it.id} className="surface" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{it.name}</div>
              <div className="text-muted">${it.price.toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn outline" onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))} aria-label={`Decrease ${it.name} quantity`}>-</button>
              <span aria-live="polite" aria-atomic="true">{it.qty}</span>
              <button className="btn outline" onClick={() => updateQty(it.id, it.qty + 1)} aria-label={`Increase ${it.name} quantity`}>+</button>
              <button className="btn secondary" onClick={() => removeItem(it.id)} aria-label={`Remove ${it.name} from cart`}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Subtotal</span><strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Delivery</span><strong>${deliveryFee.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 6 }}>
            <span>Total</span><strong>${total.toFixed(2)}</strong>
          </div>
        </div>
        <Link to="/checkout" className="btn mt-4" onClick={closeCart} aria-label="Go to checkout">Checkout</Link>
      </div>
    </aside>
  );
}
