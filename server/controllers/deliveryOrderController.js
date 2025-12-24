// controllers/deliveryOrderController.js - DELIVERY ORDER API HOÀN CHỈNH
const {
  DeliveryOrder,
  Order,
  Staff,
  Customer,
  OrderItem,
} = require("../models");
const mongoose = require("mongoose");

/**
 * @desc    Get all delivery orders with filters
 * @route   GET /api/delivery-orders
 * @access  Protected (Staff/Admin)
 */
exports.getAllDeliveryOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};

    // IMPORTANT: Nếu user là staff (delivery), CHỈ cho xem orders của họ
    if (req.user.role === "staff" && req.user.staffId) {
      query.staff_id = req.user.staffId;
    }
    // Admin có thể xem tất cả, hoặc filter theo staff_id nếu có trong query
    else if (req.user.role === "admin" && req.query.staff_id) {
      query.staff_id = req.query.staff_id;
    }

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { tracking_number: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      query.order_date = {};
      if (startDate) query.order_date.$gte = new Date(startDate);
      if (endDate) query.order_date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const deliveries = await DeliveryOrder.find(query)
      .populate("order_id", "order_number customer_id total_amount")
      .populate("staff_id", "position account_id")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      count: deliveries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: deliveries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery orders",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single delivery order by ID
 * @route   GET /api/delivery-orders/:id
 * @access  Public
 */
exports.getDeliveryOrderById = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id)
      .populate({
        path: "order_id",
        populate: [
          {
            path: "customer_id",
            select: "account_id membership_type",
            populate: {
              path: "account_id",
              select: "full_name email phone address avatar_link",
            },
          },
          { path: "payment_id" },
        ],
      })
      .populate({
        path: "staff_id",
        select: "position account_id",
        populate: {
          path: "account_id",
          select: "full_name phone",
        },
      });

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: "Delivery order not found",
      });
    }

    // Get order items for this delivery với đầy đủ product info
    const orderItems = await OrderItem.find({
      order_id: deliveryOrder.order_id,
    }).populate({
      path: "product_id",
      select: "name description category unit price image_link sku barcode",
    });

    res.status(200).json({
      success: true,
      data: {
        ...deliveryOrder.toObject(),
        orderItems,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery order",
      error: error.message,
    });
  }
};

/**
 * @desc    Get deliveries by staff member
 * @route   GET /api/delivery-orders/staff/:staffId
 * @access  Public
 */
exports.getDeliveriesByStaff = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify staff exists
    const staff = await Staff.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const query = { staff_id: req.params.staffId };
    if (status) {
      // Support comma-separated status list (e.g., 'assigned,in_transit')
      if (typeof status === "string" && status.includes(",")) {
        const statuses = status.split(",").map((s) => s.trim());
        query.status = { $in: statuses };
      } else {
        query.status = status;
      }
    }

    const deliveries = await DeliveryOrder.find(query)
      .populate({
        path: "order_id",
        select: "order_number customer_id total_amount",
        populate: {
          path: "customer_id",
          select: "account_id membership_type",
          populate: {
            path: "account_id",
            select: "full_name email phone address avatar_link",
          },
        },
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort("-order_date");

    const total = await DeliveryOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      staff: {
        id: staff._id,
        position: staff.position,
      },
      count: deliveries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: deliveries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff deliveries",
      error: error.message,
    });
  }
};

/**
 * @desc    Get delivery statistics
 * @route   GET /api/delivery-orders/stats
 * @access  Public
 */
exports.getDeliveryStats = async (req, res) => {
  try {
    const totalDeliveries = await DeliveryOrder.countDocuments();

    const deliveryByStatus = await DeliveryOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const staffDeliveries = await DeliveryOrder.aggregate([
      { $group: { _id: "$staff_id", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "staffs",
          localField: "_id",
          foreignField: "_id",
          as: "staffInfo",
        },
      },
      { $unwind: "$staffInfo" },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDeliveries,
        byStatus: deliveryByStatus,
        byStaff: staffDeliveries,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching delivery statistics",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new delivery order
 * @route   POST /api/delivery-orders
 * @access  Public
 */
exports.createDeliveryOrder = async (req, res) => {
  try {
    const { order_id, staff_id, notes } = req.body;

    // Validate order id
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide order ID",
      });
    }

    // Verify order exists
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if delivery order already exists for this order
    const existingDelivery = await DeliveryOrder.findOne({ order_id });
    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: "Delivery order already exists for this order",
      });
    }

    // If staff_id not provided, select staff using assignment method (default: least_loaded)
    let assignedStaff = null;
    if (!staff_id) {
      const assignMethod = req.body.assign_method || "least_loaded";

      if (assignMethod === "least_loaded") {
        // Atomically pick the delivery staff with the fewest current_assignments and increment their count
        assignedStaff = await Staff.findOneAndUpdate(
          { position: "Delivery", is_active: true },
          { $inc: { current_assignments: 1 } },
          { sort: { current_assignments: 1 }, new: true }
        );
      } else if (assignMethod === "round_robin") {
        // Simple round-robin fallback: pick first active delivery staff (sorted by _id)
        assignedStaff = await Staff.findOneAndUpdate(
          { position: "Delivery", is_active: true },
          { $inc: { current_assignments: 1 } },
          { sort: { _id: 1 }, new: true }
        );
      }

      if (!assignedStaff) {
        return res.status(404).json({
          success: false,
          message: "No available delivery staff found to assign",
        });
      }
      // use the assigned staff id
      req.body.staff_id = assignedStaff._id;
    } else {
      // Verify provided staff exists
      const staff = await Staff.findById(staff_id);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff not found",
        });
      }
      // increment their assignment count atomically
      await Staff.findByIdAndUpdate(staff_id, {
        $inc: { current_assignments: 1 },
      });
    }

    // Generate tracking number
    const trackingNumber = `TRACK-${Date.now()}`;

    // Create delivery order
    const deliveryOrder = await DeliveryOrder.create({
      order_id,
      staff_id: req.body.staff_id,
      tracking_number: trackingNumber,
      notes,
      status: "assigned",
    });

    // Update order status
    order.status = "confirmed";
    await order.save();

    await deliveryOrder.populate([
      { path: "order_id" },
      { path: "staff_id", select: "position account_id" },
    ]);

    res.status(201).json({
      success: true,
      message: "Delivery order created successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating delivery order",
      error: error.message,
    });
  }
};

