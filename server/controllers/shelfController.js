// controllers/shelfController.js
const { Shelf, ProductShelf, Product, Section } = require("../models");

// @desc    Get all shelves with filters and pagination
// @route   GET /api/shelves
exports.getAllShelves = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      isfull,
      search,
      sort = "shelf_number",
    } = req.query;

    // Build query
    const query = { isDelete: false };
    if (category) query.category = category;
    if (isfull !== undefined) query.isfull = isfull === "true";

    if (search) {
      query.$or = [
        { shelf_number: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query (populate section info)
    const shelves = await Shelf.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("section", "section_name");

    const total = await Shelf.countDocuments(query);

    res.status(200).json({
      success: true,
      count: shelves.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: shelves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shelves",
      error: error.message,
    });
  }
};

// @desc    Get shelf statistics
// @route   GET /api/shelves/stats
exports.getShelfStats = async (req, res) => {
  try {
    const totalShelves = await Shelf.countDocuments({ isDelete: false });
    const fullShelves = await Shelf.countDocuments({
      isfull: true,
      isDelete: false,
    });
    const availableShelves = await Shelf.countDocuments({
      isfull: false,
      isDelete: false,
    });

    const byCategory = await Shelf.aggregate([
      { $match: { isDelete: false } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalCapacity: { $sum: "$capacity" },
        },
      },
    ]);

    const totalCapacity = await Shelf.aggregate([
      { $match: { isDelete: false } },
      { $group: { _id: null, total: { $sum: "$capacity" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalShelves,
        full: fullShelves,
        available: availableShelves,
        totalCapacity: totalCapacity[0]?.total || 0,
        byCategory,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shelf statistics",
      error: error.message,
    });
  }
};

// @desc    Get single shelf by ID with products
// @route   GET /api/shelves/:id
exports.getShelfById = async (req, res) => {
  try {
    const shelf = await Shelf.findById(req.params.id).populate(
      "section",
      "section_name"
    );

    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    // Get all products on this shelf
    const productsOnShelf = await ProductShelf.find({
      shelf_id: shelf._id,
      isDelete: false,
    }).populate({
      path: "product_id",
      select: "name category unit price current_stock image_link sku barcode",
    });

    res.status(200).json({
      success: true,
      data: {
        ...shelf.toObject(),
        products: productsOnShelf,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shelf",
      error: error.message,
    });
  }
};

// @desc    Get shelves by category
// @route   GET /api/shelves/category/:category
exports.getShelvesByCategory = async (req, res) => {
  try {
    const shelves = await Shelf.find({
      category: req.params.category,
      isDelete: false,
    })
      .sort("shelf_number")
      .populate("section", "section_name");

    res.status(200).json({
      success: true,
      count: shelves.length,
      data: shelves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shelves by category",
      error: error.message,
    });
  }
};

// @desc    Get available shelves (not full)
// @route   GET /api/shelves/available
exports.getAvailableShelves = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isfull: false, isDelete: false };
    if (category) query.category = category;

    const shelves = await Shelf.find(query)
      .sort("shelf_number")
      .populate("section", "section_name");

    res.status(200).json({
      success: true,
      count: shelves.length,
      data: shelves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching available shelves",
      error: error.message,
    });
  }
};

// @desc    Create new shelf
// @route   POST /api/shelves
exports.createShelf = async (req, res) => {
  try {
    const {
      shelf_number,
      category,
      note,
      capacity,
      isfull = false,
      warehouse_id,
    } = req.body;

    // Check if shelf_number already exists
    const existingShelf = await Shelf.findOne({
      shelf_number,
      isDelete: false,
    });
    if (existingShelf) {
      return res.status(400).json({
        success: false,
        message: "Shelf number already exists",
      });
    }

    // If section id provided, find and attach it
    let sectionDoc = null;
    if (req.body.section) {
      sectionDoc = await Section.findById(req.body.section);
      if (!sectionDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid section" });
      }
    }

    // compute section_number from shelf_number if present (e.g., A1 -> 1)
    let sectionNumber = undefined;
    if (shelf_number) {
      const match = shelf_number.match(/(\d+)$/);
      if (match) sectionNumber = parseInt(match[1], 10);
    }

    const shelf = await Shelf.create({
      shelf_number,
      category,
      note,
      capacity,
      isfull,
      warehouse_id,
      section: sectionDoc?._id || undefined,
      shelf_name: sectionDoc
        ? sectionDoc.section_name
        : shelf_number
        ? shelf_number[0]
        : "",
      section_number: sectionNumber || 1,
    });

    res.status(201).json({
      success: true,
      message: "Shelf created successfully",
      data: shelf,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating shelf",
      error: error.message,
    });
  }
};

// @desc    Update shelf
// @route   PUT /api/shelves/:id
exports.updateShelf = async (req, res) => {
  try {
    let shelf = await Shelf.findById(req.params.id);

    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    const {
      shelf_number,
      category,
      note,
      capacity,
      isfull,
      warehouse_id,
      section: sectionId,
    } = req.body;

    // Check if new shelf_number conflicts with existing
    if (shelf_number && shelf_number !== shelf.shelf_number) {
      const existingShelf = await Shelf.findOne({
        shelf_number,
        isDelete: false,
        _id: { $ne: shelf._id },
      });
      if (existingShelf) {
        return res.status(400).json({
          success: false,
          message: "Shelf number already exists",
        });
      }
    }

    // Update fields
    if (shelf_number) {
      shelf.shelf_number = shelf_number;
      // update section_number from shelf_number if possible
      const match = shelf_number.match(/(\d+)$/);
      if (match) shelf.section_number = parseInt(match[1], 10);
    }
    if (category) shelf.category = category;
    if (note !== undefined) shelf.note = note;
    if (capacity) shelf.capacity = capacity;
    if (isfull !== undefined) shelf.isfull = isfull;
    if (warehouse_id) shelf.warehouse_id = warehouse_id;

    // If section was provided, validate and set both section ref and shelf_name
    if (sectionId !== undefined) {
      if (sectionId) {
        const sectionDoc = await Section.findById(sectionId);
        if (!sectionDoc) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid section" });
        }
        shelf.section = sectionDoc._id;
        shelf.shelf_name = sectionDoc.section_name;
      } else {
        // allow clearing section
        shelf.section = undefined;
      }
    }

    await shelf.save();

    res.status(200).json({
      success: true,
      message: "Shelf updated successfully",
      data: shelf,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating shelf",
      error: error.message,
    });
  }
};

