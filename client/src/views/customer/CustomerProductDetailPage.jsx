import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaTruck,
  FaClock,
} from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import "./CustomerProductDetailPage.css";

// Mock Products Data - Same as shop page
const mockProducts = [
  {
    id: 1,
    name: "Artisan Bread",
    category: "Fruits",
    price: 5.99,
    unit: "loaf",
    description:
      "Freshly baked artisan bread with a crispy crust and soft interior. Made with traditional methods using high-quality flour.",
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800",
    images: [
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
      "https://images.unsplash.com/photo-1556471013-1bf5b0830a65?w=800",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800",
    ],
    inStock: true,
    stockQuantity: 40,
    productId: "001",
    origin: "Local",
    supplier: "Supplier 1",
  },
  {
    id: 2,
    name: "Fresh Organic Milk",
    category: "Dairy",
    price: 4.99,
    unit: "bottle",
    description: "Farm fresh organic whole milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800",
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800",
    ],
    inStock: true,
    stockQuantity: 25,
    productId: "002",
    origin: "Local",
    supplier: "Dairy Farm Co.",
  },
  {
    id: 3,
    name: "Premium Coffee Beans",
    category: "Beverages",
    price: 12.99,
    unit: "bag",
    description: "Arabica coffee beans - 500g",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
    ],
    inStock: true,
    stockQuantity: 15,
    productId: "003",
    origin: "Colombia",
    supplier: "Coffee Imports Ltd.",
  },
];

const CustomerProductDetailPage = ({
  productId,
  onBack,
  onAddToCart,
  onViewProduct,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [successMessage, setSuccessMessage] = useState("");

  // Find the product by ID
  const product =
    mockProducts.find((p) => p.id === parseInt(productId)) || mockProducts[0];

  // Related products (excluding current product)
  const relatedProducts = mockProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    setSuccessMessage(`${quantity} ${product.name}(s) added to cart!`);
  };

  const handleAddRelatedToCart = (relatedProduct) => {
    onAddToCart({ ...relatedProduct, quantity: 1 });
    setSuccessMessage(`${relatedProduct.name} added to cart!`);
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Back Button */}
        <button className="back-to-shop-btn" onClick={onBack}>
          <FaArrowLeft /> Back to Shop
        </button>

        {/* Main Product Section */}
        <div className="product-detail-main">
          {/* Left: Images */}
          <div className="product-images-section">
            <div className="main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
            </div>
            <div className="thumbnail-images">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="product-info-section">
            <div className="product-category-badge">{product.category}</div>
            <h1 className="product-title">{product.name}</h1>
            <p className="product-description">{product.description}</p>

            <div className="product-price">
              <span className="price-amount">${product.price}</span>
              <span className="price-unit">per {product.unit}</span>
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              <FaCheckCircle className="stock-icon" />
              <span>Only {product.stockQuantity} left</span>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    if (val >= 1 && val <= product.stockQuantity) {
                      setQuantity(val);
                    }
                  }}
                  min="1"
                  max={product.stockQuantity}
                />
                <button
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockQuantity}
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Add to Cart
            </button>

            {/* Features */}
            <div className="product-features">
              <div className="feature-item">
                <FaCheckCircle className="feature-icon" />
                <div>
                  <strong>Quality Guaranteed</strong>
                </div>
              </div>
              <div className="feature-item">
                <FaClock className="feature-icon" />
                <div>
                  <strong>Fresh Daily</strong>
                </div>
              </div>
              <div className="feature-item">
                <FaTruck className="feature-icon" />
                <div>
                  <strong>Fast Delivery</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Product Details
            </button>
          </div>
          <div className="tabs-content">
            {activeTab === "details" && (
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Product ID</span>
                  <span className="detail-value">{product.productId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Origin</span>
                  <span className="detail-value">{product.origin}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Supplier</span>
                  <span className="detail-value">{product.supplier}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products-section">
          <h2>Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="related-product-card"
                onClick={() =>
                  onViewProduct && onViewProduct(relatedProduct.id)
                }
                style={{ cursor: "pointer" }}
              >
                <div className="related-product-image">
                  <img src={relatedProduct.image} alt={relatedProduct.name} />
                </div>
                <div className="related-product-info">
                  <div className="related-category-badge">
                    {relatedProduct.category}
                  </div>
                  <h3>{relatedProduct.name}</h3>
                  <p>{relatedProduct.description}</p>
                  <div className="related-product-footer">
                    <div className="related-product-price">
                      ${relatedProduct.price}
                      <span className="related-unit">
                        / {relatedProduct.unit}
                      </span>
                    </div>
                    <button
                      className="related-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddRelatedToCart(relatedProduct);
                      }}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
};

export default CustomerProductDetailPage;
