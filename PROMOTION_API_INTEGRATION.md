# 🎁 Promotion API Integration Guide

## Overview
Backend API đã được tạo để quản lý promotions (khuyến mãi) và frontend đã được tích hợp để hiển thị promotions trong Customer Cart Page.

---

## Backend API

### 📁 Files Created

#### 1. `server/controllers/promotionController.js`
Controller xử lý logic cho promotion operations.

**Endpoints:**
- `GET /api/promotions` - Get all active promotions
- `GET /api/promotions/applicable` - Get applicable promotions based on cart subtotal
- `GET /api/promotions/:id` - Get specific promotion details
- `POST /api/promotions/validate` - Validate promo code

#### 2. `server/routes/promotionRoutes.js`
Routes definition cho promotion API.

#### 3. `server/server.js` (Updated)
Đã thêm promotion routes vào server.

---

## API Endpoints Details

### 1. Get All Promotions
```http
GET /api/promotions?status=active&includeExpired=false
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `expired`)
- `includeExpired` (optional): Include expired promotions (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "674c8b72c4a3b2d1e5f68901",
      "name": "Flash Sale Cuối Tuần",
      "code": "FLASH50",
      "description": "Giảm 50k cho đơn hàng từ 300k",
      "type": "fixed",
      "discountValue": 50000,
      "minPurchase": 300000,
      "startDate": "2024-12-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "status": "active",
      "terms": null
    }
  ],
  "total": 1
}
```

---

### 2. Get Applicable Promotions
```http
GET /api/promotions/applicable?subtotal=500000
```

**Query Parameters:**
- `subtotal` (required): Current cart subtotal

**Logic:**
- Chỉ trả về promotions:
  - Status = `active`
  - Within valid date range (start_date ≤ now ≤ end_date)
  - minimum_purchase_amount ≤ subtotal
- Sort by discount value (best discount first)
- Calculate actual discount amount for each promotion

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "674c8b72c4a3b2d1e5f68902",
      "name": "Ưu đãi Thành Viên Vàng",
      "code": "GOLD15",
      "description": "Giảm 15% cho khách VIP",
      "type": "percentage",
      "discountValue": 15,
      "discountAmount": 75000,
      "minPurchase": 200000,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "terms": null
    },
    {
      "id": "674c8b72c4a3b2d1e5f68901",
      "name": "Flash Sale Cuối Tuần",
      "code": "FLASH50",
      "description": "Giảm 50k cho đơn hàng từ 300k",
      "type": "fixed",
      "discountValue": 50000,
      "discountAmount": 50000,
      "minPurchase": 300000,
      "startDate": "2024-12-01T00:00:00.000Z",
      "endDate": "2025-12-31T00:00:00.000Z",
      "terms": null
    }
  ],
  "total": 2
}
```

---

### 3. Validate Promo Code
```http
POST /api/promotions/validate
Content-Type: application/json

{
  "code": "FLASH50",
  "subtotal": 500000
}
```

**Request Body:**
- `code` (required): Promo code to validate
- `subtotal` (required): Current cart subtotal

**Validation Rules:**
1. Code must exist and be active
2. Current date must be within start_date and end_date
3. Subtotal must meet minimum_purchase_amount requirement

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "674c8b72c4a3b2d1e5f68901",
    "code": "FLASH50",
    "name": "Flash Sale Cuối Tuần",
    "description": "Giảm 50k cho đơn hàng từ 300k",
    "type": "fixed",
    "discountValue": 50000,
    "discountAmount": 50000,
    "minPurchase": 300000
  }
}
```

**Error Responses:**
```json
// Invalid code
{
  "success": false,
  "message": "Invalid or expired promo code"
}

// Below minimum purchase
{
  "success": false,
  "message": "Minimum purchase of $300000.00 required"
}

// Not currently active
{
  "success": false,
  "message": "This promotion is not currently active"
}
```

---

## Frontend Integration

### 📁 Files Created/Updated

