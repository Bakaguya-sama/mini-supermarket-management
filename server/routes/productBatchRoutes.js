// routes/productBatchRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBatch,
  getAllBatches,
  getBatchById,
  getBatchesByProduct,
  updateBatch,
  adjustBatchQuantity,
  deleteBatch,
} = require("../controllers/productBatchController");

// Nested route: batches by product
router.get("/product/:productId", getBatchesByProduct);

// Main CRUD
router.route("/").get(getAllBatches).post(createBatch);

router.route("/:id").get(getBatchById).put(updateBatch).delete(deleteBatch);

router.put("/:id/adjust", adjustBatchQuantity);

module.exports = router;
