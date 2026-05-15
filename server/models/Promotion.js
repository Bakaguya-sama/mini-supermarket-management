const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discount: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, required: true, enum: ["Đang diễn ra", "Sắp tới", "Đã kết thúc"] },
}, { timestamps: true });

module.exports = mongoose.model("Promotion", promotionSchema);
