import React from "react";
import "./BatchListModal.css";

const BatchListModal = ({
  isOpen,
  onClose,
  product,
  batches = [],
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="batch-modal-overlay">
      <div className="batch-modal">
        <div className="batch-modal-header">
          <h3>Batches for {product?.name}</h3>
          <button className="batch-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="batch-modal-body">
          {loading ? (
            <p>Loading batches...</p>
          ) : batches.length === 0 ? (
            <p>No batch records for this product.</p>
          ) : (
            <table className="batch-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Received Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b, idx) => {
                  const expiryDate = b.expiry_date ? new Date(b.expiry_date) : null;
                  const now = new Date();
                  const isExpired = expiryDate && expiryDate < now;
                  const daysToExpiry = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;
                  const isExpiringSoon = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30;

                  return (
                    <tr key={b._id || b.batch_number || idx} className={isExpired ? 'expired-batch' : isExpiringSoon ? 'expiring-soon-batch' : ''}>
                      <td>{b.batch_number || `BATCH-${idx + 1}`}</td>
                      <td>
                        {expiryDate
                          ? expiryDate.toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{b.quantity ?? 0}</td>
                      <td>
                        {b.received_date
                          ? new Date(b.received_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        {isExpired ? (
                          <span className="status-badge status-expired">Expired</span>
                        ) : isExpiringSoon ? (
                          <span className="status-badge status-expiring-soon">Expiring Soon</span>
                        ) : (
                          <span className="status-badge status-good">Good</span>
                        )}
                      </td>
                      <td>{b.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchListModal;
