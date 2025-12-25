import React, { useState, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaFilter } from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import ErrorMessage from "../../components/Messages/ErrorMessage";
import { productService } from "../../services/productService";
import "./CustomerShopPage.css";

const CustomerShopPage = ({ onAddToCart, onViewCart, onViewProduct }) => {
  // States for UI controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // States for API data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [isLoading, setIsLoading] = useState(true);

  // States for messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load products from backend on component mount or when filters change
  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory, sortBy]);

  /**
   * Load products from backend API
   */
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Prepare API parameters
      const params = {
        limit: 100, // Load all products for customer shop
        status: "active", // Only show active products
      };

      // Add search filter if present
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      // Add category filter if selected (API uses category field)
      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      // Add sort parameter
      if (sortBy === "name") {
        params.sort = "name";
      } else if (sortBy === "price-asc") {
        params.sort = "price";
      } else if (sortBy === "price-desc") {
        params.sort = "-price";
      }

      console.log("📦 Loading products with params:", params);
      const result = await productService.getAll(params);

      if (result.success) {
        // Transform API data to UI format
        const transformedProducts = (result.data || []).map((product) => ({
          id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          description:
            product.description || `${product.name} - ${product.unit}`,
          image:
            product.image_link ||
            "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image",
          inStock: product.current_stock > 0,
          stockQuantity: product.current_stock,
          unit: product.unit,
          supplier: product.supplier_id?.name,
        }));

        setProducts(transformedProducts);

        // Extract unique categories from products
        const uniqueCategories = [
          "all",
          ...new Set(transformedProducts.map((p) => p.category)),
        ];
        setCategories(uniqueCategories);

        console.log(`✅ Loaded ${transformedProducts.length} products`);
      } else {
        setErrorMessage(result.message || "Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error loading products:", error);
      setErrorMessage("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!product.inStock) return;
    onAddToCart(product);
    setSuccessMessage(`${product.name} added to cart!`);
  };

  return (
    <div className="customer-shop">
      <div className="customer-shop-container">
        {/* Header */}
        <div className="customer-shop-header">
          <div>
            <h2>Shop Products</h2>
            <p>Browse our wide selection of quality products</p>
          </div>
        </div>

        {/* Filters */}
        <div className="customer-shop-filters">
          {/* Search */}
          <div className="customer-shop-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="customer-shop-filter">
            <FaFilter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="customer-shop-sort">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Default</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="customer-shop-loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && (
          <div className="customer-shop-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className="customer-product-card"
                onClick={() => onViewProduct && onViewProduct(product.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="customer-product-image">
                  <img src={product.image} alt={product.name} />
                  {!product.inStock && (
                    <div className="customer-product-out-of-stock">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="customer-product-content">
                  <div className="customer-product-category">
                    {product.category}
                  </div>
                  <h3 className="customer-product-name">{product.name}</h3>
                  <p className="customer-product-description">
                    {product.description}
                  </p>
                  <div className="customer-product-footer">
                    <div className="customer-product-price">
                      <span className="price-current">{product.price.toLocaleString("vi-VN")}₫</span>
                      {product.unit && (
                        <span className="price-unit">/{product.unit}</span>
                      )}
                    </div>
                    <button
                      className={`customer-product-btn ${
                        !product.inStock ? "disabled" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.inStock}
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="customer-shop-empty">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Error Message */}
      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
    </div>
  );
};

export default CustomerShopPage;