#### 1. `client/src/services/promotionService.js` (NEW)
Service layer cho promotion API calls.

**Methods:**
- `getAllPromotions(status)` - Get all promotions
- `getApplicablePromotions(subtotal)` - Get applicable promotions for cart
- `validatePromoCode(code, subtotal)` - Validate promo code
- `getPromotionById(id)` - Get promotion details

#### 2. `client/src/views/customer/CustomerCartPage.jsx` (UPDATED)
Updated cart page để load và display promotions từ backend.

**Changes:**
```javascript
// Added state
const [availablePromotions, setAvailablePromotions] = useState([]);

// Added useEffect to load promotions when cart changes
useEffect(() => {
  if (cartItems.length > 0) {
    loadApplicablePromotions();
  }
}, [cartItems]);

// Added function to load applicable promotions
const loadApplicablePromotions = async () => {
  const subtotal = cartItems.reduce(...);
  const result = await promotionService.getApplicablePromotions(subtotal);
  
  if (result.success) {
    // Transform to UI format
    const formattedPromotions = result.data.map(promo => ({
      id: promo.id,
      code: promo.code,
      discount: promo.type === 'percentage' ? promo.discountValue / 100 : 0,
      discountAmount: promo.discountAmount,
      description: promo.description,
      type: promo.type,
      discountValue: promo.discountValue,
      minOrder: promo.minPurchase,
      validUntil: formatDate(promo.endDate),
      terms: promo.terms
    }));
    
    setAvailablePromotions(formattedPromotions);
  }
};
```

---

## Data Flow

### 1. Loading Promotions
```
Cart Updated → Calculate Subtotal → API Call → Transform Data → Update UI

CustomerCartPage.jsx
  ↓ cartItems changes
loadApplicablePromotions()
  ↓ calculate subtotal
promotionService.getApplicablePromotions(subtotal)
  ↓ GET /api/promotions/applicable?subtotal={amount}
promotionController.getApplicablePromotions()
  ↓ Query database with filters
Promotion.find({...})
  ↓ Format response
Return applicable promotions with calculated discounts
  ↓ Transform to UI format
setAvailablePromotions(formatted)
  ↓ Render
Display promotion cards in UI
```

### 2. Selecting Promotion
```
User Clicks Promo Card → Update State → Recalculate Total

handleSelectPromo(promo)
  ↓
setSelectedPromo(promo)
  ↓
Calculate promoDiscount based on:
  - type === 'percentage': subtotal * discount
  - type === 'fixed': min(discountValue, subtotal)
  ↓
total = subtotal - promoDiscount - pointsDiscount
  ↓
Display updated total in UI
```

---

## Promotion Types

### 1. Percentage Discount
```javascript
{
  type: 'percentage',
  discountValue: 15, // 15%
  // Calculation: subtotal * (15 / 100)
}
```

**Example:**
- Subtotal: $500,000
- Discount: 15%
- Amount: $75,000

### 2. Fixed Amount Discount
```javascript
{
  type: 'fixed',
  discountValue: 50000, // $50,000
  // Calculation: min(50000, subtotal)
}
```

**Example:**
- Subtotal: $500,000
- Discount: $50,000
- Amount: $50,000

---

## Database Schema

### Promotion Model
```javascript
{
  name: String,                    // "Flash Sale Cuối Tuần"
  description: String,             // "Giảm 50k cho đơn hàng từ 300k"
  promotion_type: String,          // 'percentage' | 'fixed'
  discount_value: Number,          // 15 (for percentage) or 50000 (for fixed)
  minimum_purchase_amount: Number, // Minimum cart subtotal required
  promo_code: String,              // "FLASH50"
  start_date: Date,                // Promotion start date
  end_date: Date,                  // Promotion end date
  status: String,                  // 'active' | 'inactive' | 'expired'
  terms: String,                   // Terms and conditions
  isDelete: Boolean                // Soft delete flag
}
```

---

## Testing

