import React, { useState } from "react";
import { FaSearch, FaShoppingCart, FaFilter } from "react-icons/fa";
import SuccessMessage from "../../components/Messages/SuccessMessage";
import "./CustomerShopPage.css";

// Mock Products Data
const mockProducts = [
  {
    id: 1,
    name: "Fresh Organic Milk",
    category: "Dairy",
    price: 4.99,
    originalPrice: 5.99,
    description: "Farm fresh organic whole milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    inStock: true,
  },
  {
    id: 2,
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 3.49,
    description: "Freshly baked whole wheat bread",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    inStock: true,
  },
  {
    id: 3,
    name: "Premium Coffee Beans",
    category: "Beverages",
    price: 12.99,
    originalPrice: 14.99,
    description: "Arabica coffee beans - 500g",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    inStock: true,
  },
  {
    id: 4,
    name: "Fresh Red Apples",
    category: "Fruits",
    price: 5.99,
    description: "Crispy red apples - 1kg",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
    inStock: true,
  },
  {
    id: 5,
    name: "Organic Tomatoes",
    category: "Vegetables",
    price: 3.99,
    description: "Fresh organic tomatoes - 500g",
    image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400",
    inStock: true,
  },
  {
    id: 6,
    name: "Greek Yogurt",
    category: "Dairy",
    price: 6.49,
    originalPrice: 7.99,
    description: "Creamy Greek yogurt - 500g",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    inStock: true,
  },
  {
    id: 7,
    name: "Chocolate Chip Cookies",
    category: "Snacks",
    price: 4.99,
    description: "Delicious homemade cookies",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
    inStock: false,
  },
  {
    id: 8,
    name: "Orange Juice",
    category: "Beverages",
    price: 5.49,
    description: "Freshly squeezed orange juice - 1L",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
    inStock: true,
  },
];

const CustomerShopPage = ({ onAddToCart, onViewCart, onViewProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [successMessage, setSuccessMessage] = useState("");

  const categories = ["all", ...new Set(mockProducts.map((p) => p.category))];

  const filteredProducts = mockProducts
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

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

        {/* Products Grid */}
        <div className="customer-shop-grid">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="customer-product-card"
              onClick={() => onViewProduct && onViewProduct(product.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="customer-product-image">
                <img src={product.image} alt={product.name} />
                {/* {product.discount && (
                  <span className="customer-product-discount">
                    -{product.discount}%
                  </span>
                )} */}
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
                    <span className="price-current">${product.price}</span>
                    {product.originalPrice && (
                      <span className="price-original">
                        ${product.originalPrice}
                      </span>
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

        {filteredProducts.length === 0 && (
          <div className="customer-shop-empty">
            <p>No products found matching your criteria.</p>
          </div>
        )}
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

export default CustomerShopPage;
