# 🛍️ Customer Portal API Integration Guide

## 📋 Tổng quan

Tài liệu này mô tả chi tiết cách tích hợp API cho toàn bộ giao diện Customer Portal, bao gồm:

- Authentication & Profile Management
- Product Browsing & Search
- Shopping Cart
- Order Management
- Membership & Points
- Feedback System

---

## 🏗️ Kiến trúc hiện tại

### Frontend Structure

```
CustomerPortal (Container)
├── CustomerShopPage (Product browsing)
├── CustomerProductDetailPage (Product details)
├── CustomerCartPage (Shopping cart)
├── CustomerOrdersPage (Order history)
├── CustomerProfilePage (User profile)
├── CustomerMembershipPage (Points & promotions)
└── CustomerFeedbackPage (Submit feedback)
```

### State Management (Hiện tại)

- **Local State**: useState trong CustomerPortal
- **Storage**: localStorage cho user session
- **Data**: Mock data trong các components

### Services Available

- ✅ `cartService.js` - Đã có đầy đủ
- ✅ `customerService.js` - Đã có đầy đủ
- ✅ `productService.js` - Đã có
- ❌ `orderService.js` - Cần tạo mới
- ❌ `authService.js` - Cần tạo mới
- ❌ `feedbackService.js` - Cần tạo mới

---

## 🔐 1. AUTHENTICATION & SESSION

### 1.1. Tạo authService.js

```javascript
// client/src/services/authService.js
import apiClient from "./apiClient";

export const authService = {
  /**
   * Đăng nhập customer
   * @param {string} username
   * @param {string} password
   * @returns {Promise} { success, data: { token, customer }, message }
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
        role: "customer", // Chỉ cho phép customer login
      });

      if (response.success && response.data.token) {
        // Lưu token và customer info
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("customerId", response.data.customer._id);
        localStorage.setItem("customerName", response.data.customer.full_name);
        localStorage.setItem("customerEmail", response.data.customer.email);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  },

  /**
   * Đăng ký customer mới
   * @param {Object} registerData - { username, email, password, full_name, phone, address }
   */
  register: async (registerData) => {
    try {
      const response = await apiClient.post("/auth/register", {
        ...registerData,
        role: "customer",
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("customerId");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerEmail");
  },

  /**
   * Kiểm tra authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Lấy thông tin customer từ localStorage
   */
  getCurrentCustomer: () => {
    return {
      id: localStorage.getItem("customerId"),
      name: localStorage.getItem("customerName"),
      email: localStorage.getItem("customerEmail"),
    };
  },
};

export default authService;
```

### 1.2. Cập nhật CustomerPortal.jsx

```javascript
// Thêm vào đầu file
import { useEffect } from "react";
import authService from "../../services/authService";

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("shop");
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Thay thế mock data bằng real data
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerData, setCustomerData] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const customer = authService.getCurrentCustomer();
    setCustomerId(customer.id);
    setCustomerName(customer.name);

    // Load customer details
    loadCustomerData(customer.id);
  }, [navigate]);

  const loadCustomerData = async (id) => {
    const result = await customerService.getById(id);
    if (result.success) {
      setCustomerData(result.data);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // ... rest of component
};
```

---

## 🛒 2. SHOPPING CART INTEGRATION

### 2.1. Cập nhật CustomerPortal - Cart State

