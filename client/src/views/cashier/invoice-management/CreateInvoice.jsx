import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaUser,
  FaReceipt,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateInvoice.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";
import { productService } from "../../../services/productService";
import { customerService } from "../../../services/customerService";
import { cartService } from "../../../services/cartService";
import { invoiceService } from "../../../services/invoiceService";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Product search and filter states
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  // Show product list by default so cashier can see products on load
  const [showProductList, setShowProductList] = useState(true);

  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  // Product quantities in search results
  const [productQuantities, setProductQuantities] = useState({});

  // Loading states
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Demo customer ID (first customer from DB - simulating logged in user)
  const [demoCustomerId, setDemoCustomerId] = useState(null);
  const [currentCart, setCurrentCart] = useState(null);
  const [currentCartId, setCurrentCartId] = useState(null);
  // Track whether we've initialized/cleared the demo cart (avoid pre-filled seed items)
  const [cartInitialized, setCartInitialized] = useState(false);

  // Available customers for selection (from API)
  const [availableCustomers, setAvailableCustomers] = useState([]);

  // Available products for selection (from API)
  const [availableProducts, setAvailableProducts] = useState([]);

  // Available payment methods
  const paymentMethods = [
    { id: "Card Payment", name: "Card Payment", icon: "💳" },
    { id: "Cash", name: "Cash", icon: "💰" },
    { id: "Digital Wallet", name: "Digital Wallet", icon: "📱" },
  ];

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  // Product list state - products added to invoice
  const [products, setProducts] = useState([]);

  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    id: null,
    type: "Guest Customer",
    name: "Guest Customer",
    description: "Walk-in customer",
    contact: "No contact information",
    hasInfo: false,
  });

  // Discount & Promotion state
  const [discount, setDiscount] = useState(() => {
    if (location.state?.selectedPromotion) {
      const selectedPromotion = location.state.selectedPromotion;
      window.history.replaceState({}, document.title);

      return {
        code: selectedPromotion.code,
        type: selectedPromotion.type,
        name: selectedPromotion.title,
        description: selectedPromotion.description,
        percentage:
          parseFloat(selectedPromotion.discount.replace(/[^0-9]/g, "")) || 0,
        validPeriod: selectedPromotion.validPeriod,
      };
    }
    return null;
  });

  // ========== API FUNCTIONS ==========

  // Load products from API (supports params)
  const loadProducts = async (params = {}) => {
    try {
      setIsLoadingProducts(true);
      console.log("🛒 Loading products from API with params...", params);

      const response = await productService.getAll({ limit: 100, ...params });

      if (response.success && response.data) {
        // Transform API products to match frontend format
        const transformedProducts = response.data.map((product) => ({
          id: product._id,
          name: product.name,
          category: product.category || "Other",
          price: product.price,
          stock: product.current_stock ?? product.stock_quantity ?? 0,
        }));

        setAvailableProducts(transformedProducts);
        console.log("✅ Loaded products:", transformedProducts.length);
      } else {
        setErrorMessage("Failed to load products");
      }
    } catch (error) {
      console.error("❌ Error loading products:", error);
      setErrorMessage("Error loading products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Debounced search/filter: fetch from server when searchTerm or categoryFilter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = {};
      if (productSearchTerm && productSearchTerm.trim().length > 0)
        params.search = productSearchTerm.trim();
      if (categoryFilter && categoryFilter !== "All Categories")
        params.category = categoryFilter;

      // Show product list when search has text, otherwise keep existing show state
      if (productSearchTerm.trim().length > 0) setShowProductList(true);

      loadProducts(params);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [productSearchTerm, categoryFilter]);

  // Load customers from API
  const loadCustomers = async () => {
    try {
      setIsLoadingCustomers(true);
      console.log("🛒 Loading customers from API...");

      const response = await customerService.getAll({ limit: 100 });

      if (response.success && response.data) {
        // Transform API customers to match frontend format
        const transformedCustomers = response.data.map((customer) => ({
          id: customer._id,
          name: customer.account_id?.full_name || "N/A",
          email: customer.account_id?.email || "N/A",
          phone: customer.account_id?.phone || "N/A",
          type: customer.membership_type || "Standard",
        }));

        setAvailableCustomers(transformedCustomers);

        // Set first customer as demo customer
        if (transformedCustomers.length > 0) {
          const firstCustomer = response.data[0]; // Use original data
          setDemoCustomerId(firstCustomer._id);
          console.log("✅ Demo customer ID set:", firstCustomer._id);
          // Ensure cart exists and clear any seeded items on mount so cashier sees an empty cart
          try {
            await ensureCartExists();
          } catch (err) {
            console.warn("Could not ensure cart on init:", err);
          }
        }

        console.log("✅ Loaded customers:", transformedCustomers.length);
      } else {
        setErrorMessage("Failed to load customers");
      }
    } catch (error) {
      console.error("❌ Error loading customers:", error);
      setErrorMessage("Error loading customers");
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Load cart for customer
  const loadCart = async (customerId) => {
    try {
      setIsLoadingCart(true);
      console.log("🛒 Loading cart for customer:", customerId);

      const response = await cartService.getCartByCustomer(customerId);

      if (response.success && response.data) {
        setCurrentCart(response.data);
        setCurrentCartId(response.data._id);

        // Load cart items into products array
        if (response.data.cartItems && response.data.cartItems.length > 0) {
          const cartProducts = response.data.cartItems.map((item) => ({
            id: item.product_id?._id,
            name: item.product_id?.name,
            category: item.product_id?.category || "Other",
            price: item.unit_price,
            stock:
              item.product_id?.current_stock ??
              item.product_id?.stock_quantity ??
              0,
            quantity: item.quantity,
            total: item.line_total,
            cartItemId: item._id, // Store cart item ID for updates
          }));

          setProducts(cartProducts);
          console.log("✅ Loaded cart items:", cartProducts.length);
        }
      }
    } catch (error) {
      console.error("❌ Error loading cart:", error);
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Ensure there is a cart for demoCustomerId (create if missing). On first initialization,
  // clear any pre-existing items (seed data) so cashier starts with an empty cart.
  const ensureCartExists = async () => {
    if (cartInitialized) {
      return currentCartId || null;
    }
    if (!demoCustomerId) {
      return null;
    }
    try {
      const resp = await cartService.getCartByCustomer(demoCustomerId);
      if (resp.success && resp.data) {
        setCurrentCart(resp.data);
        setCurrentCartId(resp.data._id);
        // If seeded cart has items, clear them on first init
        if (resp.data.cartItems && resp.data.cartItems.length > 0) {
          const clearResp = await cartService.clearCart(resp.data._id);
          if (!clearResp.success) {
            console.warn("Failed to clear seeded cart:", clearResp.message);
          } else {
            setProducts([]);
          }
        }
        setCartInitialized(true);
        return resp.data._id;
      }
    } catch (err) {
      console.error("Error ensuring cart exists:", err);
    }
    setCartInitialized(true);
    return null;
  };

  // Load all data on mount
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  // Filter available products
  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(productSearchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All Categories" ||
      product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter available customers
  const filteredCustomers = availableCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(customerSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate totals
  const subtotal = products.reduce((sum, product) => sum + product.total, 0);
  const discountAmount = discount
    ? (subtotal * discount.percentage) / 100
    : 0.0;
  const taxRate = 0.09; // 9% tax
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const totalAmount = subtotal - discountAmount + taxAmount;

  const handleCustomerAction = () => {
    if (customerInfo.hasInfo) {
      navigate(`/customer/edit/${customerInfo.id}`);
    } else {
      navigate("/customer/add");
    }
  };

  const handleSelectCustomer = (customer) => {
    setCustomerInfo({
      id: customer.id,
      type: "Registered Customer",
      name: customer.name,
      description: `${customer.type} customer`,
      contact: customer.email,
      hasInfo: true,
    });
    setShowCustomerList(false);
    setCustomerSearchTerm("");
  };

  const handleClearCustomer = () => {
    setCustomerInfo({
      id: null,
      type: "Guest Customer",
      name: "Guest Customer",
      description: "Walk-in customer",
      contact: "No contact information",
      hasInfo: false,
    });
  };

  // Handle product quantity change in search results
  const handleProductQuantityChange = (productId, quantity) => {
    if (quantity >= 0) {
      setProductQuantities((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  // Add product with specified quantity
  const handleAddProductWithQuantity = async (product) => {
    // Ensure cart exists (and clear seeded items if first time)
    const cartId = await ensureCartExists();

    const quantity = productQuantities[product.id] || 1;
    if (quantity > 0) {
      const existingProduct = products.find((p) => p.id === product.id);
      const currentQuantity = existingProduct ? existingProduct.quantity : 0;
      const totalQuantity = currentQuantity + quantity;

      // Check if total quantity exceeds stock
      if (totalQuantity > product.stock) {
        setErrorMessage(
          `Cannot add ${quantity} items. Stock available: ${
            product.stock
          }, Current in cart: ${currentQuantity}, Maximum you can add: ${
            product.stock - currentQuantity
          }`
        );
        return;
      }

      // Call Cart API
      if (cartId) {
        const response = await cartService.addItem(
          cartId,
          product.id,
          quantity
        );

        if (response.success && response.data) {
          // Reload cart to get updated items
          await loadCart(demoCustomerId);
          setSuccessMessage("Product added to cart");
        } else {
          setErrorMessage(response.message || "Failed to add product to cart");
        }
      } else {
        setErrorMessage("No active cart found");
      }

      // Reset quantity after adding
      setProductQuantities((prev) => ({
        ...prev,
        [product.id]: 0,
      }));
    }
  };

  const handlePromotionAction = () => {
    navigate("/promotion-selection", {
      state: { createInvoice: true },
    });
  };

  const handleRemovePromotion = () => {
    setDiscount(null);
  };

  const handleAddProduct = async (product) => {
    // Ensure cart exists (and clear seeded items if first time)
    const cartId = await ensureCartExists();

    const existingProduct = products.find((p) => p.id === product.id);
    if (existingProduct) {
      if (existingProduct.quantity >= product.stock) {
        setErrorMessage(
          `Cannot add more items. Stock available: ${product.stock}`
        );
        return;
      }
      await handleQuantityChange(product.id, existingProduct.quantity + 1);
    } else {
      // Call Cart API to add new product
      if (cartId) {
        const response = await cartService.addItem(cartId, product.id, 1);

        if (response.success && response.data) {
          await loadCart(demoCustomerId);
          setSuccessMessage("Product added to cart");
        } else {
          setErrorMessage(response.message || "Failed to add product");
        }
      } else {
        setErrorMessage("No active cart found");
      }
    }
    setShowProductList(false);
    setProductSearchTerm("");
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemoveProduct(productId);
      return;
    }

    // Find the original product to check stock
    const originalProduct = availableProducts.find((p) => p.id === productId);
    if (originalProduct && newQuantity > originalProduct.stock) {
      setErrorMessage(
        `Cannot set quantity to ${newQuantity}. Stock available: ${originalProduct.stock}`
      );
      return;
    }

    // Find cart item ID
    const cartProduct = products.find((p) => p.id === productId);
    if (cartProduct && cartProduct.cartItemId) {
      const response = await cartService.updateQuantity(
        cartProduct.cartItemId,
        newQuantity
      );

      if (response.success && response.data) {
        await loadCart(demoCustomerId);
        setSuccessMessage("Quantity updated");
      } else {
        setErrorMessage(response.message || "Failed to update quantity");
      }
    } else {
      setErrorMessage("Cart item not found");
    }
  };

  const handleRemoveProduct = async (productId) => {
    // Find cart item ID
    const cartProduct = products.find((p) => p.id === productId);
    if (cartProduct && cartProduct.cartItemId) {
      const response = await cartService.removeItem(cartProduct.cartItemId);

      if (response.success && response.data) {
        await loadCart(demoCustomerId);
        setSuccessMessage("Product removed from cart");
      } else {
        setErrorMessage(response.message || "Failed to remove product");
      }
    } else {
      // Fallback to local removal if no cartItemId
      setProducts(products.filter((product) => product.id !== productId));
    }
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleCreateInvoice = async () => {
    if (products.length === 0) {
      setErrorMessage("Please add at least one product to create an invoice.");
      return;
    }

    try {
      // Prepare invoice items from products
      const items = products.map((product) => ({
        product_id: product.id,
        description: product.name,
        quantity: product.quantity,
        unit_price: product.price,
        line_total: product.total,
      }));

      // Calculate amounts
      const calculatedSubtotal = subtotal;
      const calculatedDiscountAmount = discountAmount;
      const calculatedTaxAmount = taxAmount;
      const calculatedTotalAmount = totalAmount;

      // Prepare invoice data for API
      const invoiceData = {
        customer_id: customerInfo.id || demoCustomerId,
        items: items,
        payment_method: selectedPaymentMethod, // ✅ Include payment method
        subtotal: calculatedSubtotal, // ✅ Include subtotal
        discount_amount: calculatedDiscountAmount, // ✅ Include discount
        tax_amount: calculatedTaxAmount, // ✅ Include tax
        notes: discount
          ? `Discount applied: ${discount.name} (${discount.percentage}%)`
          : "",
      };

      // Add order_id if cart has been checked out
      if (currentCart && currentCart.order_id) {
        invoiceData.order_id = currentCart.order_id;
      }

      // TODO: Add staff_id from logged-in cashier
      // invoiceData.staff_id = loggedInStaff?.id;

      console.log("Creating invoice with data:", invoiceData);

      // Call API to create invoice
      const response = await invoiceService.createInvoice(invoiceData);

      if (response.success) {
        setSuccessMessage("Invoice created successfully!");

        // Clear backend cart if there is one so next invoice starts fresh
        if (currentCartId) {
          try {
            const clearResp = await cartService.clearCart(currentCartId);
            if (!clearResp.success) {
              console.warn("Failed to clear cart:", clearResp.message);
            }
            // Reload cart state from server (should be empty)
            await loadCart(demoCustomerId);
          } catch (err) {
            console.error("Error clearing cart after invoice:", err);
          }
        }

        // Reset local form state so cashier starts fresh
        setProducts([]);
        setProductQuantities({});
        setCustomerInfo({
          id: null,
          type: "Guest Customer",
          name: "Guest Customer",
          description: "Walk-in customer",
          contact: "No contact information",
          hasInfo: false,
        });
        setDiscount(null);
        setSelectedPaymentMethod("Cash");

        // Auto-hide success message after 2s
        setTimeout(() => setSuccessMessage(""), 2000);
      } else {
        setErrorMessage(response.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setErrorMessage("Failed to create invoice. Please try again.");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="create-invoice-detail-view">
      <SuccessMessage
        message={successMessage}
        onClose={() => {
          setSuccessMessage("");
        }}
      />
      <ErrorMessage
        message={errorMessage}
        onClose={() => {
          setErrorMessage("");
        }}
      />

      {/* Loading State */}
      {(isLoadingProducts || isLoadingCustomers) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              🔄 Loading...
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              {isLoadingProducts && "Loading products..."}
              {isLoadingCustomers && "Loading customers..."}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="create-invoice-page-header">
        <h1 className="create-invoice-page-title">Create New Invoice</h1>
      </div>

      {/* Main Content */}
      <div className="create-invoice-detail-content">
        {/* Left Side - Product List & Customer Info */}
        <div className="create-invoice-form-container">
          {/* Product List Section */}
          <div className="create-invoice-form-section">
            <div className="create-invoice-section-header">
              <h2 className="create-invoice-section-title">Product List</h2>
              <div className="create-invoice-add-product-controls">
                <div className="create-invoice-search-container">
                  <FaSearch className="create-invoice-search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => {
                      setProductSearchTerm(e.target.value);
                      setShowProductList(e.target.value.length > 0);
                    }}
                    onFocus={() =>
                      setShowProductList(productSearchTerm.length > 0)
                    }
                    className="create-invoice-search-input"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="create-invoice-category-filter"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Meat">Meat</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Household">Household</option>
                </select>
              </div>
            </div>

            {/* Product Search Results */}
            {showProductList && (
              <div className="create-invoice-product-search-results">
                <table className="create-invoice-search-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Quantity</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const existingProduct = products.find(
                        (p) => p.id === product.id
                      );
                      const currentInCart = existingProduct
                        ? existingProduct.quantity
                        : 0;
                      const maxAvailable = product.stock - currentInCart;

                      return (
                        <tr
                          key={product.id}
                          className="create-invoice-product-row"
                        >
                          <td>
                            <div className="create-invoice-product-name">
                              {product.name}
                            </div>
                          </td>
                          <td>
                            <span className="create-invoice-product-category-badge">
                              {product.category}
                            </span>
                          </td>
                          <td className="create-invoice-price">
                            {product.price.toLocaleString("vi-VN")}VNĐ
                          </td>
                          <td className="create-invoice-stock">
                            {product.stock}
                            {currentInCart > 0 && (
                              <div className="create-invoice-in-cart-info">
                                (In cart: {currentInCart})
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="create-invoice-quantity-input-container">
                              <button
                                className="create-invoice-quantity-btn"
                                onClick={() =>
                                  handleProductQuantityChange(
                                    product.id,
                                    (productQuantities[product.id] || 0) - 1
                                  )
                                }
                              >
                                <FaMinus />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max={maxAvailable}
                                value={productQuantities[product.id] || 0}
                                onChange={(e) =>
                                  handleProductQuantityChange(
                                    product.id,
                                    Math.min(
                                      parseInt(e.target.value) || 0,
                                      maxAvailable
                                    )
                                  )
                                }
                                className="create-invoice-quantity-input"
                              />
                              <button
                                className="create-invoice-quantity-btn"
                                onClick={() =>
                                  handleProductQuantityChange(
                                    product.id,
                                    Math.min(
                                      (productQuantities[product.id] || 0) + 1,
                                      maxAvailable
                                    )
                                  )
                                }
                                disabled={maxAvailable <= 0}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              className="create-invoice-add-btn"
                              onClick={() =>
                                handleAddProductWithQuantity(product)
                              }
                              disabled={
                                !productQuantities[product.id] ||
                                productQuantities[product.id] === 0 ||
                                maxAvailable <= 0
                              }
                              title={
                                maxAvailable <= 0
                                  ? "Out of stock or all items already in cart"
                                  : ""
                              }
                            >
                              <FaPlus /> Add
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div className="create-invoice-no-results">
                    No products found
                  </div>
                )}
              </div>
            )}

            {/* Selected Products Table */}
            <div className="create-invoice-product-table">
              {products.length > 0 ? (
                <table className="create-invoice-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="create-invoice-product-info">
                            <div className="create-invoice-product-name">
                              {product.name}
                            </div>
                            <div className="create-invoice-product-category">
                              {product.category}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="create-invoice-quantity-controls">
                            <button
                              className="create-invoice-quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  product.id,
                                  product.quantity - 1
                                )
                              }
                            >
                              <FaMinus />
                            </button>
                            <span className="create-invoice-quantity">
                              {product.quantity}
                            </span>
                            <button
                              className="create-invoice-quantity-btn"
                              onClick={() =>
                                handleQuantityChange(
                                  product.id,
                                  product.quantity + 1
                                )
                              }
                            >
                              <FaPlus />
                            </button>
                          </div>
                        </td>
                        <td className="create-invoice-price">
                          {product.price.toLocaleString("vi-VN")}VNĐ
                        </td>
                        <td className="create-invoice-total">
                          {product.total.toLocaleString("vi-VN")}VNĐ
                        </td>
                        <td>
                          <button
                            className="create-invoice-remove-btn"
                            onClick={() => handleRemoveProduct(product.id)}
                            title="Remove product"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : availableProducts.length === 0 ? (
                <div className="create-invoice-empty-products">
                  <div className="create-invoice-empty-icon">📦</div>
                  <p className="create-invoice-empty-text">
                    No products added yet
                  </p>
                  <p className="create-invoice-empty-subtitle">
                    Search and add products to create an invoice
                  </p>
                </div>
              ) : null}

              {products.length > 0 && (
                <div className="create-invoice-subtotal-row">
                  <span>Subtotal ({products.length} items)</span>
                  <span className="create-invoice-subtotal-amount">
                    {subtotal.toLocaleString("vi-VN")}VNĐ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="create-invoice-form-section">
            <div className="create-invoice-section-header">
              <h2 className="create-invoice-section-title">
                Customer Information
              </h2>
              <div className="create-invoice-customer-controls">
                <div className="create-invoice-customer-search-container">
                  <FaSearch className="create-invoice-customer-search-icon" />
                  <input
                    type="text"
                    placeholder="Search customer by name or ID..."
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value);
                      setShowCustomerList(e.target.value.length > 0);
                    }}
                    onFocus={() =>
                      setShowCustomerList(customerSearchTerm.length > 0)
                    }
                    className="create-invoice-customer-search-input"
                  />
                </div>
                <button
                  className={`create-invoice-customer-action-btn ${
                    customerInfo.hasInfo ? "edit" : "add"
                  }`}
                  onClick={handleCustomerAction}
                >
                  {customerInfo.hasInfo ? (
                    <>
                      <FaEdit className="create-invoice-action-icon" />
                      Edit
                    </>
                  ) : (
                    <>
                      <FaPlus className="create-invoice-action-icon" />
                      Add New
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Customer Search Results */}
            {showCustomerList && (
              <div className="create-invoice-customer-search-results">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="create-invoice-customer-result-item"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="create-invoice-customer-avatar-small">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="create-invoice-customer-result-details">
                      <div className="create-invoice-customer-result-name">
                        {customer.name}
                      </div>
                      <div className="create-invoice-customer-result-info">
                        {customer.id} • {customer.email}
                      </div>
                    </div>
                    <div
                      className="create-invoice-customer-type-badge"
                      data-type={customer.type}
                    >
                      {customer.type}
                    </div>
                  </div>
                ))}
                {filteredCustomers.length === 0 && (
                  <div className="create-invoice-no-customer-results">
                    No customers found
                  </div>
                )}
              </div>
            )}

            <div className="create-invoice-customer-card">
              <div className="create-invoice-customer-avatar">
                <span>
                  {customerInfo.hasInfo
                    ? customerInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "GU"}
                </span>
              </div>
              <div className="create-invoice-customer-details">
                <h3 className="create-invoice-customer-name">
                  {customerInfo.name}
                </h3>
                <p className="create-invoice-customer-type">
                  {customerInfo.description}
                </p>
                <p className="create-invoice-customer-contact">
                  {customerInfo.contact}
                </p>
              </div>
              {customerInfo.hasInfo && (
                <button
                  className="create-invoice-clear-customer-btn"
                  onClick={handleClearCustomer}
                  title="Clear customer"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>

          {/* Discount & Promotion Section */}
          <div className="create-invoice-form-section">
            <div className="create-invoice-section-header">
              <h2 className="create-invoice-section-title">
                Discount & Promotion
              </h2>
              <button
                className={`create-invoice-promotion-action-btn ${
                  discount ? "change" : "add"
                }`}
                onClick={handlePromotionAction}
              >
                {discount ? (
                  <>
                    <FaEdit className="create-invoice-action-icon" />
                    Change
                  </>
                ) : (
                  <>
                    <FaPlus className="create-invoice-action-icon" />
                    Add
                  </>
                )}
              </button>
            </div>

            {discount ? (
              <div className="create-invoice-discount-card">
                <div className="create-invoice-discount-header">
                  <div className="create-invoice-discount-code">
                    <span className="create-invoice-promo-code">
                      {discount.code}
                    </span>
                    <span className="create-invoice-promo-type">
                      {discount.type}
                    </span>
                  </div>
                  <div className="create-invoice-discount-badge">
                    {discount.percentage}% OFF
                  </div>
                </div>

                <h3 className="create-invoice-discount-name">
                  {discount.name}
                </h3>
                <p className="create-invoice-discount-description">
                  {discount.description}
                </p>

                <div className="create-invoice-discount-validity">
                  <span>📅 {discount.validPeriod}</span>
                </div>

                <button
                  className="create-invoice-remove-promotion-btn"
                  onClick={handleRemovePromotion}
                >
                  Remove Promotion
                </button>
              </div>
            ) : (
              <div className="create-invoice-no-promotion">
                <div className="create-invoice-no-promotion-icon">🎫</div>
                <p className="create-invoice-no-promotion-text">
                  No promotion applied
                </p>
                <p className="create-invoice-no-promotion-subtitle">
                  Add a promotion to get discounts on your purchase
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Payment Summary */}
        <div className="create-invoice-action-panel">
          <div className="create-invoice-payment-summary">
            <h3 className="create-invoice-summary-title">Payment Summary</h3>

            <div className="create-invoice-summary-row">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString("vi-VN")}VNĐ</span>
            </div>

            <div className="create-invoice-summary-row discount">
              <span>Discount</span>
              <span className="create-invoice-discount-amount">
                -{discountAmount.toLocaleString("vi-VN")}VNĐ
              </span>
            </div>

            <div className="create-invoice-summary-row">
              <span>Tax (9%)</span>
              <span>{taxAmount.toLocaleString("vi-VN")}VNĐ</span>
            </div>

            <div className="create-invoice-summary-row total">
              <span>Total Amount</span>
              <span className="create-invoice-total-amount">
                {totalAmount.toLocaleString("vi-VN")}VNĐ
              </span>
            </div>

            <div className="create-invoice-payment-method">
              <h4 className="create-invoice-method-title">Payment Method</h4>

              <div className="create-invoice-payment-options">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`create-invoice-payment-option ${
                      selectedPaymentMethod === method.id ? "selected" : ""
                    }`}
                    onClick={() => handlePaymentMethodChange(method.id)}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => handlePaymentMethodChange(method.id)}
                    />
                    <span className="create-invoice-payment-icon">
                      {method.icon}
                    </span>
                    <span className="create-invoice-payment-text">
                      {method.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="create-invoice-action-buttons">
              <button
                className="create-invoice-create-btn"
                onClick={handleCreateInvoice}
                disabled={products.length === 0}
              >
                ✓ Create Invoice
              </button>
              <button className="create-invoice-back-btn" onClick={handleBack}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
