import React, { useEffect, useRef, useState } from 'react';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OrderStatusModal({ open, onClose, status }) {
  const ref = useRef(null);
  const { token } = useAuth();
  const [liveStatus, setLiveStatus] = useState(status);

  // Focus when opened
  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
    }
  }, [open]);

  // Keep internal status in sync with initial prop
  useEffect(() => {
    setLiveStatus(status);
  }, [status]);

  // Poll /orders/:id/status while open and we have an orderId
  useEffect(() => {
    if (!open || !liveStatus?.orderId) return;

    let cancelled = false;
    let timer = null;

    const terminal = new Set(['delivered', 'cancelled', 'failed']);
    const poll = async () => {
      try {
        const data = await Api.getOrderStatus(liveStatus.orderId, token);
        if (!cancelled) {
          setLiveStatus(prev => ({ ...prev, ...data }));
          if (!terminal.has((data.status || '').toLowerCase())) {
            timer = setTimeout(poll, 5000);
          }
        }
      } catch {
        // on error, retry with backoff
        if (!cancelled) {
          timer = setTimeout(poll, 7000);
        }
      }
    };

    // kick off after a short delay to let backend process
    timer = setTimeout(poll, 3000);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, liveStatus?.orderId, token]);

  if (!open) return null;

  const current = liveStatus || {};
  const pretty = (s) => (s || 'received').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="order-status-title">
      <div className="modal" ref={ref} tabIndex="-1">
        <div className="modal-header">
          <h3 id="order-status-title" className="m-0">Order Status</h3>
          <button className="btn outline" onClick={onClose} aria-label="Close order status">Close</button>
        </div>
        <div className="modal-body">
          <p className="m-0">Status: <strong>{pretty(current.status)}</strong></p>
          {current?.etaMinutes ? <p className="m-0 mt-2">Estimated time: <strong>{current.etaMinutes} min</strong></p> : null}
          {current?.orderId ? <p className="m-0 mt-2 text-muted">Order ID: {current.orderId}</p> : null}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