```javascript
const CustomerPortal = () => {
  // ... existing states

  // Replace local cart state with API-backed cart
  const [cartId, setCartId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Load cart when customer is loaded
  useEffect(() => {
    if (customerId) {
      loadCart();
    }
  }, [customerId]);

  /**
   * Load cart từ backend
   */
  const loadCart = async () => {
    setCartLoading(true);
    try {
      const result = await cartService.getCartByCustomer(customerId);

      if (result.success) {
        setCartId(result.data._id);
        // Transform cart items to match frontend format
        const items = result.data.items.map((item) => ({
          id: item.product_id._id,
          name: item.product_id.name,
          price: item.unit_price,
          quantity: item.quantity,
          image: item.product_id.image,
          // ... other product fields
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  /**
   * Add product to cart
   */
  const handleAddToCart = async (product) => {
    try {
      const result = await cartService.addItem(
        cartId,
        product.id,
        product.quantity || 1
      );

      if (result.success) {
        // Reload cart to get updated data
        await loadCart();
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      return { success: false, message: "Failed to add to cart" };
    }
  };

  /**
   * Update cart item quantity
   */
  const handleUpdateCartItem = async (productId, quantity) => {
    if (quantity <= 0) {
      return handleRemoveFromCart(productId);
    }

    try {
      // Find cart item by product_id
      const cartItem = cartItems.find((item) => item.id === productId);
      if (!cartItem) return;

      const result = await cartService.updateItemQuantity(
        cartItem.itemId, // Cần lưu itemId từ cart API
        quantity
      );

      if (result.success) {
        await loadCart();
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  /**
   * Remove item from cart
   */
  const handleRemoveFromCart = async (productId) => {
    try {
      const cartItem = cartItems.find((item) => item.id === productId);
      if (!cartItem) return;

      const result = await cartService.removeItem(cartItem.itemId);

      if (result.success) {
        await loadCart();
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  /**
   * Clear entire cart
   */
  const handleClearCart = async () => {
    try {
      const result = await cartService.clearCart(cartId);

      if (result.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  // ... rest of component
};
```

### 2.2. Cập nhật CustomerCartPage

```javascript
// CustomerCartPage cần nhận thêm props
const CustomerCartPage = ({
  cartItems,
  cartId, // NEW
  customerId, // NEW
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  onCheckout,
  membershipPoints,
  loading, // NEW
}) => {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Load promotions from backend
  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    // TODO: Implement promotion service
    // const result = await promotionService.getActive();
    // setPromotions(result.data);
  };

  /**
   * Apply promotion to cart
   */
  const handleApplyPromo = async (promo) => {
    setApplyingPromo(true);
    try {
      const result = await cartService.applyPromo(cartId, promo.code);

      if (result.success) {
        setSelectedPromo(promo);
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      console.error("Failed to apply promo:", error);
    } finally {
      setApplyingPromo(false);
    }
  };

  /**
   * Checkout cart and create order
   */
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      // Show error
      return;
    }

    try {
      // Create order from cart
      const result = await orderService.createFromCart({
        cart_id: cartId,
        customer_id: customerId,
        delivery_address: "...", // From profile or input
      });

      if (result.success) {
        // Clear cart
        await onClearCart();
        // Navigate to orders
        onCheckout();
        // Show success message
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  // ... rest of component
};
```

---

## 📦 3. PRODUCT MANAGEMENT

### 3.1. Cập nhật CustomerShopPage

```javascript
import { useState, useEffect } from "react";
import productService from "../../services/productService";

const CustomerShopPage = ({ onAddToCart, onViewCart, onViewProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load products from backend
  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory, sortBy, page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy !== 'default' ? sortBy : undefined,
        inStock: true // Chỉ hiển thị sản phẩm còn hàng
      };

      const result = await productService.getAll(params);

      if (result.success) {
        setProducts(result.data);
        setTotalPages(result.pages);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add to cart with API integration
   */
  const handleAddToCart = async (product) => {
    if (!product.inStock) return;

    const result = await onAddToCart(product);

    if (result.success) {
      setSuccessMessage(`${product.name} added to cart!`);
    } else {
      setErrorMessage(result.message || 'Failed to add to cart');
    }
  };

  // ... rest of component with loading states

  if (loading) {
    return <div className="loading-spinner">Loading products...</div>;
  }

  return (
    // ... JSX with products from API
  );
};
```

### 3.2. Cập nhật CustomerProductDetailPage

