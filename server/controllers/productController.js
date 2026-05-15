// controllers/productController.js
const productService = require('../services/ProductService');
const logger = require('../config/logger');
const { traceProductSearch } = require('../middleware/tracing');

/** @route GET /api/products */
exports.getAllProducts = async (req, res, next) => {
  try {
    const dataResponse = await traceProductSearch(req.query, async () => {
      return await productService.getAllProducts(req.query);
    });
    
    const { products, total, page, pages } = dataResponse;
    res.status(200).json({ success: true, count: products.length, total, page, pages, data: products });
  } catch (error) { next(error); }
};

/** @route GET /api/products/stats */
exports.getProductStats = async (req, res, next) => {
  try {
    const data = await productService.getProductStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/products/low-stock */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const data = await productService.getLowStockProducts(req.query.limit);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

/** @route GET /api/products/category/:category */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { products, total, page, pages } = await productService.getProductsByCategory(req.params.category, req.query);
    res.status(200).json({ success: true, count: products.length, total, page, pages, data: products });
  } catch (error) { next(error); }
};

/** @route GET /api/products/supplier/:supplierId */
exports.getProductsBySupplier = async (req, res, next) => {
  try {
    const { products, total, page, pages } = await productService.getProductsBySupplier(req.params.supplierId, req.query);
    res.status(200).json({ success: true, count: products.length, total, page, pages, data: products });
  } catch (error) { next(error); }
};

/** @route GET /api/products/:id */
exports.getProductById = async (req, res, next) => {
  try {
    const data = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/products */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    logger.info(`Product created successfully via controller: ${product._id}`);
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id */
exports.updateProduct = async (req, res, next) => {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    logger.info(`Product updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product updated successfully', data });
  } catch (error) { next(error); }
};

/** @route DELETE /api/products/:id */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    logger.info(`Product soft deleted successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product deleted successfully', data: product });
  } catch (error) { next(error); }
};

/** @route DELETE /api/products/:id/permanent */
exports.permanentDeleteProduct = async (req, res, next) => {
  try {
    await productService.permanentDeleteProduct(req.params.id);
    logger.info(`Product permanently deleted via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product permanently deleted' });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id/stock */
exports.updateProductStock = async (req, res, next) => {
  try {
    const product = await productService.updateProductStock(req.params.id, req.body);
    logger.info(`Product stock updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Stock updated successfully', data: product });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id/price */
exports.updateProductPrice = async (req, res, next) => {
  try {
    const data = await productService.updateProductPrice(req.params.id, req.body.price);
    logger.info(`Product price updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Price updated successfully', data });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id/activate */
exports.activateProduct = async (req, res, next) => {
  try {
    const product = await productService.activateProduct(req.params.id);
    logger.info(`Product activated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product activated successfully', data: product });
  } catch (error) { next(error); }
};
