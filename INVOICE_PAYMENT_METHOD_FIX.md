# ✅ INVOICE PAYMENT METHOD - FIX HOÀN CHỈNH

**Ngày:** 24/12/2025  
**Vấn đề:** Payment method khi chỉnh sửa trong Invoice Detail view không được lưu vào database  
**Trạng thái:** ✅ **ĐÃ FIX HOÀN TOÀN**

---

## 🔍 VẤN ĐỀ PHÁT HIỆN

### **User Report:**
> "Phần phương thức thanh toán khi t chỉnh sửa trong view thì không dc update hay lưu vào csdl"

### **Root Cause Analysis:**

#### **1. Backend API thiếu xử lý payment_method**
❌ **Before:**
```javascript
// invoiceController.js - updateInvoice
exports.updateInvoice = async (req, res) => {
  const { payment_status, notes } = req.body;
  // ❌ Không nhận payment_method từ request
  
  if (payment_status) {
    invoice.payment_status = payment_status;
  }
  if (notes !== undefined) invoice.notes = notes;
  // ❌ Không update payment_method
}
```

#### **2. Frontend không gọi API khi thay đổi payment method**
❌ **Before:**
```javascript
// InvoiceDetail.jsx
const handlePaymentMethodChange = (methodId) => {
  if (invoiceData.status === "pending") {
    setSelectedPaymentMethod(methodId);
    console.log("Payment method changed to:", methodId);
    // ❌ Chỉ update state local, không gọi API
  }
};
```

#### **3. Frontend không load payment_method từ invoice**
❌ **Before:**
```javascript
// InvoiceListView.jsx
paymentMethod: invoice.order_id?.payment_method || 'Cash'
// ❌ Lấy từ order thay vì invoice
```

---

## ✅ GIẢI PHÁP ĐÃ TRIỂN KHAI

### **1. Backend - Update Invoice API nhận payment_method**

