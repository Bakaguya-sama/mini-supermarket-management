// Script to add promotion_id to existing orders for testing
const mongoose = require('mongoose');
const { Order, Promotion } = require('../models');

const updateOrdersWithPromotions = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mini-supermarket', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Get some promotions (any status)
    const promotions = await Promotion.find({}).limit(5);
    
    if (promotions.length === 0) {
      console.log('❌ No promotions found in database');
      process.exit(1);
    }

    console.log(`📋 Found ${promotions.length} promotions:`);
    promotions.forEach(p => {
      console.log(`   - ${p.name} (${p.promotion_type}: ${p.discount_value}${p.promotion_type === 'percentage' ? '%' : '₫'}) - Status: ${p.status}`);
    });

    // Get some recent orders without promotion_id
    const orders = await Order.find({ 
      promotion_id: { $exists: false }
    }).limit(5).sort('-order_date');

    console.log(`📦 Found ${orders.length} orders without promotion`);

    // Update orders with random promotions
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const promo = promotions[i % promotions.length];
      
      // Calculate discount based on promotion type
      let discountAmount = 0;
      if (promo.promotion_type === 'percentage') {
        discountAmount = Math.round(order.total_amount * (promo.discount_value / 100));
      } else if (promo.promotion_type === 'fixed') {
        discountAmount = Math.min(promo.discount_value, order.total_amount);
      }

      await Order.findByIdAndUpdate(order._id, {
        promotion_id: promo._id,
        discount_amount: discountAmount,
        notes: order.notes 
          ? `${order.notes} | Promo: ${promo.name} - Discount: ${discountAmount.toLocaleString('vi-VN')}₫`
          : `Promo: ${promo.name} - Discount: ${discountAmount.toLocaleString('vi-VN')}₫`
      });

      console.log(`✅ Updated ${order.order_number} with ${promo.name} (-${discountAmount.toLocaleString('vi-VN')}₫)`);
    }

    console.log('\n🎉 Successfully updated orders with promotions!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateOrdersWithPromotions();
