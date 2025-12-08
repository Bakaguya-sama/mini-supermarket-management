import React, { useState } from "react";
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

const CreateInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Product search and filter states
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showProductList, setShowProductList] = useState(false);

  // Customer search states
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  // Product quantities in search results
  const [productQuantities, setProductQuantities] = useState({});

  // Available customers for selection
  const [availableCustomers] = useState([
    {
      id: "CUST-001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      type: "Regular",
    },
    {
      id: "CUST-002",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+1 (555) 987-6543",
      type: "VIP",
    },
    {
      id: "CUST-003",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      phone: "+1 (555) 456-7890",
      type: "Regular",
    },
    {
      id: "CUST-004",
      name: "Sarah Smith",
      email: "sarah.smith@email.com",
      phone: "+1 (555) 321-0987",
      type: "VIP",
    },
    {
      id: "CUST-005",
      name: "David Lee",
      email: "david.lee@email.com",
      phone: "+1 (555) 654-3210",
      type: "Regular",
    },
    {
      id: "CUST-006",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      phone: "+1 (555) 789-0123",
      type: "Premium",
    },
    {
      id: "CUST-007",
      name: "Robert Brown",
      email: "robert.brown@email.com",
      phone: "+1 (555) 234-5678",
      type: "VIP",
    },
    {
      id: "CUST-008",
      name: "Alice Cooper",
      email: "alice.cooper@email.com",
      phone: "+1 (555) 345-6789",
      type: "Regular",
    },
    {
      id: "CUST-009",
      name: "Tom Anderson",
      email: "tom.anderson@email.com",
      phone: "+1 (555) 456-7890",
      type: "Premium",
    },
    {
      id: "CUST-010",
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      phone: "+1 (555) 567-8901",
      type: "VIP",
    },
    {
      id: "CUST-011",
      name: "James Wilson",
      email: "james.wilson@email.com",
      phone: "+1 (555) 678-9012",
      type: "Regular",
    },
    {
      id: "CUST-012",
      name: "Jennifer Martinez",
      email: "jennifer.martinez@email.com",
      phone: "+1 (555) 789-0123",
      type: "Premium",
    },
    {
      id: "CUST-013",
      name: "Chris Taylor",
      email: "chris.taylor@email.com",
      phone: "+1 (555) 890-1234",
      type: "Regular",
    },
    {
      id: "CUST-014",
      name: "Amanda Johnson",
      email: "amanda.johnson@email.com",
      phone: "+1 (555) 901-2345",
      type: "VIP",
    },
    {
      id: "CUST-015",
      name: "Kevin Zhang",
      email: "kevin.zhang@email.com",
      phone: "+1 (555) 012-3456",
      type: "Premium",
    },
    {
      id: "CUST-016",
      name: "Michelle Davis",
      email: "michelle.davis@email.com",
      phone: "+1 (555) 123-4567",
      type: "Regular",
    },
    {
      id: "CUST-017",
      name: "Steven Miller",
      email: "steven.miller@email.com",
      phone: "+1 (555) 234-5678",
      type: "VIP",
    },
    {
      id: "CUST-018",
      name: "Rachel Green",
      email: "rachel.green@email.com",
      phone: "+1 (555) 345-6789",
      type: "Premium",
    },
    {
      id: "CUST-019",
      name: "Daniel Kim",
      email: "daniel.kim@email.com",
      phone: "+1 (555) 456-7890",
      type: "Regular",
    },
    {
      id: "CUST-020",
      name: "Nicole Thompson",
      email: "nicole.thompson@email.com",
      phone: "+1 (555) 567-8901",
      type: "VIP",
    },
  ]);

  // Available products for selection
  const [availableProducts] = useState([
    // Dairy Products
    {
      id: "P001",
      name: "Fresh Milk 1L",
      category: "Dairy",
      price: 24.5,
      stock: 50,
    },
    {
      id: "P002",
      name: "Greek Yogurt 500g",
      category: "Dairy",
      price: 16.3,
      stock: 25,
    },
    {
      id: "P003",
      name: "Cheddar Cheese 200g",
      category: "Dairy",
      price: 28.0,
      stock: 15,
    },
    {
      id: "P004",
      name: "Butter 250g",
      category: "Dairy",
      price: 32.5,
      stock: 20,
    },
    {
      id: "P005",
      name: "Cream Cheese 150g",
      category: "Dairy",
      price: 22.0,
      stock: 18,
    },

    // Bakery Products
    {
      id: "P006",
      name: "Whole Wheat Bread",
      category: "Bakery",
      price: 18.0,
      stock: 30,
    },
    {
      id: "P007",
      name: "Croissant 6pcs",
      category: "Bakery",
      price: 25.5,
      stock: 12,
    },
    {
      id: "P008",
      name: "Bagel 4pcs",
      category: "Bakery",
      price: 20.0,
      stock: 15,
    },
    {
      id: "P009",
      name: "Sourdough Bread",
      category: "Bakery",
      price: 22.5,
      stock: 10,
    },
    {
      id: "P010",
      name: "Muffin Blueberry 4pcs",
      category: "Bakery",
      price: 28.0,
      stock: 8,
    },

    // Beverages
    {
      id: "P011",
      name: "Orange Juice 1L",
      category: "Beverages",
      price: 15.8,
      stock: 35,
    },
    {
      id: "P012",
      name: "Coca Cola 330ml",
      category: "Beverages",
      price: 8.5,
      stock: 60,
    },
    {
      id: "P013",
      name: "Pepsi 330ml",
      category: "Beverages",
      price: 8.0,
      stock: 45,
    },
    {
      id: "P014",
      name: "Green Tea 500ml",
      category: "Beverages",
      price: 12.5,
      stock: 28,
    },
    {
      id: "P015",
      name: "Energy Drink 250ml",
      category: "Beverages",
      price: 18.0,
      stock: 22,
    },
    {
      id: "P016",
      name: "Mineral Water 1.5L",
      category: "Beverages",
      price: 6.5,
      stock: 80,
    },
    {
      id: "P017",
      name: "Apple Juice 1L",
      category: "Beverages",
      price: 16.5,
      stock: 25,
    },
    {
      id: "P018",
      name: "Coffee Latte 250ml",
      category: "Beverages",
      price: 14.0,
      stock: 30,
    },

    // Snacks
    {
      id: "P019",
      name: "Chocolate Chip Cookies",
      category: "Snacks",
      price: 12.5,
      stock: 40,
    },
    {
      id: "P020",
      name: "Potato Chips 150g",
      category: "Snacks",
      price: 9.5,
      stock: 55,
    },
    {
      id: "P021",
      name: "Peanuts 200g",
      category: "Snacks",
      price: 11.0,
      stock: 35,
    },
    {
      id: "P022",
      name: "Chocolate Bar 100g",
      category: "Snacks",
      price: 15.5,
      stock: 42,
    },
    {
      id: "P023",
      name: "Crackers 250g",
      category: "Snacks",
      price: 8.5,
      stock: 38,
    },
    {
      id: "P024",
      name: "Popcorn 150g",
      category: "Snacks",
      price: 7.0,
      stock: 48,
    },
    {
      id: "P025",
      name: "Granola Bar 6pcs",
      category: "Snacks",
      price: 18.5,
      stock: 25,
    },

    // Fruits & Vegetables
    {
      id: "P026",
      name: "Banana 1kg",
      category: "Fruits",
      price: 12.0,
      stock: 45,
    },
    {
      id: "P027",
      name: "Apple 1kg",
      category: "Fruits",
      price: 18.5,
      stock: 32,
    },
    {
      id: "P028",
      name: "Orange 1kg",
      category: "Fruits",
      price: 15.0,
      stock: 28,
    },
    {
      id: "P029",
      name: "Grapes 500g",
      category: "Fruits",
      price: 22.0,
      stock: 20,
    },
    {
      id: "P030",
      name: "Strawberry 250g",
      category: "Fruits",
      price: 25.5,
      stock: 15,
    },
    {
      id: "P031",
      name: "Tomato 1kg",
      category: "Vegetables",
      price: 14.0,
      stock: 35,
    },
    {
      id: "P032",
      name: "Carrot 1kg",
      category: "Vegetables",
      price: 10.5,
      stock: 40,
    },
    {
      id: "P033",
      name: "Broccoli 500g",
      category: "Vegetables",
      price: 16.0,
      stock: 22,
    },
    {
      id: "P034",
      name: "Lettuce 1pc",
      category: "Vegetables",
      price: 8.5,
      stock: 25,
    },
    {
      id: "P035",
      name: "Bell Pepper 500g",
      category: "Vegetables",
      price: 18.5,
      stock: 18,
    },

    // Meat & Seafood
    {
      id: "P036",
      name: "Chicken Breast 1kg",
      category: "Meat",
      price: 45.0,
      stock: 15,
    },
    {
      id: "P037",
      name: "Ground Beef 500g",
      category: "Meat",
      price: 38.5,
      stock: 12,
    },
    {
      id: "P038",
      name: "Pork Chops 500g",
      category: "Meat",
      price: 42.0,
      stock: 10,
    },
    {
      id: "P039",
      name: "Salmon Fillet 300g",
      category: "Seafood",
      price: 55.0,
      stock: 8,
    },
    {
      id: "P040",
      name: "Shrimp 250g",
      category: "Seafood",
      price: 48.5,
      stock: 6,
    },

    // Frozen Foods
    {
      id: "P041",
      name: "Frozen Pizza 350g",
      category: "Frozen",
      price: 25.0,
      stock: 20,
    },
    {
      id: "P042",
      name: "Ice Cream 1L",
      category: "Frozen",
      price: 22.5,
      stock: 18,
    },
    {
      id: "P043",
      name: "Frozen Vegetables 500g",
      category: "Frozen",
      price: 15.5,
      stock: 25,
    },
    {
      id: "P044",
      name: "Frozen Chicken Wings 1kg",
      category: "Frozen",
      price: 35.0,
      stock: 12,
    },

    // Household Items
    {
      id: "P045",
      name: "Dish Soap 500ml",
      category: "Household",
      price: 12.0,
      stock: 30,
    },
    {
      id: "P046",
      name: "Toilet Paper 12rolls",
      category: "Household",
      price: 18.5,
      stock: 25,
    },
    {
      id: "P047",
      name: "Laundry Detergent 1L",
      category: "Household",
      price: 28.0,
      stock: 15,
    },
    {
      id: "P048",
      name: "Paper Towels 6rolls",
      category: "Household",
      price: 15.0,
      stock: 20,
    },
  ]);

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
  const handleAddProductWithQuantity = (product) => {
    const quantity = productQuantities[product.id] || 1;
    if (quantity > 0) {
      const existingProduct = products.find((p) => p.id === product.id);
      const currentQuantity = existingProduct ? existingProduct.quantity : 0;
      const totalQuantity = currentQuantity + quantity;

      // Check if total quantity exceeds stock
      if (totalQuantity > product.stock) {
        errorMessage(
          `Cannot add ${quantity} items. Stock available: ${
            product.stock
          }, Current in cart: ${currentQuantity}, Maximum you can add: ${
            product.stock - currentQuantity
          }`
        );
        return;
      }

      if (existingProduct) {
        handleQuantityChange(product.id, totalQuantity);
      } else {
        const newProduct = {
          ...product,
          quantity: quantity,
          total: product.price * quantity,
        };
        setProducts([...products, newProduct]);
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

  const handleAddProduct = (product) => {
    const existingProduct = products.find((p) => p.id === product.id);
    if (existingProduct) {
      if (existingProduct.quantity >= product.stock) {
        setErrorMessage(
          `Cannot add more items. Stock available: ${product.stock}`
        );
        return;
      }
      handleQuantityChange(product.id, existingProduct.quantity + 1);
    } else {
      const newProduct = {
        ...product,
        quantity: 1,
        total: product.price,
      };
      setProducts([...products, newProduct]);
    }
    setShowProductList(false);
    setProductSearchTerm("");
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
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

    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            quantity: newQuantity,
            total: product.price * newQuantity,
          };
        }
        return product;
      })
    );
  };

  const handleRemoveProduct = (productId) => {
    setProducts(products.filter((product) => product.id !== productId));
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleCreateInvoice = () => {
    if (products.length === 0) {
      setErrorMessage("Please add at least one product to create an invoice.");
      return;
    }

    const invoiceData = {
      products,
      customer: customerInfo,
      discount,
      paymentMethod: selectedPaymentMethod,
      totals: {
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: totalAmount,
      },
    };

    console.log("Creating invoice:", invoiceData);
    setSuccessMessage("Invoice created successfully!");
    setTimeout(() => navigate("/invoice"), 2000);
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
                            ${product.price.toFixed(2)}
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
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="create-invoice-total">
                          ${product.total.toFixed(2)}
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
              ) : (
                <div className="create-invoice-empty-products">
                  <div className="create-invoice-empty-icon">📦</div>
                  <p className="create-invoice-empty-text">
                    No products added yet
                  </p>
                  <p className="create-invoice-empty-subtitle">
                    Search and add products to create an invoice
                  </p>
                </div>
              )}

              {products.length > 0 && (
                <div className="create-invoice-subtotal-row">
                  <span>Subtotal ({products.length} items)</span>
                  <span className="create-invoice-subtotal-amount">
                    ${subtotal.toFixed(2)}
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
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="create-invoice-summary-row discount">
              <span>Discount</span>
              <span className="create-invoice-discount-amount">
                -${discountAmount.toFixed(2)}
              </span>
            </div>

            <div className="create-invoice-summary-row">
              <span>Tax (9%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>

            <div className="create-invoice-summary-row total">
              <span>Total Amount</span>
              <span className="create-invoice-total-amount">
                ${totalAmount.toFixed(2)}
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