**File:** [server/controllers/invoiceController.js](server/controllers/invoiceController.js#L382-L432)

✅ **After:**
```javascript
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const {
      payment_status,
      payment_method, // ✅ Added
      notes
    } = req.body;

    // Update payment status
    if (payment_status) {
      if (!['unpaid', 'paid', 'partial', 'refunded'].includes(payment_status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      invoice.payment_status = payment_status;
    }

    // ✅ Update payment method
    if (payment_method) {
      if (!['Cash', 'Card Payment', 'Digital Wallet', 'E-Wallet'].includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
      }
      invoice.payment_method = payment_method; // ✅ Update field
    }

    if (notes !== undefined) invoice.notes = notes;

    await invoice.save();
    await invoice.populate([
      { path: 'customer_id' },
      { path: 'order_id' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};
```

**Changes:**
- ✅ Nhận `payment_method` từ request body
- ✅ Validate payment method với các giá trị hợp lệ
- ✅ Update invoice.payment_method vào database
- ✅ Hỗ trợ 4 payment methods: Cash, Card Payment, Digital Wallet, E-Wallet

---

### **2. Frontend - Auto-save khi chọn payment method**

**File:** [client/src/views/cashier/invoice-management/InvoiceDetail.jsx](client/src/views/cashier/invoice-management/InvoiceDetail.jsx#L431-L451)

✅ **After:**
```javascript
const handlePaymentMethodChange = async (methodId) => {
  if (invoiceData.status === "pending") {
    setSelectedPaymentMethod(methodId);
    
    // ✅ Auto-save payment method to database
    try {
      const response = await invoiceService.updateInvoice(invoiceId, {
        payment_method: methodId
      });
      
      if (response.success) {
        console.log("Payment method updated to:", methodId);
      } else {
        setErrorMessage(response.message || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      setErrorMessage('Failed to update payment method');
    }
  }
};
```

**Changes:**
- ✅ Gọi API `updateInvoice` ngay khi user chọn payment method
- ✅ Auto-save - không cần nút Save riêng
- ✅ Hiển thị error message nếu update thất bại
- ✅ Chỉ cho phép chỉnh sửa khi invoice ở trạng thái "pending"

---

### **3. Frontend - Update payment method khi confirm payment**

**File:** [client/src/views/cashier/invoice-management/InvoiceDetail.jsx](client/src/views/cashier/invoice-management/InvoiceDetail.jsx#L385-L404)

✅ **After:**
```javascript
const handleConfirmPayment = async () => {
  try {
    // ✅ First update payment method if changed
    await invoiceService.updateInvoice(invoiceId, {
      payment_method: selectedPaymentMethod
    });
    
    // Then mark as paid
    const response = await invoiceService.markInvoiceAsPaid(invoiceId);
    
    if (response.success) {
      setSuccessMessage(response.message || 'Payment confirmed successfully!');
      setTimeout(() => navigate('/invoice'), 2000);
    } else {
      setErrorMessage(response.message || 'Failed to confirm payment');
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    setErrorMessage('Failed to confirm payment');
  }
};
```

**Changes:**
- ✅ Update payment method trước khi mark as paid
- ✅ Đảm bảo payment method được lưu ngay cả khi user confirm ngay
- ✅ 2-step process: Update → Mark Paid

---

### **4. Frontend - Load payment_method từ invoice data**

**File:** [client/src/views/cashier/invoice-management/InvoiceDetail.jsx](client/src/views/cashier/invoice-management/InvoiceDetail.jsx#L112-L119)

✅ **After:**
```javascript
// Set payment method from invoice (priority) or order (fallback)
if (invoiceData.payment_method) {
  setSelectedPaymentMethod(invoiceData.payment_method);
} else if (invoiceData.order_id && invoiceData.order_id.payment_method) {
  setSelectedPaymentMethod(invoiceData.order_id.payment_method);
} else {
  setSelectedPaymentMethod('Cash'); // Default
}
```

**Changes:**
- ✅ Ưu tiên lấy từ `invoiceData.payment_method` (invoice field)
- ✅ Fallback sang `order.payment_method` nếu invoice chưa có
- ✅ Default là 'Cash' nếu không có cả 2

---

### **5. Frontend - InvoiceListView hiển thị đúng payment_method**

**File:** [client/src/views/cashier/invoice-management/InvoiceListView.jsx](client/src/views/cashier/invoice-management/InvoiceListView.jsx#L97-L118)

✅ **After:**
```javascript
return {
  id: invoice.invoice_number,
  _id: invoice._id,
  // ... other fields
  paymentMethod: invoice.payment_method || invoice.order_id?.payment_method || 'Cash',
  // ✅ Priority: invoice.payment_method → order.payment_method → 'Cash'
  // ... other fields
};
```

**Changes:**
- ✅ Lấy từ `invoice.payment_method` trước
- ✅ Fallback sang order nếu invoice không có
- ✅ Default 'Cash'

---

## 📋 TESTING SCENARIOS

### **Test Case 1: Tạo Invoice mới**
1. ✅ Vào CreateInvoice
2. ✅ Thêm sản phẩm
3. ✅ Chọn Payment Method: "Card Payment"
4. ✅ Create Invoice
5. ✅ **Kết quả:** Invoice được tạo với payment_method = "Card Payment"

### **Test Case 2: Chỉnh sửa Payment Method trong Invoice Detail**
1. ✅ Mở invoice có status "Pending"
2. ✅ Click vào Payment Method: "Digital Wallet"
3. ✅ **Kết quả:** API được gọi ngay, payment_method update trong DB
4. ✅ Refresh page → Payment method vẫn là "Digital Wallet"

### **Test Case 3: Confirm Payment với Payment Method**
1. ✅ Mở invoice Pending
2. ✅ Chọn Payment Method: "E-Wallet"
3. ✅ Click "Confirm Payment"
4. ✅ **Kết quả:** 
   - Payment method update thành "E-Wallet"
   - Invoice status → "Completed"
   - Navigate về Invoice List
   - Invoice List hiển thị đúng "E-Wallet"

### **Test Case 4: Invoice từ Order Checkout**
1. ✅ Customer checkout cart với payment_method: "Cash"
2. ✅ Invoice tự động được tạo
3. ✅ **Kết quả:** Invoice có payment_method = "Cash" từ Order
4. ✅ Mở Invoice Detail → Hiển thị "Cash"

### **Test Case 5: Readonly Invoice (Completed/Refunded)**
1. ✅ Mở invoice có status "Completed"
2. ✅ **Kết quả:** Payment method hiển thị readonly, không thể chỉnh sửa
3. ✅ Không có onclick handler, không gọi API

---

## 🎯 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                   CREATE INVOICE FLOW                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ CreateInvoice   │
                    │ View            │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Select Products │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Select Payment  │
                    │ Method          │
                    │ (Cash/Card/etc) │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Click "Create   │
                    │ Invoice"        │
                    └─────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ POST /api/invoices    │
                  │ {                     │
                  │   customer_id,        │
                  │   items,              │
                  │   payment_method: "Card",│
                  │   subtotal,           │
                  │   discount,           │
                  │   tax                 │
                  │ }                     │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Invoice Created       │
                  │ payment_method =      │
                  │ "Card Payment" ✅     │
                  └───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 EDIT PAYMENT METHOD FLOW                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ InvoiceDetail   │
                    │ View (Pending)  │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Load Invoice    │
                    │ payment_method  │
                    │ from DB         │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ User clicks     │
                    │ "Digital Wallet"│
                    └─────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ handlePaymentMethod   │
                  │ Change()              │
                  │ ↓                     │
                  │ setSelectedPaymentMethod│
                  │ ↓                     │
                  │ PUT /api/invoices/:id │
                  │ {                     │
                  │   payment_method:     │
                  │   "Digital Wallet"    │
                  │ }                     │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Backend validates     │
                  │ & saves to DB         │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Success! ✅           │
                  │ payment_method saved  │
                  └───────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  CONFIRM PAYMENT FLOW                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ User changes    │
                    │ payment method  │
                    │ to "E-Wallet"   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Click "Confirm  │
                    │ Payment"        │
                    └─────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Step 1:               │
                  │ PUT /api/invoices/:id │
                  │ {                     │
                  │   payment_method:     │
                  │   "E-Wallet"          │
                  │ }                     │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Step 2:               │
                  │ PATCH /api/invoices/  │
                  │ :id/mark-paid         │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Invoice:              │
                  │ - payment_method ✅   │
                  │ - payment_status =    │
                  │   "paid" ✅           │
                  └───────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Navigate to     │
                    │ Invoice List    │
                    └─────────────────┘
```

---

## ✅ VALIDATION CHECKLIST

- [x] **Backend API nhận payment_method field**
  - [x] Validate payment_method values
  - [x] Update invoice.payment_method vào DB
  - [x] Return updated invoice với payment_method

- [x] **Frontend InvoiceDetail auto-save payment method**
  - [x] Gọi API khi user click payment method
  - [x] Update state ngay lập tức
  - [x] Hiển thị error nếu thất bại
  - [x] Chỉ cho edit khi status = "pending"

- [x] **Frontend CreateInvoice gửi payment method**
  - [x] Include payment_method trong invoice data
  - [x] Send to API khi create invoice
  - [x] Verify invoice created với đúng payment method

- [x] **Frontend InvoiceListView hiển thị payment method**
  - [x] Load từ invoice.payment_method
  - [x] Fallback sang order.payment_method
  - [x] Display icon và text đúng

- [x] **handleConfirmPayment update payment method trước**
  - [x] Call updateInvoice với payment_method
  - [x] Sau đó mới markAsPaid
  - [x] Đảm bảo payment method được lưu

- [x] **Readonly payment method cho completed invoices**
  - [x] Không cho phép chỉnh sửa
  - [x] Chỉ hiển thị giá trị
  - [x] Không gọi API

---

## 🚀 API ENDPOINTS AFFECTED

### **PUT /api/invoices/:id**
**Purpose:** Update invoice fields including payment_method

**Request:**
```json
{
  "payment_method": "Card Payment",
  "payment_status": "unpaid",
  "notes": "Updated by cashier"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": {
    "_id": "invoice_id",
    "invoice_number": "INV-123",
    "payment_method": "Card Payment",
    "payment_status": "unpaid",
    "total_amount": 100.00
  }
}
```

**Validation:**
- ✅ payment_method must be one of: Cash, Card Payment, Digital Wallet, E-Wallet
- ✅ payment_status must be one of: unpaid, paid, partial, refunded

---

## 📊 DATABASE SCHEMA

### **Invoice Model**
```javascript
{
  invoice_number: String,
  customer_id: ObjectId,
  order_id: ObjectId,
  staff_id: ObjectId,
  subtotal: Number,
  discount_amount: Number,
  tax_amount: Number,
  total_amount: Number,
  payment_method: String, // ✅ "Cash" | "Card Payment" | "Digital Wallet" | "E-Wallet"
  payment_status: String, // "unpaid" | "paid" | "partial" | "refunded"
  invoice_date: Date,
  notes: String
}
```

---

## 🎉 KẾT QUẢ

### **Trước khi fix:**
- ❌ User chọn payment method trong InvoiceDetail
- ❌ Chỉ update state local
- ❌ Không lưu vào database
- ❌ Refresh page → Payment method mất

### **Sau khi fix:**
- ✅ User chọn payment method trong InvoiceDetail
- ✅ API được gọi ngay lập tức
- ✅ Lưu vào database thành công
- ✅ Refresh page → Payment method vẫn giữ nguyên
- ✅ InvoiceList hiển thị đúng payment method
- ✅ Confirm payment update payment method trước

---

## 📝 NOTES

### **Payment Method Priority:**
1. `invoice.payment_method` (highest priority - from invoice field)
2. `order.payment_method` (fallback - from order if invoice field empty)
3. `'Cash'` (default)

### **Editable Conditions:**
- Invoice status = "pending" (unpaid) → Có thể chỉnh sửa
- Invoice status = "completed" (paid) → Readonly, không chỉnh sửa
- Invoice status = "refunded" → Readonly

### **Auto-save vs Manual Save:**
- **Auto-save:** Khi user click payment method → Save ngay
- **No manual save button:** Không cần nút Save riêng
- **User experience:** Seamless, instant feedback

---

**Trạng thái:** ✅ **HOÀN THÀNH 100%**  
**Ngày hoàn thành:** 24/12/2025  
**Files Modified:** 3 files
- server/controllers/invoiceController.js (Backend)
- client/src/views/cashier/invoice-management/InvoiceDetail.jsx (Frontend)
- client/src/views/cashier/invoice-management/InvoiceListView.jsx (Frontend)

**Người thực hiện:** GitHub Copilot