### Test với REST Client (.http file)
```http
### Get applicable promotions for cart subtotal ₫500,000
GET http://localhost:5000/api/promotions/applicable?subtotal=500000

### Validate promo code FLASH50
POST http://localhost:5000/api/promotions/validate
Content-Type: application/json

{
  "code": "FLASH50",
  "subtotal": 500000
}
```

### Test Frontend
1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Navigate to Customer Cart: `/customer` → Cart tab
4. Add items to cart
5. Verify promotions appear in "Available Promotions" section
6. Click promotion card to select/deselect
7. Verify discount is applied correctly in total

---

## Sample Promotions in Database

From `server/scripts/seed.js`:

```javascript
[
  {
    name: 'Khuyến mãi Tết 2024',
    promo_code: 'TET2024',
    promotion_type: 'percentage',
    discount_value: 20,
    minimum_purchase_amount: 500000,
    status: 'inactive'
  },
  {
    name: 'Flash Sale Cuối Tuần',
    promo_code: 'FLASH50',
    promotion_type: 'fixed',
    discount_value: 50000,
    minimum_purchase_amount: 300000,
    status: 'active'
  },
  {
    name: 'Ưu đãi Thành Viên Vàng',
    promo_code: 'GOLD15',
    promotion_type: 'percentage',
    discount_value: 15,
    minimum_purchase_amount: 200000,
    status: 'active'
  },
  {
    name: 'Giảm giá Sữa',
    promo_code: 'MILK10',
    promotion_type: 'fixed',
    discount_value: 10000,
    minimum_purchase_amount: 0,
    status: 'active'
  }
]
```

---

## Features Implemented

✅ **Backend:**
- Get all promotions with filters
- Get applicable promotions based on cart subtotal
- Validate promo codes
- Support both percentage and fixed amount discounts
- Date range validation
- Minimum purchase requirement check

✅ **Frontend:**
- Auto-load applicable promotions when cart changes
- Display promotion cards with discount info
- Show/hide multiple promotions (View More)
- Select/deselect promotions
- Calculate and display discount amount
- Support both promotion types (percentage & fixed)
- Format dates and amounts nicely

---

## UI Features

### Promotion Card Display
- **Discount Badge**: Shows percentage or fixed amount
- **Promo Code**: Displayed prominently
- **Description**: Clear explanation of promotion
- **Min Order**: Shows if minimum purchase required
- **Valid Until**: Expiration date
- **Click to Select**: Toggle selection by clicking card

### Discount Calculation
```javascript
// Percentage type
if (promo.type === 'percentage') {
  discount = subtotal * (promo.discountValue / 100);
}

// Fixed type
if (promo.type === 'fixed') {
  discount = Math.min(promo.discountValue, subtotal);
}

// Final total
total = subtotal - promoDiscount - pointsDiscount;
```

---

## Error Handling

### Backend Validation
- Invalid promo code → 404 error
- Expired promotion → 400 error with message
- Below minimum purchase → 400 error with required amount
- Server errors → 500 error with details

### Frontend Handling
- API errors are caught and logged
- Empty promotions array shown if load fails
- No error message displayed to user (silent fail)
- Cart functionality continues to work

---

## Future Enhancements

🔮 **Potential improvements:**
- [ ] Apply promo code via text input
- [ ] Multiple promotions at once
- [ ] Product-specific promotions (via PromotionProduct)
- [ ] Auto-apply best promotion
- [ ] Promotion history for users
- [ ] Promo code usage tracking
- [ ] Category-specific promotions
- [ ] Time-limited flash sales

---

## Summary

✅ **Completed:**
- Backend promotion API with full CRUD
- Frontend integration in cart page
- Real-time promotion loading based on cart value
- Support for percentage and fixed discounts
- Minimum purchase validation
- Date range validation
- Clean UI for promotion selection

🎯 **Result:**
Customer cart page now displays **real promotions from database** instead of mock data, automatically filtered based on cart subtotal and current date!
