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
                  <th>Batch ID</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>SKU</th>
                  <th>Barcode</th>
                  <th>Shelf</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b._id || b.batch_id}>
                    <td>{b.batch_id || (b._id ? b._id : "—")}</td>
                    <td>
                      {b.expiry_date
                        ? new Date(b.expiry_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{b.totalQuantity ?? b.quantity ?? 0}</td>
                    <td>{b.sku ?? "—"}</td>
                    <td>{b.barcode ?? "—"}</td>
                    <td>
                      {(b.shelf && b.shelf.shelf_number) ||
                        (b.shelf_id && b.shelf_id.shelf_number) ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchListModal;
