// controllers/productShelfController.js - UPDATED WITH NEW BUSINESS RULES
// Business Rules:
// 1. One product CAN be on MULTIPLE shelves at the same time (many-to-many relationship)
// 2. When adding product to shelf, deduct quantity from warehouse inventory (current_stock)
// 3. Each shelf record (A1, A2, A3, A4) is a separate section with its own capacity and quantity
// 4. Quantity is tracked PER SHELF/SECTION, not aggregated
const { ProductShelf, Product, Shelf } = require("../models");

// @desc    Get all product-shelf mappings with filters and pagination
// @route   GET /api/product-shelves
exports.getAllProductShelves = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      product_id,
      shelf_id,
      expiry_before,
      expiry_after,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (product_id) query.product_id = product_id;
    if (shelf_id) query.shelf_id = shelf_id;

    if (expiry_before || expiry_after) {
      query.expiry_date = {};
      if (expiry_before) {
        const d = new Date(expiry_before);
        if (isNaN(d))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_before date" });
        query.expiry_date.$lte = d;
      }
      if (expiry_after) {
        const d2 = new Date(expiry_after);
        if (isNaN(d2))
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_after date" });
        query.expiry_date.$gte = d2;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const productShelves = await ProductShelf.find(query)
      .populate({
        path: "product_id",
        select:
          "name category unit price current_stock minimum_stock_level maximum_stock_level image_link sku barcode supplier_id",
        populate: {
          path: "supplier_id",
          select: "name contact_person_name email phone",
        },
      })
      .populate({
        path: "shelf_id",
        select:
          "shelf_number shelf_name section_number description capacity current_quantity",
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductShelf.countDocuments(query);

    res.status(200).json({
      success: true,
      count: productShelves.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: productShelves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product-shelf mappings",
      error: error.message,
    });
  }
};

// @desc    Get product-shelf mapping statistics
// @route   GET /api/product-shelves/stats
exports.getProductShelfStats = async (req, res) => {
  try {
    const totalMappings = await ProductShelf.countDocuments({
      isDelete: false,
    });

    const totalQuantity = await ProductShelf.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    const byShelves = await ProductShelf.aggregate([
      { $match: { isDelete: false } },
      {
        $lookup: {
          from: "shelves",
          localField: "shelf_id",
          foreignField: "_id",
          as: "shelf",
        },
      },
      { $unwind: "$shelf" },
      {
        $group: {
          _id: {
            shelf_id: "$shelf_id",
            shelf_number: "$shelf.shelf_number",
            shelf_name: "$shelf.shelf_name",
          },
          product_count: { $sum: 1 },
          total_quantity: { $sum: "$quantity" },
          capacity: { $first: "$shelf.capacity" },
        },
      },
      { $sort: { "_id.shelf_number": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_mappings: totalMappings,
        total_quantity_on_shelves: totalQuantity[0]?.total || 0,
        by_shelves: byShelves,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product-shelf statistics",
      error: error.message,
    });
  }
};

// @desc    Get single product-shelf mapping by ID
// @route   GET /api/product-shelves/:id
exports.getProductShelfById = async (req, res) => {
  try {
    const productShelf = await ProductShelf.findOne({
      _id: req.params.id,
      isDelete: false,
    })
      .populate({
        path: "product_id",
        select:
          "name description category unit price current_stock minimum_stock_level maximum_stock_level image_link sku barcode supplier_id status",
        populate: {
          path: "supplier_id",
          select: "name contact_person_name email phone",
        },
      })
      .populate({
        path: "shelf_id",
        select:
          "shelf_number shelf_name section_number description capacity current_quantity",
      });

    if (!productShelf) {
      return res.status(404).json({
        success: false,
        message: "Product-shelf mapping not found",
      });
    }

    res.status(200).json({
      success: true,
      data: productShelf,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product-shelf mapping",
      error: error.message,
    });
  }
};

// @desc    Get shelf for a specific product (since 1 product = 1 shelf)
// @route   GET /api/product-shelves/product/:productId/shelves
exports.getShelvesByProduct = async (req, res) => {
  try {
    const productShelves = await ProductShelf.find({
      product_id: req.params.productId,
      isDelete: false,
    }).populate({
      path: "shelf_id",
      select:
        "shelf_number shelf_name section_number description capacity current_quantity",
    });

    if (!productShelves || productShelves.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found on any shelf",
      });
    }

    const data = productShelves.map((ps) => ({
      shelf: ps.shelf_id,
      quantity: ps.quantity,
      mapping_id: ps._id,
    }));

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shelves for product",
      error: error.message,
    });
  }
};

