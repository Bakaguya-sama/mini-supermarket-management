import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaArrowLeft,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./PromotionSelection.css";
import promotionService from "../../../services/promotionService";

const PromotionSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId, createInvoice } = location.state || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Available");
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  
  // API data states
  const [isLoading, setIsLoading] = useState(true);
  const [promotionsData, setPromotionsData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const statusOptions = ["All", "Available", "Expired"];

  // Load promotions from API
  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await promotionService.getAllPromotions('active');
      
      if (response.success && response.data) {
        // Transform API data to UI format
        const transformedPromotions = response.data.map(promo => {
          const startDate = new Date(promo.startDate);
          const endDate = new Date(promo.endDate);
          const now = new Date();
          
          // Format discount display
          let discountDisplay = '';
          if (promo.type === 'percentage') {
            discountDisplay = `${promo.discountValue}% OFF`;
          } else if (promo.type === 'fixed') {
            discountDisplay = `$${promo.discountValue} OFF`;
          }

          // Check if last day
          const isLastDay = endDate.toDateString() === now.toDateString();

          // Format valid period
          const validPeriod = `Valid: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

          return {
            id: promo.id,
            code: promo.code,
            title: promo.name,
            description: promo.description,
            type: promo.type === 'percentage' ? 'Percentage Discount' : 'Fixed Amount',
            discount: discountDisplay,
            discountValue: promo.discountValue,
            discountType: promo.type,
            validPeriod: validPeriod,
            validStart: promo.startDate,
            validEnd: promo.endDate,
            conditions: promo.terms || (promo.minPurchase > 0 ? `Minimum purchase $${promo.minPurchase}` : null),
            isLastDay: isLastDay,
            minPurchase: promo.minPurchase || 0
          };
        });

        setPromotionsData(transformedPromotions);
      } else {
        setErrorMessage(response.message || 'Failed to load promotions');
        setPromotionsData([]);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      setErrorMessage('Failed to load promotions');
      setPromotionsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isPromotionValid = (promotion) => {
    const today = new Date();
    const startDate = new Date(promotion.validStart);
    const endDate = new Date(promotion.validEnd);
    return today >= startDate && today <= endDate;
  };

  // Filter promotions based on search and status
  const filteredPromotions = promotionsData.filter((promo) => {
    const matchesSearch =
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase());

    const promoIsValid = isPromotionValid(promo);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Available" && promoIsValid) ||
      (statusFilter === "Expired" && !promoIsValid);

    return matchesSearch && matchesStatus;
  });

  const handlePromotionSelect = (promotion) => {
    if (selectedPromotion?.id === promotion.id) {
      setSelectedPromotion(null);
    } else {
      setSelectedPromotion(promotion);
    }
  };

  const handleApplyPromotion = () => {
    if (selectedPromotion) {
      // Navigate back with selected promotion
      if (createInvoice) {
        // From CreateInvoice
        navigate("/invoice/create", {
          state: { selectedPromotion },
        });
      } else {
        // From InvoiceDetail
        navigate(`/invoice/detail/${invoiceId}`, {
          state: { selectedPromotion },
        });
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="promotion-selection-view">
      {/* Loading State */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🎁</div>
            <div style={{ fontSize: '18px', fontWeight: '500' }}>Loading promotions...</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#ff4444',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 10000
        }}>
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="promotion-header">
        <div className="promotion-header-left">
          <button className="promotion-back-btn" onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <div className="promotion-header-info">
            <h1 className="promotion-page-title">Today's Active Promotions</h1>
            <p className="promotion-subtitle">
              {filteredPromotions.length} active promotions available today
            </p>
          </div>
        </div>
        <div className="promotion-header-right">
          <div className="promotion-date-display">
            <FaCalendarAlt className="promotion-date-icon" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="promotion-controls">
        <div className="promotion-search-container">
          <FaSearch className="promotion-search-icon" />
          <input
            type="text"
            placeholder="Search promotions by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="promotion-search-input"
          />
        </div>
        <div className="promotion-filter-container">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="promotion-status-filter"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="promotion-grid">
        {filteredPromotions.map((promotion) => (
          <div
            key={promotion.id}
            className={`promotion-card ${
              selectedPromotion?.id === promotion.id ? "selected" : ""
            } ${!isPromotionValid(promotion) ? "expired" : ""}`}
            onClick={() =>
              isPromotionValid(promotion) && handlePromotionSelect(promotion)
            }
          >
            <div className="promotion-card-header">
              <div className="promotion-card-info">
                <span className="promotion-code">{promotion.code}</span>
                <span className="promotion-type-badge">{promotion.type}</span>
              </div>
              <div className="promotion-discount-badge">
                {promotion.discount}
              </div>
            </div>

            <div className="promotion-card-content">
              <h3 className="promotion-title">{promotion.title}</h3>
              <p className="promotion-description">{promotion.description}</p>

              {promotion.conditions && (
                <div className="promotion-conditions">
                  <FaExclamationTriangle className="promotion-warning-icon" />
                  <span>Conditions: {promotion.conditions}</span>
                </div>
              )}

              <div className="promotion-validity">
                <FaCalendarAlt className="promotion-calendar-icon" />
                <span>{promotion.validPeriod}</span>
                {promotion.isLastDay && (
                  <span className="promotion-last-day-badge">Last Day!</span>
                )}
              </div>
            </div>

            {selectedPromotion?.id === promotion.id && (
              <div className="promotion-selected-indicator">✓ Selected</div>
            )}

            {!isPromotionValid(promotion) && (
              <div className="promotion-expired-overlay">
                <span>Expired</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="promotion-no-results">
          <p>No promotions found matching your criteria.</p>
        </div>
      )}

      {/* Action Button */}
      {selectedPromotion && (
        <div className="promotion-action-container">
          <button
            className="promotion-apply-btn"
            onClick={handleApplyPromotion}
          >
            Apply Promotion
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionSelection;
