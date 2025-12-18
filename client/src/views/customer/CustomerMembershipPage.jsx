import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaGift,
  FaTrophy,
  FaCrown,
  FaFire,
  FaCalendar,
  FaTag,
} from "react-icons/fa";
import { customerService } from "../../services/customerService";
import promotionService from "../../services/promotionService";
import "./CustomerMembershipPage.css";

const CustomerMembershipPage = ({ customerId, customerData: initialCustomerData, membershipPoints: initialPoints = 0 }) => {
  // State management
  const [customerData, setCustomerData] = useState(initialCustomerData || null);
  const [membershipPoints, setMembershipPoints] = useState(initialPoints);
  const [activePromotions, setActivePromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Membership tiers configuration (hardcoded UI logic)
  const membershipTiers = [
    { name: "Regular", min: 0, max: 499, color: "#9ca3af", icon: FaStar },
    { name: "Bronze", min: 500, max: 999, color: "#cd7f32", icon: FaTrophy },
    { name: "Silver", min: 1000, max: 1999, color: "#c0c0c0", icon: FaCrown },
    { name: "Gold", min: 2000, max: 4999, color: "#ffd700", icon: FaFire },
    {
      name: "Platinum",
      min: 5000,
      max: Infinity,
      color: "#e5e4e2",
      icon: FaGift,
    },
  ];

  // Calculate current tier based on points
  const currentTier = membershipTiers.find(
    (tier) => membershipPoints >= tier.min && membershipPoints <= tier.max
  );

  const nextTier = membershipTiers.find((tier) => tier.min > membershipPoints);
  const pointsToNextTier = nextTier ? nextTier.min - membershipPoints : 0;

  // How to earn points (hardcoded UI content)
  const earnPoints = [
    {
      id: 1,
      title: "Make Purchases",
      description: "Earn 10 points on $1 spent",
    },
    {
      id: 2,
      title: "Leave Reviews",
      description: "Get 50 points per review",
    },
    {
      id: 3,
      title: "Referrals",
      description: "Earn 500 points per referral",
    },
  ];

  // Recent activities (TODO: will be integrated with order history API later)
  const recentActivities = [
    {
      date: "Nov 03, 2025",
      description: "Purchase reward",
      points: +105,
    },
    { date: "Nov 03, 2025", description: "Order discount", points: -200 },
    {
      date: "Oct 29, 2025",
      description: "Birthday Bonus",
      points: +105,
    },
  ];

  /**
   * Load customer data from backend
   */
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!customerId) {
        console.error('❌ No customerId provided');
        setError('Customer ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('👤 Loading customer data for membership page:', customerId);

        // Load customer details
        const customerResult = await customerService.getById(customerId);

        if (customerResult.success && customerResult.data) {
          const customer = customerResult.data;
          setCustomerData(customer);
          setMembershipPoints(customer.points_balance || 0);
          console.log('✅ Customer data loaded:', customer);
          console.log('💎 Points balance:', customer.points_balance);
        } else {
          console.error('❌ Failed to load customer:', customerResult.message);
          setError(customerResult.message || 'Failed to load customer data');
        }

        // Load active promotions
        const promotionsResult = await promotionService.getAllPromotions('active');

        if (promotionsResult.success && promotionsResult.data) {
          // Transform backend promotions to UI format
          const formattedPromotions = promotionsResult.data.map(promo => ({
            id: promo._id,
            title: promo.name,
            description: promo.description,
            discount: promo.promotion_type === 'percentage' 
              ? `${promo.discount_value}% OFF` 
              : `$${promo.discount_value} OFF`,
            category: promo.applicable_to_category || 'All Products',
            validUntil: new Date(promo.end_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            code: promo.promo_code,
            type: promo.promotion_type,
            value: promo.discount_value,
            minPurchase: promo.minimum_purchase_amount
          }));

          setActivePromotions(formattedPromotions);
          console.log(`✅ Loaded ${formattedPromotions.length} active promotions`);
        } else {
          console.warn('⚠️ No active promotions found');
          setActivePromotions([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error loading membership data:', err);
        setError('Failed to load membership data');
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [customerId]);

  /**
   * Format member since date
   */
  const getMemberSinceDate = () => {
    if (!customerData || !customerData.registered_at) {
      return 'Member since Jan 2024'; // Fallback
    }

    const date = new Date(customerData.registered_at);
    return `Member since ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })}`;
  };

  const TierIcon = currentTier?.icon || FaStar;
  const progressPercentage = nextTier
    ? ((membershipPoints - currentTier.min) /
        (nextTier.min - currentTier.min)) *
      100
    : 100;

  // Loading state
  if (loading) {
    return (
      <div className="customer-membership">
        <div className="customer-membership-container">
          <div className="membership-page-header">
            <h2>Membership & Promotions</h2>
            <p>Loading your membership data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="customer-membership">
        <div className="customer-membership-container">
          <div className="membership-page-header">
            <h2>Membership & Promotions</h2>
            <p style={{ color: '#ef4444' }}>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-membership">
      <div className="customer-membership-container">
        {/* Header */}
        <div className="membership-page-header">
          <h2>Membership & Promotions</h2>
          <p>Track your points, view promotions, and manage rewards</p>
        </div>

        <div className="membership-layout">
          {/* Left Column */}
          <div className="membership-left">
            {/* Membership Level Card */}
            <div className="membership-level-card">
              <div className="membership-level-header">
                <span className="membership-label">Membership Level</span>
                <span className="membership-points-badge">
                  {membershipPoints}
                </span>
              </div>
              <div className="membership-level-content">
                <div className="membership-tier-display">
                  <div
                    className="membership-tier-icon"
                    style={{ background: currentTier?.color }}
                  >
                    <TierIcon />
                  </div>
                  <h3>{currentTier?.name} Member</h3>
                  <div className="membership-tier-badge">
                    <FaCrown /> {getMemberSinceDate()}
                  </div>
                </div>

                {nextTier && (
                  <div className="membership-progress">
                    <div className="progress-label">
                      <span>Progress to {nextTier.name}</span>
                      <span>{pointsToNextTier} points to go</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progressPercentage}%`,
                          background: `linear-gradient(90deg, ${currentTier?.color}, ${nextTier.color})`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Promotions */}
            <div className="active-promotions-card">
              <div className="card-header">
                <FaTag /> Active Promotions
              </div>
              <div className="promotions-list">
                {activePromotions.length > 0 ? (
                  activePromotions.map((promo) => (
                    <div key={promo.id} className="promotion-item">
                      <div className="promotion-discount">{promo.discount}</div>
                      <div className="promotion-details">
                        <h4>{promo.title}</h4>
                        <p>{promo.description}</p>
                        <div className="promotion-meta">
                          <span className="promotion-category">
                            {promo.category}
                          </span>
                          <span className="promotion-validity">
                            <FaCalendar /> Valid until {promo.validUntil}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-promotions">
                    <p>No active promotions at the moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="membership-right">
            {/* How to Earn Points */}
            <div className="earn-points-card">
              <div className="card-header">How to Earn Points</div>
              <div className="earn-points-list">
                {earnPoints.map((item) => (
                  <div key={item.id} className="earn-point-item">
                    <div className="earn-point-number">{item.id}</div>
                    <div className="earn-point-content">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Membership Tiers */}
            <div className="membership-tiers-card">
              <div className="card-header">Membership Tiers</div>
              <div className="tiers-list">
                {membershipTiers.map((tier) => {
                  const TierIconComponent = tier.icon;
                  const isCurrentTier = tier.name === currentTier?.name;
                  return (
                    <div
                      key={tier.name}
                      className={`tier-item ${isCurrentTier ? "active" : ""}`}
                    >
                      <div
                        className="tier-icon"
                        style={{ background: tier.color }}
                      >
                        <TierIconComponent />
                      </div>
                      <div className="tier-info">
                        <h4>{tier.name}</h4>
                        <p>
                          {tier.min} - {tier.max === Infinity ? "∞" : tier.max}{" "}
                          points
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-card">
              <div className="card-header">Recent Activity</div>
              <div className="activity-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <div className="activity-description">
                        {activity.description}
                      </div>
                      <div className="activity-date">{activity.date}</div>
                    </div>
                    <div
                      className={`activity-points ${
                        activity.points > 0 ? "positive" : "negative"
                      }`}
                    >
                      {activity.points > 0 ? "+" : ""}
                      {activity.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMembershipPage;