// @desc    Get all products on a specific shelf
// @route   GET /api/product-shelves/shelf/:shelfId/products
exports.getProductsByShelf = async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = "product_id.name" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      shelf_id: req.params.shelfId,
      isDelete: false,
    };

    const productShelves = await ProductShelf.find(query)
      .populate({
        path: "product_id",
        select:
          "name category unit price current_stock image_link sku supplier_id",
        populate: {
          path: "supplier_id",
          select: "name",
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ProductShelf.countDocuments(query);

    // Get shelf info
    const shelf = await Shelf.findById(req.params.shelfId);

    res.status(200).json({
      success: true,
      count: productShelves.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      shelf_info: shelf
        ? {
            shelf_number: shelf.shelf_number,
            shelf_name: shelf.shelf_name,
            section_number: shelf.section_number,
            capacity: shelf.capacity,
            current_quantity: shelf.current_quantity,
            available: shelf.capacity - shelf.current_quantity,
          }
        : null,
      data: productShelves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products on shelf",
      error: error.message,
    });
  }
};

// @desc    Create product-shelf mapping (Assign product to shelf)
// @route   POST /api/product-shelves
// Business Rule: Deduct quantity from product.current_stock
// Product CAN be on multiple shelves
exports.createProductShelf = async (req, res) => {
  try {
    const { product_id, shelf_id, quantity, expiry_date } = req.body;

    // Validate required fields
    if (!product_id || !shelf_id || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product ID, Shelf ID, and valid quantity are required",
      });
    }

    // Validate expiry_date format if provided
    let expiryDateObj;
    if (
      expiry_date !== undefined &&
      expiry_date !== null &&
      expiry_date !== ""
    ) {
      expiryDateObj = new Date(expiry_date);
      if (isNaN(expiryDateObj)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiry_date" });
      }
    }

    // Check if product already exists on THIS SPECIFIC shelf (not any shelf)
    const existingMapping = await ProductShelf.findOne({
      product_id,
      shelf_id,
      isDelete: false,
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message:
          "Product already exists on this shelf. Please update quantity instead.",
      });
    }

    // Get product to check availability
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product has enough stock in warehouse
    if (product.current_stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock in warehouse. Available: ${product.current_stock}, Requested: ${quantity}`,
      });
    }

    // Get shelf to check capacity
    const shelf = await Shelf.findById(shelf_id);
    if (!shelf) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    const availableCapacity = shelf.capacity - (shelf.current_quantity || 0);
    if (availableCapacity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough space on shelf. Available: ${availableCapacity}, Requested: ${quantity}`,
      });
    }

    // Create mapping
    const productShelf = await ProductShelf.create({
      product_id,
      shelf_id,
      quantity,
      expiry_date: expiryDateObj || undefined,
    });

    // Deduct from warehouse inventory
    product.current_stock -= quantity;
    await product.save();

    // Update shelf quantity
    shelf.current_quantity = (shelf.current_quantity || 0) + quantity;
    await shelf.save();

    // Populate and return
    const populatedMapping = await ProductShelf.findById(productShelf._id)
      .populate("product_id", "name current_stock")
      .populate("shelf_id", "shelf_number capacity current_quantity");

    res.status(201).json({
      success: true,
      message: `Successfully added ${quantity} units of ${product.name} to shelf ${shelf.shelf_number}`,
      data: populatedMapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating product-shelf mapping",
      error: error.message,
    });
  }
};

