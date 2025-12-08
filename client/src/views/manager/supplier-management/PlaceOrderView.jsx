import React, { useState } from "react";
import { FaShoppingCart, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PlaceOrderView.css";
import SuccessMessage from "../../../components/Messages/SuccessMessage";
import ErrorMessage from "../../../components/Messages/ErrorMessage";

const PlaceOrderView = () => {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sample supplier data with their products
  const supplierData = {
    "Supplier 1": {
      contact: "Sarah Miller",
      phone: "+1234567890",
      category: "Dairy Products",
      products: [
        { id: "P001", name: "Fresh Milk", defaultUnit: "liter" },
        { id: "P002", name: "Cheese", defaultUnit: "kg" },
        { id: "P003", name: "Yogurt", defaultUnit: "box" },
        { id: "P004", name: "Butter", defaultUnit: "kg" },
      ],
    },
    "Supplier 2": {
      contact: "John Smith",
      phone: "+1987654321",
      category: "Fresh Vegetables",
      products: [
        { id: "P005", name: "Carrot", defaultUnit: "kg" },
        { id: "P006", name: "Potato", defaultUnit: "kg" },
        { id: "P007", name: "Onion", defaultUnit: "kg" },
        { id: "P008", name: "Tomato", defaultUnit: "kg" },
        { id: "P009", name: "Cucumber", defaultUnit: "kg" },
      ],
    },
    "Supplier 3": {
      contact: "Alice Johnson",
      phone: "+1555123456",
      category: "Packaged Foods",
      products: [
        { id: "P010", name: "Rice", defaultUnit: "bag" },
        { id: "P011", name: "Pasta", defaultUnit: "box" },
        { id: "P012", name: "Canned Beans", defaultUnit: "pcs" },
        { id: "P013", name: "Cooking Oil", defaultUnit: "bottle" },
      ],
    },
  };

  const [selectedSupplier, setSelectedSupplier] = useState("Supplier 1");
  const [formData, setFormData] = useState({
    expectedDeliveryDate: "",
    orderNotes: "",
  });

  const [orderItems, setOrderItems] = useState([]);
  const [newProduct, setNewProduct] = useState({
    product: "",
    unit: "",
    quantity: "",
  });

  // Get current supplier info and products
  const currentSupplierInfo = supplierData[selectedSupplier];
  const availableProducts = currentSupplierInfo
    ? currentSupplierInfo.products
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSupplierChange = (e) => {
    const newSupplier = e.target.value;
    setSelectedSupplier(newSupplier);
    // Clear current order when changing supplier
    setOrderItems([]);
    setNewProduct({ product: "", unit: "", quantity: "" });
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;

    if (name === "product") {
      // Auto-select default unit when product is selected
      const selectedProduct = availableProducts.find((p) => p.name === value);
      setNewProduct((prev) => ({
        ...prev,
        [name]: value,
        unit: selectedProduct ? selectedProduct.defaultUnit : "",
        quantity: "", // Clear quantity when changing product
      }));
    } else {
      setNewProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddProduct = () => {
    if (newProduct.product && newProduct.unit && newProduct.quantity) {
      const newItem = {
        id: String(orderItems.length + 1).padStart(3, "0"),
        product: newProduct.product,
        unit: newProduct.unit,
        quantity: parseInt(newProduct.quantity),
      };
      setOrderItems([...orderItems, newItem]);
      setNewProduct({ product: "", unit: "", quantity: "" });
    }
  };

  const handleRemoveProduct = (id) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, newQuantity) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order submitted:", { formData, orderItems });
    // Add your form submission logic here
    // TODO: Implement success message here
  };

  const handleCancel = () => {
    console.log("Order cancelled");
    navigate(-1); // Navigate back to previous page
  };

  return (
    <div className="place-order-view">
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
      <div className="place-order-page-header">
        <h1 className="place-order-page-title">Place Order</h1>
      </div>

      {/* Main Content */}
      <div className="place-order-content">
        {/* Form Container */}
        <div className="place-order-form-container">
          <form id="order-form" onSubmit={handleSubmit}>
            {/* Supplier Information Section */}
            <div className="place-order-form-section">
              <h2 className="place-order-section-title">
                Supplier Information
              </h2>

              <div className="place-order-form-row">
                <div className="place-order-form-group">
                  <label htmlFor="supplier" className="place-order-form-label">
                    Supplier
                  </label>
                  <select
                    id="supplier"
                    name="supplier"
                    value={selectedSupplier}
                    onChange={handleSupplierChange}
                    className="place-order-form-select"
                  >
                    {Object.keys(supplierData).map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="place-order-form-group">
                  <label className="place-order-form-label">Contact</label>
                  <input
                    type="text"
                    value={currentSupplierInfo?.contact || ""}
                    className="place-order-form-input"
                    readOnly
                  />
                </div>
              </div>

              <div className="place-order-form-row">
                <div className="place-order-form-group">
                  <label className="place-order-form-label">Phone</label>
                  <input
                    type="text"
                    value={currentSupplierInfo?.phone || ""}
                    className="place-order-form-input"
                    readOnly
                  />
                </div>
                <div className="place-order-form-group">
                  <label className="place-order-form-label">Category</label>
                  <input
                    type="text"
                    value={currentSupplierInfo?.category || ""}
                    className="place-order-form-input"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Add Products Section */}
            <div className="place-order-form-section">
              <h2 className="place-order-section-title">Add Products</h2>

              {/* Line 1: Select Product */}
              <div className="place-order-form-row">
                <div className="place-order-form-group place-order-full-width">
                  <label htmlFor="product" className="place-order-form-label">
                    Select Product
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={newProduct.product}
                    onChange={handleNewProductChange}
                    className="place-order-form-select"
                  >
                    <option value="">
                      {availableProducts.length > 0
                        ? "Choose a product"
                        : "No products available"}
                    </option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.name}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line 2: Unit and Quantity */}
              <div className="place-order-form-row">
                <div className="place-order-form-group">
                  <label htmlFor="unit" className="place-order-form-label">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={newProduct.unit}
                    onChange={handleNewProductChange}
                    className="place-order-form-select"
                  >
                    <option value="">
                      {newProduct.product
                        ? `Default: ${(() => {
                            const selectedProduct = availableProducts.find(
                              (p) => p.name === newProduct.product
                            );
                            return selectedProduct
                              ? selectedProduct.defaultUnit
                              : "Choose unit";
                          })()}`
                        : "Choose unit"}
                    </option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                    <option value="liter">liter</option>
                    <option value="bag">bag</option>
                    <option value="bottle">bottle</option>
                  </select>
                </div>
                <div className="place-order-form-group">
                  <label htmlFor="quantity" className="place-order-form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newProduct.quantity}
                    onChange={handleNewProductChange}
                    placeholder="0"
                    className="place-order-form-input"
                    min="1"
                  />
                </div>
              </div>

              {/* Line 3: Add Button */}
              <div className="place-order-form-row">
                <div
                  className="place-order-form-group place-order-full-width"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="place-order-add-product-btn"
                  >
                    <FaPlus style={{ marginRight: "0.5rem" }} />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="place-order-form-row">
                <div className="place-order-form-group place-order-full-width">
                  {orderItems.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#6b7280",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "2px dashed #d1d5db",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "1rem" }}>
                        No products added yet
                      </p>
                      <p
                        style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}
                      >
                        Add products using the form above
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="place-order-product-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Product</th>
                            <th>Unit</th>
                            <th>Quantity</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderItems.map((item, index) => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td>{item.product}</td>
                              <td>{item.unit}</td>
                              <td>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="place-order-quantity-input"
                                  min="1"
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.id)}
                                  className="place-order-remove-btn"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="place-order-form-section">
              <h2 className="place-order-section-title">Additional Details</h2>

              <div className="place-order-form-row">
                <div className="place-order-form-group">
                  <label
                    htmlFor="expectedDeliveryDate"
                    className="place-order-form-label"
                  >
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    id="expectedDeliveryDate"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    className="place-order-form-input"
                  />
                </div>
              </div>

              <div className="place-order-form-row">
                <div className="place-order-form-group place-order-full-width">
                  <label
                    htmlFor="orderNotes"
                    className="place-order-form-label"
                  >
                    Order Notes
                  </label>
                  <textarea
                    id="orderNotes"
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    placeholder="Add any special instructions or notes..."
                    className="place-order-form-textarea"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Panel */}
        <div className="place-order-action-panel">
          <button type="submit" form="order-form" className="place-order-btn">
            <FaShoppingCart className="place-order-icon" />
            Place Order
          </button>
          <button onClick={handleCancel} className="place-order-cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderView;