```javascript
const CustomerProductDetailPage = ({
  productId,
  onBack,
  onAddToCart,
  onViewProduct,
}) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Load product details from API
  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const result = await productService.getById(productId);

      if (result.success) {
        setProduct(result.data);
        // Load related products (same category)
        loadRelatedProducts(result.data.category);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (category) => {
    try {
      const result = await productService.getAll({
        category,
        limit: 4,
        inStock: true,
      });

      if (result.success) {
        // Exclude current product
        const related = result.data.filter((p) => p._id !== productId);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Failed to load related products:", error);
    }
  };

  const handleAddToCart = async () => {
    const result = await onAddToCart({ ...product, quantity });

    if (result.success) {
      setSuccessMessage(`${quantity} ${product.name}(s) added to cart!`);
    } else {
      setErrorMessage(result.message);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!product) {
    return <div className="error-message">Product not found</div>;
  }

  // ... rest of component
};
```

---

## 📋 4. ORDER MANAGEMENT

### 4.1. Tạo orderService.js

```javascript
// client/src/services/orderService.js
import apiClient from "./apiClient";

const API_BASE_URL = "/orders";

export const orderService = {
  /**
   * Lấy danh sách orders của customer
   * @param {string} customerId
   * @param {Object} params - { page, limit, status, sort }
   */
  getByCustomer: async (customerId, params = {}) => {
    try {
      const response = await apiClient.get(
        `${API_BASE_URL}/customer/${customerId}`,
        {
          params,
        }
      );

      return {
        success: response.success !== false,
        data: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        pages: response.pages || 1,
      };
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  },

  /**
   * Lấy chi tiết order
   * @param {string} orderId
   */
  getById: async (orderId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/${orderId}`);

      return {
        success: response.success !== false,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  },

  /**
   * Tạo order từ cart
   * @param {Object} orderData - { cart_id, customer_id, delivery_address, notes }
   */
  createFromCart: async (orderData) => {
    try {
      const response = await apiClient.post(API_BASE_URL, orderData);

      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || "Order created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to create order",
        data: null,
      };
    }
  },

  /**
   * Hủy order
   * @param {string} orderId
   * @param {string} reason - Lý do hủy
   */
  cancel: async (orderId, reason) => {
    try {
      const response = await apiClient.patch(
        `${API_BASE_URL}/${orderId}/cancel`,
        {
          reason,
        }
      );

      return {
        success: response.success !== false,
        data: response.data,
        message: response.message || "Order cancelled",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to cancel order",
      };
    }
  },
};

export default orderService;
```

### 4.2. Cập nhật CustomerOrdersPage

```javascript
import { useState, useEffect } from "react";
import orderService from "../../services/orderService";