// @desc    Update product-shelf mapping
// @route   PUT /api/product-shelves/:id
exports.updateProductShelf = async (req, res) => {
  try {
    const { quantity, expiry_date } = req.body;

    // expiry_date handling (allow clearing)
    if (expiry_date !== undefined) {
      if (expiry_date === null || expiry_date === "") {
        productShelf.expiry_date = null;
      } else {
        const expiryDateObj = new Date(expiry_date);
        if (isNaN(expiryDateObj)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid expiry_date" });
        }
        productShelf.expiry_date = expiryDateObj;
      }
    }

    const productShelf = await ProductShelf.findOne({
      _id: req.params.id,
      isDelete: false,
    });

    if (!productShelf) {
      return res.status(404).json({
        success: false,
        message: "Product-shelf mapping not found",
      });
    }

    // Get product and shelf
    const product = await Product.findById(productShelf.product_id);
    const shelf = await Shelf.findById(productShelf.shelf_id);

    if (!product || !shelf) {
      return res.status(404).json({
        success: false,
        message: "Product or shelf not found",
      });
    }

    // Calculate difference
    const oldQuantity = productShelf.quantity;
    const difference = quantity - oldQuantity;

    // If increasing, check warehouse stock
    if (difference > 0) {
      if (product.current_stock < difference) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock in warehouse. Available: ${product.current_stock}, Need: ${difference}`,
        });
      }

      // Check shelf capacity
      const availableCapacity = shelf.capacity - shelf.current_quantity;
      if (availableCapacity < difference) {
        return res.status(400).json({
          success: false,
          message: `Not enough space on shelf. Available: ${availableCapacity}, Need: ${difference}`,
        });
      }

      // Deduct from warehouse
      product.current_stock -= difference;
      shelf.current_quantity += difference;
    } else if (difference < 0) {
      // Decreasing - return to warehouse
      product.current_stock += Math.abs(difference);
      shelf.current_quantity -= Math.abs(difference);
    }

    // Update quantity
    productShelf.quantity = quantity;
    await productShelf.save();
    await product.save();
    await shelf.save();

    const updated = await ProductShelf.findById(productShelf._id)
      .populate("product_id", "name current_stock")
      .populate("shelf_id", "shelf_number capacity current_quantity");

    res.status(200).json({
      success: true,
      message: "Product-shelf mapping updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product-shelf mapping",
      error: error.message,
    });
  }
};

// @desc    Move product to another shelf (MUST move ALL quantity)
// @route   PUT /api/product-shelves/:id/move
// Business Rule: Must move entire quantity, cannot split
exports.moveProductToShelf = async (req, res) => {
  try {
    const { new_shelf_id } = req.body;

    if (!new_shelf_id) {
      return res.status(400).json({
        success: false,
        message: "New shelf ID is required",
      });
    }

    const productShelf = await ProductShelf.findOne({
      _id: req.params.id,
      isDelete: false,
    })
      .populate("product_id", "name")
      .populate(
        "shelf_id",
        "shelf_number shelf_name capacity current_quantity"
      );

    if (!productShelf) {
      return res.status(404).json({
        success: false,
        message: "Product-shelf mapping not found",
      });
    }

    const oldShelf = productShelf.shelf_id;
    const newShelf = await Shelf.findById(new_shelf_id);

    if (!newShelf) {
      return res.status(404).json({
        success: false,
        message: "New shelf not found",
      });
    }

    // Prevent moving to same shelf
    if (oldShelf._id.toString() === new_shelf_id) {
      return res.status(400).json({
        success: false,
        message: "Product is already on this shelf",
      });
    }

    // Check new shelf capacity
    const availableCapacity =
      newShelf.capacity - (newShelf.current_quantity || 0);
    if (availableCapacity < productShelf.quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough space on new shelf. Available: ${availableCapacity}, Need: ${productShelf.quantity}`,
      });
    }

    // Update old shelf quantity
    oldShelf.current_quantity = Math.max(
      0,
      (oldShelf.current_quantity || 0) - productShelf.quantity
    );
    await oldShelf.save();

    // Update new shelf quantity
    newShelf.current_quantity =
      (newShelf.current_quantity || 0) + productShelf.quantity;
    await newShelf.save();

    // Update mapping
    productShelf.shelf_id = new_shelf_id;
    await productShelf.save();

    const updated = await ProductShelf.findById(productShelf._id)
      .populate("product_id", "name")
      .populate(
        "shelf_id",
        "shelf_number shelf_name capacity current_quantity"
      );

    res.status(200).json({
      success: true,
      message: `Successfully moved ${productShelf.quantity} units from ${oldShelf.shelf_number} to ${newShelf.shelf_number}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error moving product to new shelf",
      error: error.message,
    });
  }
};

// @desc    Delete product-shelf mapping (Remove from shelf, return to warehouse)
// @route   DELETE /api/product-shelves/:id
exports.deleteProductShelf = async (req, res) => {
  try {
    const productShelf = await ProductShelf.findOne({
      _id: req.params.id,
      isDelete: false,
    });

    if (!productShelf) {
      return res.status(404).json({
        success: false,
        message: "Product-shelf mapping not found",
      });
    }

    // Get product and shelf
    const product = await Product.findById(productShelf.product_id);
    const shelf = await Shelf.findById(productShelf.shelf_id);

    if (product) {
      // Return quantity to warehouse
      product.current_stock += productShelf.quantity;
      await product.save();
    }

    if (shelf) {
      // Remove from shelf quantity
      shelf.current_quantity = Math.max(
        0,
        (shelf.current_quantity || 0) - productShelf.quantity
      );
      await shelf.save();
    }

    // Soft delete
    productShelf.isDelete = true;
    await productShelf.save();

    res.status(200).json({
      success: true,
      message: `Product removed from shelf. ${productShelf.quantity} units returned to warehouse.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product-shelf mapping",
      error: error.message,
    });
  }
};

