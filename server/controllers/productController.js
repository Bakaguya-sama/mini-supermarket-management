// controllers/productController.js
const productService = require('../services/ProductService');
const logger = require('../config/logger');
const { traceProductSearch } = require('../middleware/tracing');

/** @route GET /api/products */
/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [product]
 *     summary: Get all products with pagination and filtering
 *     operationId: getAllProducts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
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
/**
 * @openapi
 * /api/products/stats:
 *   get:
 *     tags: [product]
 *     summary: Get product statistics and aggregates
 *     operationId: getProductStats
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Error retrieving statistics
 */
exports.getProductStats = async (req, res, next) => {
  try {
    const data = await productService.getProductStats();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route GET /api/products/low-stock */
/**
 * @openapi
 * /api/products/low-stock:
 *   get:
 *     tags: [product]
 *     summary: get Low Stock Products
 *     operationId: getLowStockProducts
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const data = await productService.getLowStockProducts(req.query.limit);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) { next(error); }
};

/** @route GET /api/products/category/:category */
/**
 * @openapi
 * /api/products/category/{category}:
 *   get:
 *     tags: [product]
 *     summary: get Products By Category
 *     operationId: getProductsByCategory
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { products, total, page, pages } = await productService.getProductsByCategory(req.params.category, req.query);
    res.status(200).json({ success: true, count: products.length, total, page, pages, data: products });
  } catch (error) { next(error); }
};

/** @route GET /api/products/supplier/:supplierId */
/**
 * @openapi
 * /api/products/supplier/{supplierId}:
 *   get:
 *     tags: [product]
 *     summary: get Products By Supplier
 *     operationId: getProductsBySupplier
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getProductsBySupplier = async (req, res, next) => {
  try {
    const { products, total, page, pages } = await productService.getProductsBySupplier(req.params.supplierId, req.query);
    res.status(200).json({ success: true, count: products.length, total, page, pages, data: products });
  } catch (error) { next(error); }
};

/** @route GET /api/products/:id */
/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [product]
 *     summary: get Product By Id
 *     operationId: getProductById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getProductById = async (req, res, next) => {
  try {
    const data = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/products */
/**
 * @openapi
 * /api/products/:
 *   post:
 *     tags: [product]
 *     summary: create Product
 *     operationId: createProduct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    logger.info(`Product created successfully via controller: ${product._id}`);
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id */
/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [product]
 *     summary: update Product
 *     operationId: updateProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    logger.info(`Product updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product updated successfully', data });
  } catch (error) { next(error); }
};

/** @route DELETE /api/products/:id */
/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [product]
 *     summary: delete Product
 *     operationId: deleteProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    logger.info(`Product soft deleted successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product deleted successfully', data: product });
  } catch (error) { next(error); }
};

/** @route DELETE /api/products/:id/permanent */
/**
 * @openapi
 * /api/products/{id}/permanent:
 *   delete:
 *     tags: [product]
 *     summary: permanent Delete Product
 *     operationId: permanentDeleteProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.permanentDeleteProduct = async (req, res, next) => {
  try {
    await productService.permanentDeleteProduct(req.params.id);
    logger.info(`Product permanently deleted via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product permanently deleted' });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id/stock */
/**
 * @openapi
 * /api/products/{id}/stock:
 *   patch:
 *     tags: [product]
 *     summary: update Product Stock
 *     operationId: updateProductStock
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.updateProductStock = async (req, res, next) => {
  try {
    const product = await productService.updateProductStock(req.params.id, req.body);
    logger.info(`Product stock updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Stock updated successfully', data: product });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id/price */
/**
 * @openapi
 * /api/products/{id}/price:
 *   patch:
 *     tags: [product]
 *     summary: update Product Price
 *     operationId: updateProductPrice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.updateProductPrice = async (req, res, next) => {
  try {
    const data = await productService.updateProductPrice(req.params.id, req.body.price);
    logger.info(`Product price updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Price updated successfully', data });
  } catch (error) { next(error); }
};

/** @route PUT /api/products/:id/activate */
/**
 * @openapi
 * /api/products/{id}/activate:
 *   patch:
 *     tags: [product]
 *     summary: activate Product
 *     operationId: activateProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.activateProduct = async (req, res, next) => {
  try {
    const product = await productService.activateProduct(req.params.id);
    logger.info(`Product activated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: 'Product activated successfully', data: product });
  } catch (error) { next(error); }
};

