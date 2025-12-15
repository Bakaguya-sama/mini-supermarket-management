import React from "react";
import {
  FaStar,
  FaGift,
  FaTrophy,
  FaCrown,
  FaFire,
  FaCalendar,
  FaTag,
} from "react-icons/fa";
import "./CustomerMembershipPage.css";

const CustomerMembershipPage = ({ membershipPoints = 1250 }) => {
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

  const currentTier = membershipTiers.find(
    (tier) => membershipPoints >= tier.min && membershipPoints <= tier.max
  );

  const nextTier = membershipTiers.find((tier) => tier.min > membershipPoints);
  const pointsToNextTier = nextTier ? nextTier.min - membershipPoints : 0;

  const promotions = [
    {
      id: 1,
      title: "Weekend Special",
      description: "20% off on all fresh produce",
      discount: "20% OFF",
      category: "Fresh Produce",
      validUntil: "Nov 10, 2025",
    },
    {
      id: 2,
      title: "Weekend Special",
      description: "20% off on all fresh produce",
      discount: "20% OFF",
      category: "Fresh Produce",
      validUntil: "Nov 10, 2025",
    },
    {
      id: 3,
      title: "Weekend Special",
      description: "20% off on all fresh produce",
      discount: "20% OFF",
      category: "Fresh Produce",
      validUntil: "Nov 10, 2025",
    },
  ];

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

  const TierIcon = currentTier?.icon || FaStar;
  const progressPercentage = nextTier
    ? ((membershipPoints - currentTier.min) /
        (nextTier.min - currentTier.min)) *
      100
    : 100;

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
                    <FaCrown /> Member since Jan 2024
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
                {promotions.map((promo) => (
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
                ))}
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