// @desc    Bulk assign multiple products to a shelf
// @route   POST /api/product-shelves/bulk/assign
// Business Rule: Check for existing mappings, deduct from warehouse
exports.bulkAssignToShelf = async (req, res) => {
  try {
    const { shelf_id, products } = req.body;

    console.log("\n=== BULK ASSIGN REQUEST ===");
    console.log("Shelf ID:", shelf_id);
    console.log("Products:", JSON.stringify(products, null, 2));

    if (
      !shelf_id ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      console.log("❌ Validation failed: Missing shelf_id or products");
      return res.status(400).json({
        success: false,
        message: "Shelf ID and products array are required",
      });
    }

    // Get shelf
    const shelf = await Shelf.findById(shelf_id);
    if (!shelf) {
      console.log("❌ Shelf not found:", shelf_id);
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }
    console.log("✅ Shelf found:", shelf.shelf_number, "Capacity:", shelf.capacity, "Current:", shelf.current_quantity);

    const results = {
      success: [],
      errors: [],
      total_assigned: 0,
    };

    for (const item of products) {
      try {
        const { product_id, quantity, expiry_date } = item;

        // Validate expiry_date format if provided
        let itemExpiryObj;
        if (
          expiry_date !== undefined &&
          expiry_date !== null &&
          expiry_date !== ""
        ) {
          itemExpiryObj = new Date(expiry_date);
          if (isNaN(itemExpiryObj)) {
            results.errors.push({ product_id, error: "Invalid expiry_date" });
            continue;
          }
        }

        // Get product
        const product = await Product.findById(product_id);
        if (!product) {
          results.errors.push({
            product_id,
            error: "Product not found",
          });
          continue;
        }

        // Check stock
        if (product.current_stock < quantity) {
          results.errors.push({
            product_id,
            error: `Not enough stock. Available: ${product.current_stock}`,
          });
          continue;
        }

        // Check for existing mapping on SAME shelf
        const existingSameShelf = await ProductShelf.findOne({
          product_id,
          shelf_id,
          isDelete: false,
        });

        // Check capacity (consider current shelf quantity which is updated as we go)
        const currentCapacity = shelf.capacity - (shelf.current_quantity || 0);
        if (currentCapacity < quantity) {
          results.errors.push({
            product_id,
            error: `Not enough shelf space. Available: ${currentCapacity}`,
          });
          continue;
        }

        if (existingSameShelf) {
          // If expiry provided, ensure it matches existing mapping, or set if existing is null
          if (itemExpiryObj) {
            if (existingSameShelf.expiry_date) {
              if (
                existingSameShelf.expiry_date.getTime() !==
                itemExpiryObj.getTime()
              ) {
                results.errors.push({
                  product_id,
                  error: "Expiry date mismatch with existing shelf mapping",
                });
                continue;
              }
            } else {
              existingSameShelf.expiry_date = itemExpiryObj;
            }
          }

          // Add to existing mapping on same shelf
          existingSameShelf.quantity =
            (existingSameShelf.quantity || 0) + quantity;
          await existingSameShelf.save();

          // Update warehouse and shelf
          product.current_stock -= quantity;
          await product.save();

          shelf.current_quantity = (shelf.current_quantity || 0) + quantity;

          results.success.push({
            product_id,
            product_name: product.name,
            quantity,
            mapping_id: existingSameShelf._id,
            note: "Added to existing shelf mapping",
          });

          results.total_assigned += quantity;
          continue;
        }

        // Create mapping (no existing mapping on this shelf)
        const mapping = await ProductShelf.create({
          product_id,
          shelf_id,
          quantity,
          expiry_date: itemExpiryObj || undefined,
        });

        // Update warehouse and shelf
        product.current_stock -= quantity;
        await product.save();

        shelf.current_quantity = (shelf.current_quantity || 0) + quantity;

        results.success.push({
          product_id,
          product_name: product.name,
          quantity,
          mapping_id: mapping._id,
        });

        results.total_assigned += quantity;
      } catch (itemError) {
        results.errors.push({
          product_id: item.product_id,
          error: itemError.message,
        });
      }
    }

    // Save shelf with updated quantity
    console.log("\n=== Saving shelf with quantity:", shelf.current_quantity, "===");
    await shelf.save();
    console.log("✅ Shelf saved successfully");

    console.log("\n=== RESULTS ===");
    console.log("Success:", results.success.length);
    console.log("Errors:", results.errors.length);
    console.log("Total assigned:", results.total_assigned);

    res.status(results.errors.length > 0 ? 207 : 201).json({
      success: results.errors.length === 0,
      message: `Successfully assigned ${results.success.length} product(s). ${results.errors.length} error(s).`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error bulk assigning products to shelf",
      error: error.message,
    });
  }
};