// @desc    Toggle shelf full status
// @route   PUT /api/shelves/:id/toggle-full
exports.toggleShelfFull = async (req, res) => {
  try {
    const shelf = await Shelf.findById(req.params.id);

    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    shelf.isfull = !shelf.isfull;
    await shelf.save();

    res.status(200).json({
      success: true,
      message: `Shelf marked as ${shelf.isfull ? "full" : "available"}`,
      data: shelf,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling shelf status",
      error: error.message,
    });
  }
};

// @desc    Delete (soft delete) shelf
// @route   DELETE /api/shelves/:id
exports.deleteShelf = async (req, res) => {
  try {
    const shelf = await Shelf.findById(req.params.id);

    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    // Check if shelf has products
    const productsOnShelf = await ProductShelf.countDocuments({
      shelf_id: shelf._id,
      isDelete: false,
    });

    if (productsOnShelf > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete shelf. It contains ${productsOnShelf} product(s). Please remove products first.`,
      });
    }

    shelf.isDelete = true;
    await shelf.save();

    res.status(200).json({
      success: true,
      message: "Shelf deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting shelf",
      error: error.message,
    });
  }
};

// @desc    Get shelf capacity info
// @route   GET /api/shelves/:id/capacity
exports.getShelfCapacity = async (req, res) => {
  try {
    const shelf = await Shelf.findById(req.params.id);

    if (!shelf || shelf.isDelete) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found",
      });
    }

    // Calculate total quantity on shelf
    const productsOnShelf = await ProductShelf.find({
      shelf_id: shelf._id,
      isDelete: false,
    });

    const totalQuantity = productsOnShelf.reduce(
      (sum, ps) => sum + ps.quantity,
      0
    );
    const availableCapacity = Math.max(
      0,
      (shelf.capacity || 0) - totalQuantity
    );
    const utilizationPercent =
      shelf.capacity > 0
        ? Math.round((totalQuantity / shelf.capacity) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        shelf_number: shelf.shelf_number,
        category: shelf.category,
        capacity: shelf.capacity,
        used: totalQuantity,
        available: availableCapacity,
        utilization: utilizationPercent,
        is_full: shelf.isfull,
        product_count: productsOnShelf.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shelf capacity",
      error: error.message,
    });
  }
};
