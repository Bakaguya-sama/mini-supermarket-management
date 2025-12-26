// Quick script to manually add promotion to one order for testing
const mongoose = require('mongoose');
const { Order, Promotion } = require('../models');

const addTestPromotion = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mini-supermarket');
    console.log('✅ Connected to MongoDB');

    // First, create a test promotion if none exists
    let promo = await Promotion.findOne({ promo_code: 'MEGA30' });
    
    if (!promo) {
      console.log('📝 Creating test promotion MEGA30...');
      promo = await Promotion.create({
        name: 'Mega Sale - 30% Off',
        description: '30% discount for all orders',
        promotion_type: 'percentage',
        discount_value: 30,
        minimum_purchase_amount: 0,
        promo_code: 'MEGA30',
        start_date: new Date('2024-12-01'),
        end_date: new Date('2025-12-31'),
        status: 'active',
        terms: 'Valid for all products',
        isDelete: false,
      });
      console.log(`✅ Created promotion: ${promo.name} (${promo._id})`);
    } else {
      console.log(`✅ Found existing promotion: ${promo.name} (${promo._id})`);
    }

    // Get the most recent order
    const order = await Order.findOne({}).sort('-createdAt');
    
    if (!order) {
      console.log('❌ No orders found');
      process.exit(1);
    }

    console.log(`📦 Found order: ${order.order_number} (${order.total_amount.toLocaleString('vi-VN')}₫)`);

    // Calculate discount
    const discountAmount = Math.round(order.total_amount * 0.3); // 30%

    // Update order
    await Order.findByIdAndUpdate(order._id, {
      promotion_id: promo._id,
      discount_amount: discountAmount,
      notes: order.notes 
        ? `${order.notes} | Promo: ${promo.name} - 30% OFF`
        : `Promo: ${promo.name} - 30% discount applied`
    });

    console.log(`✅ Updated order ${order.order_number}:`);
    console.log(`   Promotion: ${promo.name}`);
    console.log(`   Discount: -${discountAmount.toLocaleString('vi-VN')}₫`);
    console.log(`   New Total: ${(order.total_amount - discountAmount).toLocaleString('vi-VN')}₫`);
    
    console.log('\n🎉 Done! Refresh the My Orders page to see the promotion.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addTestPromotion();