// @desc    Get products on shelves for damaged product recording
// @route   GET /api/product-shelves/for-damaged-record
// @note    Returns all products on shelves with supplier, shelf, section info
exports.getProductsForDamagedRecord = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      supplier_id,
      shelf_id,
      section,
      search,
    } = req.query;

    // Build query
    const query = { isDelete: false, quantity: { $gt: 0 } };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    let productShelves = await ProductShelf.find(query)
      .populate({
        path: "product_id",
        select: "name category unit price supplier_id sku barcode",
        populate: {
          path: "supplier_id",
          select: "name contact_person_name",
        },
      })
      .populate({
        path: "shelf_id",
        select:
          "shelf_number shelf_name section_number slot_number capacity current_quantity",
      })
      .sort("shelf_id product_id")
      .skip(skip)
      .limit(parseInt(limit));

    // Filter after population
    if (supplier_id) {
      productShelves = productShelves.filter(
        (ps) => ps.product_id?.supplier_id?._id?.toString() === supplier_id
      );
    }

    if (shelf_id) {
      productShelves = productShelves.filter(
        (ps) => ps.shelf_id?._id?.toString() === shelf_id
      );
    }

    if (section) {
      productShelves = productShelves.filter(
        (ps) => ps.shelf_id?.section_number === section
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      productShelves = productShelves.filter(
        (ps) =>
          ps.product_id?.name?.toLowerCase().includes(searchLower) ||
          ps.product_id?.sku?.toLowerCase().includes(searchLower) ||
          ps.product_id?.barcode?.toLowerCase().includes(searchLower)
      );
    }

    // Transform to UI format
    const formattedData = productShelves.map((ps) => ({
      productShelf_id: ps._id,
      product_id: ps.product_id?._id,
      product_name: ps.product_id?.name,
      category: ps.product_id?.category,
      unit: ps.product_id?.unit,
      supplier_id: ps.product_id?.supplier_id?._id,
      supplier_name: ps.product_id?.supplier_id?.name,
      shelf_id: ps.shelf_id?._id,
      shelf_location: ps.shelf_id?.shelf_number,
      shelf_name: ps.shelf_id?.shelf_name,
      section: ps.shelf_id?.section_number,
      slot: ps.shelf_id?.slot_number,
      available_quantity: ps.quantity,
    }));

    const total = await ProductShelf.countDocuments(query);

    res.status(200).json({
      success: true,
      count: formattedData.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products for damaged record",
      error: error.message,
    });
  }
};
