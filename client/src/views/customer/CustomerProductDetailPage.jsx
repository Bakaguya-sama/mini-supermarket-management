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
import ErrorMessage from "../../components/Messages/ErrorMessage";
import productService from "../../services/productService";
import "./CustomerProductDetailPage.css";

const PLACEHOLDER_IMAGE =
  "https://placehold.co/800x800/e2e8f0/64748b?text=No+Image";

const CustomerProductDetailPage = ({
  productId,
  onBack,
  onAddToCart,
  onViewProduct,
}) => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetchProductAndRelated(productId);
    // reset UI
    setSelectedImage(0);
    setQuantity(1);
  }, [productId]);

  const fetchProductAndRelated = async (id) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await productService.getById(id);
      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Product not found");
        setProduct(null);
        setRelatedProducts([]);
        return;
      }

      const p = res.data;
      const uiProduct = {
        id: p._id,
        name: p.name,
        category: p.category || "General",
        price: p.price,
        description: p.description || `${p.name} - ${p.unit || "unit"}`,
        images:
          Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : [p.image_link || PLACEHOLDER_IMAGE],
        image:
          (Array.isArray(p.images) && p.images[0]) ||
          p.image_link ||
          PLACEHOLDER_IMAGE,
        inStock: (p.current_stock || 0) > 0,
        stockQuantity: p.current_stock || 0,
        unit: p.unit,
        productId: p.sku || p._id,
        origin: p.origin || "Unknown",
        supplier: p.supplier_id?.name || p.supplier || "Unknown",
      };

      setProduct(uiProduct);

      // Fetch related by category
      let related = [];
      if (uiProduct.category) {
        try {
          const catRes = await productService.getByCategory(
            uiProduct.category,
            { limit: 10 }
          );
          let catData = catRes?.data || catRes;
          if (Array.isArray(catData)) {
            related = catData
              .filter((item) => item._id !== uiProduct.id)
              .slice(0, 4)
              .map((item) => ({
                id: item._id,
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.description || `${item.name} - ${item.unit}`,
                image: item.image_link || PLACEHOLDER_IMAGE,
                unit: item.unit,
                inStock: (item.current_stock || 0) > 0,
              }));
          }
        } catch (err) {
          // ignore category fetch errors and fallback to random
          console.warn("Could not load category products:", err);
        }
      }

      // If no related products found, fetch a few random ones
      if (!related || related.length === 0) {
        try {
          const allRes = await productService.getAll({
            limit: 10,
            status: "active",
          });
          const allData = allRes?.data || [];
          const filtered = allData.filter((it) => it._id !== uiProduct.id);
          // pick up to 4 random
          const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
          related = shuffled.map((item) => ({
            id: item._id,
            name: item.name,
            category: item.category,
            price: item.price,
            description: item.description || `${item.name} - ${item.unit}`,
            image: item.image_link || PLACEHOLDER_IMAGE,
            unit: item.unit,
            inStock: (item.current_stock || 0) > 0,
          }));
        } catch (err) {
          console.warn("Could not load fallback related products:", err);
        }
      }

      setRelatedProducts(related);
    } catch (err) {
      console.error("Error loading product details:", err);
      setErrorMessage("Failed to load product. Please try again.");
      setProduct(null);
      setRelatedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (!product) return;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    if (!product.inStock) {
      setErrorMessage("Product is out of stock");
      return;
    }

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit,
      image: product.image,
    });

    setSuccessMessage(`${quantity} ${product.name} added to cart!`);
  };

  const handleAddRelatedToCart = (relatedProduct) => {
    onAddToCart({
      id: relatedProduct.id,
      name: relatedProduct.name,
      price: relatedProduct.price,
      quantity: 1,
      unit: relatedProduct.unit,
      image: relatedProduct.image,
    });
    setSuccessMessage(`${relatedProduct.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <button className="back-to-shop-btn" onClick={onBack}>
            <FaArrowLeft /> Back to Shop
          </button>
          <ErrorMessage
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        </div>
      </div>
    );
  }

  if (!product) return null;

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
              <span className="price-amount">{product.price}VNĐ</span>
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
            <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
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