const CustomerOrdersPage = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOrder, setModalOrder] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  // Load orders from backend
  useEffect(() => {
    if (customerId) {
      loadOrders();
    }
  }, [customerId, filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        status: filterStatus !== "all" ? filterStatus : undefined,
        sort: "-order_date", // Newest first
        limit: 100,
      };

      const result = await orderService.getByCustomer(customerId, params);

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load order details for modal
   */
  const openModal = async (order, e) => {
    e.stopPropagation();

    try {
      const result = await orderService.getById(order._id);

      if (result.success) {
        setModalOrder(result.data);
      }
    } catch (error) {
      console.error("Failed to load order details:", error);
    }
  };

  /**
   * Cancel order
   */
  const confirmCancelOrder = async () => {
    if (!confirmCancel) return;

    try {
      const result = await orderService.cancel(
        confirmCancel._id,
        "Customer requested cancellation"
      );

      if (result.success) {
        // Reload orders
        await loadOrders();
        // Close modal if open
        if (modalOrder && modalOrder._id === confirmCancel._id) {
          setModalOrder(null);
        }
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setConfirmCancel(null);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading orders...</div>;
  }

  // ... rest of component
};
```

---

## 👤 5. PROFILE MANAGEMENT

### 5.1. Cập nhật CustomerProfilePage

```javascript
import { useState, useEffect } from "react";
import customerService from "../../services/customerService";

const CustomerProfilePage = ({ customerId }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load customer profile
  useEffect(() => {
    if (customerId) {
      loadProfile();
    }
  }, [customerId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await customerService.getById(customerId);

      if (result.success) {
        const customer = result.data;
        setFormData({
          firstName: customer.full_name.split(" ")[0] || "",
          lastName: customer.full_name.split(" ").slice(1).join(" ") || "",
          email: customer.email,
          phone: customer.phone || "",
          address: customer.address || "",
          // Parse address if structured
          city: "",
          state: "",
          zipCode: "",
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setErrorMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMessage("");

    try {
      const updateData = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      const result = await customerService.update(customerId, updateData);

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        // Update localStorage name
        localStorage.setItem("customerName", updateData.full_name);
      } else {
        setErrorMessage(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrorMessage("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.new !== passwordData.confirm) {
      setErrorMessage("New passwords do not match!");
      return;
    }

    if (passwordData.new.length < 6) {
      setErrorMessage("Password must be at least 6 characters!");
      return;
    }

    try {
      // TODO: Implement password change API
      // const result = await authService.changePassword(
      //   customerId,
      //   passwordData.current,
      //   passwordData.new
      // );

      setSuccessMessage("Password changed successfully!");
      setShowPasswordDialog(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      setErrorMessage("Failed to change password");
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading profile...</div>;
  }

  // ... rest of component
};
```

---

## 🎁 6. MEMBERSHIP & POINTS

### 6.1. Cập nhật CustomerMembershipPage

```javascript
const CustomerMembershipPage = ({ customerId }) => {
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    if (customerId) {
      loadMembershipData();
      loadPromotions();
    }
  }, [customerId]);

  const loadMembershipData = async () => {
    try {
      const result = await customerService.getById(customerId);

      if (result.success) {
        setMembershipData({
          points: result.data.membership_points || 0,
          tier: result.data.membership_type || "Regular",
          totalSpent: result.data.total_spent || 0,
          ordersCount: result.data.orders_count || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load membership data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPromotions = async () => {
    try {
      // TODO: Implement promotion service
      // const result = await promotionService.getActive();
      // setPromotions(result.data);
    } catch (error) {
      console.error("Failed to load promotions:", error);
    }
  };

  // ... rest of component
};
```

---

## 💬 7. FEEDBACK SYSTEM

### 7.1. Tạo feedbackService.js

```javascript
// client/src/services/feedbackService.js
import apiClient from "./apiClient";

const API_BASE_URL = "/feedback"; // Cần tạo route này trên backend

export const feedbackService = {
  /**
   * Submit feedback
   * @param {Object} feedbackData - { customer_id, type, rating, sentiment, subject, message }
   */
  submit: async (feedbackData) => {
    try {
      const response = await apiClient.post(API_BASE_URL, feedbackData);

      return {
        success: response.success !== false,
        message: response.message || "Feedback submitted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to submit feedback",
      };
    }
  },
};

export default feedbackService;
```

### 7.2. Cập nhật CustomerFeedbackPage

```javascript
import feedbackService from "../../services/feedbackService";

const CustomerFeedbackPage = ({ customerId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [feedbackType, setFeedbackType] = useState("general");
  const [rating, setRating] = useState(0);
  const [sentiment, setSentiment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!sentiment) {
      setErrorMessage("Please select your experience rating");
      return;
    }

    if (rating === 0) {
      setErrorMessage("Please provide a star rating");
      return;
    }

    setSubmitting(true);

    try {
      const feedbackData = {
        customer_id: customerId,
        type: feedbackType,
        rating: rating,
        sentiment: sentiment,
        subject: formData.subject,
        message: formData.message,
      };

      const result = await feedbackService.submit(feedbackData);

      if (result.success) {
        setSuccessMessage(
          "Thank you for your feedback! We appreciate your input."
        );
        // Reset form
        setFormData({ name: "", email: "", subject: "", message: "" });
        setRating(0);
        setSentiment("");
        setFeedbackType("general");
      } else {
        setErrorMessage(result.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setErrorMessage("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  // ... rest of component
};
```

---

## 🔧 8. IMPLEMENTATION CHECKLIST

### Phase 1: Authentication & Profile (Priority: HIGH)

- [ ] Tạo `authService.js`
- [ ] Tạo Login page
- [ ] Tạo Register page
- [ ] Implement authentication check trong CustomerPortal
- [ ] Update CustomerPortal với real customer data
- [ ] Update CustomerProfilePage với API integration
- [ ] Test login/logout flow

### Phase 2: Shopping Cart (Priority: HIGH)

- [ ] Update CustomerPortal cart state với cartService
- [ ] Update CustomerCartPage với API calls
- [ ] Implement cart item transformation (API format ↔ Frontend format)
- [ ] Test add/update/remove cart items
- [ ] Implement promo code functionality
- [ ] Test cart persistence across sessions

### Phase 3: Products (Priority: HIGH)

- [ ] Update CustomerShopPage với productService
- [ ] Implement search, filter, pagination
- [ ] Update CustomerProductDetailPage với API
- [ ] Load related products from API
- [ ] Test product browsing và add to cart

### Phase 4: Orders (Priority: MEDIUM)

- [ ] Tạo `orderService.js`
- [ ] Update CustomerOrdersPage với API
- [ ] Implement order detail modal
- [ ] Implement order cancellation
- [ ] Test order creation from cart
- [ ] Test order history loading

### Phase 5: Membership & Feedback (Priority: LOW)

- [ ] Update CustomerMembershipPage với API
- [ ] Load real membership points và promotions
- [ ] Tạo `feedbackService.js`
- [ ] Update CustomerFeedbackPage với API
- [ ] Test feedback submission

### Phase 6: Error Handling & Loading States (Priority: MEDIUM)

- [ ] Add loading spinners cho tất cả API calls
- [ ] Implement error boundaries
- [ ] Add retry logic cho failed requests
- [ ] Improve error messages
- [ ] Add optimistic UI updates

### Phase 7: Testing & Optimization (Priority: MEDIUM)

- [ ] Test toàn bộ user flow end-to-end
- [ ] Test error scenarios
- [ ] Optimize re-renders
- [ ] Implement caching strategies
- [ ] Add analytics tracking

---

## 📝 9. NOTES VÀ BEST PRACTICES

### Data Transformation

```javascript
// Helper function để transform cart items từ API sang Frontend format
const transformCartItem = (apiItem) => ({
  id: apiItem.product_id._id,
  itemId: apiItem._id, // Cần cho update/delete operations
  name: apiItem.product_id.name,
  price: apiItem.unit_price,
  quantity: apiItem.quantity,
  image: apiItem.product_id.image,
  inStock: apiItem.product_id.inStock,
  total: apiItem.line_total,
});

// Helper function để transform order từ API sang Frontend format
const transformOrder = (apiOrder) => ({
  id: apiOrder._id,
  orderNumber: apiOrder.order_number,
  date: apiOrder.order_date,
  status: apiOrder.status,
  total: apiOrder.total_amount,
  trackingNumber: apiOrder.tracking_number,
  items: apiOrder.items.map((item) => ({
    id: item.product_id._id,
    name: item.product_id.name,
    quantity: item.quantity,
    price: item.unit_price,
    image: item.product_id.image,
  })),
});
```

### Error Handling Pattern

```javascript
const handleApiCall = async (apiFunction, errorMessage) => {
  try {
    setLoading(true);
    setError(null);

    const result = await apiFunction();

    if (!result.success) {
      setError(result.message || errorMessage);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error(errorMessage, error);
    setError(errorMessage);
    return null;
  } finally {
    setLoading(false);
  }
};
```

### Loading State Pattern

```javascript
// Trong mỗi component
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} onRetry={loadData} />;
}

if (!data || data.length === 0) {
  return <EmptyState message="No data available" />;
}

// Render data
```

---

## 🚀 10. NEXT STEPS

1. **Bắt đầu với Authentication**: Tạo login/register pages và authService
2. **Cart Integration**: Priority cao vì affect user experience
3. **Product Browsing**: Cần để users có thể xem và add products
4. **Orders**: Implement sau khi cart hoạt động
5. **Profile & Feedback**: Có thể implement cuối cùng

Sau khi hoàn thành, bạn sẽ có một Customer Portal hoàn chỉnh với:

- ✅ Real-time cart updates
- ✅ Persistent authentication
- ✅ Order history và tracking
- ✅ Profile management
- ✅ Membership points
- ✅ Feedback system
