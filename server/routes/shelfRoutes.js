// routes/shelfRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllShelves,
  getShelfStats,
  getShelfById,
  getShelvesByCategory,
  getAvailableShelves,
  createShelf,
  updateShelf,
  toggleShelfFull,
  deleteShelf,
  getShelfCapacity,
} = require("../controllers/shelfController");

// Stats and special routes (must be before :id routes)
router.get("/stats", getShelfStats);
router.get("/available", getAvailableShelves);
router.get("/category/:category", getShelvesByCategory);

// Main CRUD routes
router.route("/").get(getAllShelves).post(createShelf);

router.route("/:id").get(getShelfById).put(updateShelf).delete(deleteShelf);

// Special action routes
router.put("/:id/toggle-full", toggleShelfFull);
router.get("/:id/capacity", getShelfCapacity);

module.exports = router;
