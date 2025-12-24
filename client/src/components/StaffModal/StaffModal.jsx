import React from "react";
import { useNavigate } from "react-router-dom";
import "./StaffModal.css";

const StaffModal = ({ staff, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!isOpen || !staff) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditClick = () => {
    onClose();
    navigate(`/staff/edit/${staff.id}`);
  };

  // Build rows so each field is rendered on its own line
  const rows = [
    { label: "Staff ID", value: staff.id },
    { label: "Position", value: staff.position },
    { label: "Email", value: staff.email },
    { label: "Phone", value: staff.phone },
    { label: "Address", value: staff.address || "N/A" },
    { label: "Employment type", value: staff.employmentType || "Full-time" },
    { label: "Salary", value: staff.salary || "$65,000/year" },
    {
      label: "Status",
      value: (
        <span className={`status-badge ${String(staff.status).toLowerCase()}`}>
          {staff.status}
        </span>
      ),
    },
    { label: "Hire date", value: staff.joinDate },
  ];

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="staff-info header-with-avatar">
            {staff.avatar ? (
              <img
                src={staff.avatar}
                alt="avatar"
                className="staff-avatar-header"
              />
            ) : (
              <div className="staff-avatar-placeholder">👤</div>
            )}
            <div>
              <h2 className="staff-name">{staff.name}</h2>
              <p className="staff-position">{staff.position}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="info-list">
            {rows.map((row) => (
              <div className="info-row single-line" key={row.label}>
                <label>{row.label}</label>
                <p className="value">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="edit-staff-btn" onClick={handleEditClick}>
            <span>✏️</span>
            Edit Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffModal;
