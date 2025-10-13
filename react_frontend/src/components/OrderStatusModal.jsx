import React, { useEffect, useRef } from 'react';

export default function OrderStatusModal({ open, onClose, status }) {
  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="order-status-title">
      <div className="modal" ref={ref} tabIndex="-1">
        <div className="modal-header">
          <h3 id="order-status-title" className="m-0">Order Status</h3>
          <button className="btn outline" onClick={onClose} aria-label="Close order status">Close</button>
        </div>
        <div className="modal-body">
          <p className="m-0">Status: <strong>{status?.status || 'received'}</strong></p>
          {status?.etaMinutes ? <p className="m-0 mt-2">Estimated time: <strong>{status.etaMinutes} min</strong></p> : null}
          {status?.orderId ? <p className="m-0 mt-2 text-muted">Order ID: {status.orderId}</p> : null}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}