/**
 * @desc    Update delivery order status
 * @route   PUT /api/delivery-orders/:id
 * @access  Public
 */
exports.updateDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: "Delivery order not found",
      });
    }

    const { status, delivery_date, notes } = req.body;

    if (status) {
      if (!["assigned", "in_transit", "delivered", "failed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const prevStatus = deliveryOrder.status;
      deliveryOrder.status = status;

      // Update order status accordingly
      const order = await Order.findById(deliveryOrder.order_id);
      if (order) {
        if (status === "delivered") {
          order.status = "delivered";
        } else if (status === "in_transit") {
          order.status = "shipped";
        } else if (status === "failed") {
          order.status = "pending";
        }
        await order.save();
      }

      // If we just moved to a terminal state (delivered/failed) from non-terminal, decrement staff load
      if (
        ["delivered", "failed"].includes(status) &&
        !["delivered", "failed"].includes(prevStatus)
      ) {
        if (deliveryOrder.staff_id) {
          const oldStaff = await Staff.findByIdAndUpdate(
            deliveryOrder.staff_id,
            { $inc: { current_assignments: -1 } },
            { new: true }
          );
          if (oldStaff && oldStaff.current_assignments < 0) {
            await Staff.findByIdAndUpdate(oldStaff._id, {
              current_assignments: 0,
            });
          }
        }
      }
    }

    if (delivery_date) deliveryOrder.delivery_date = new Date(delivery_date);
    if (notes !== undefined) deliveryOrder.notes = notes;

    await deliveryOrder.save();
    await deliveryOrder.populate([
      { path: "order_id" },
      { path: "staff_id", select: "position account_id" },
    ]);

    res.status(200).json({
      success: true,
      message: "Delivery order updated successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating delivery order",
      error: error.message,
    });
  }
};

/**
 * @desc    Reassign delivery to another staff
 * @route   PATCH /api/delivery-orders/:id/reassign
 * @access  Public
 */
exports.reassignDelivery = async (req, res) => {
  try {
    const { new_staff_id } = req.body;

    if (!new_staff_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide new staff ID",
      });
    }

    // Verify new staff exists
    const newStaff = await Staff.findById(new_staff_id);
    if (!newStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const deliveryOrder = await DeliveryOrder.findById(req.params.id);
    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: "Delivery order not found",
      });
    }

    const oldStaffId = deliveryOrder.staff_id
      ? deliveryOrder.staff_id.toString()
      : null;
    // If same staff, nothing to do
    if (oldStaffId === new_staff_id) {
      await deliveryOrder.populate([
        { path: "order_id" },
        { path: "staff_id", select: "position account_id" },
      ]);
      return res.status(200).json({
        success: true,
        message: "Delivery already assigned to this staff",
        data: deliveryOrder,
      });
    }

    // Increment new staff assignment atomically
    const updatedNewStaff = await Staff.findByIdAndUpdate(
      new_staff_id,
      { $inc: { current_assignments: 1 } },
      { new: true }
    );
    if (!updatedNewStaff) {
      return res
        .status(404)
        .json({ success: false, message: "New staff not found" });
    }

    // Decrement old staff assignment if existed
    if (oldStaffId) {
      const updatedOldStaff = await Staff.findByIdAndUpdate(
        oldStaffId,
        { $inc: { current_assignments: -1 } },
        { new: true }
      );
      if (updatedOldStaff && updatedOldStaff.current_assignments < 0) {
        await Staff.findByIdAndUpdate(updatedOldStaff._id, {
          current_assignments: 0,
        });
      }
    }

    // Apply reassignment
    deliveryOrder.staff_id = new_staff_id;
    await deliveryOrder.save();
    await deliveryOrder.populate([
      { path: "order_id" },
      { path: "staff_id", select: "position account_id" },
    ]);

    res.status(200).json({
      success: true,
      message: "Delivery reassigned successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reassigning delivery",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete delivery order (soft delete)
 * @route   DELETE /api/delivery-orders/:id
 * @access  Public
 */
exports.deleteDeliveryOrder = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findById(req.params.id);

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: "Delivery order not found",
      });
    }

    deliveryOrder.isDelete = true;
    await deliveryOrder.save();

    res.status(200).json({
      success: true,
      message: "Delivery order deleted successfully",
      data: deliveryOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting delivery order",
      error: error.message,
    });
  }
};
