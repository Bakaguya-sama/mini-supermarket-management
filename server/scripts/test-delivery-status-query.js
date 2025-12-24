const mongoose = require("mongoose");
require("dotenv").config();
const { DeliveryOrder } = require("../models");

async function run(staffId, statusesCsv = "assigned") {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
  );
  const statuses = statusesCsv.split(",").map((s) => s.trim());
  const deliveries = await DeliveryOrder.find({
    staff_id: staffId,
    status: { $in: statuses },
  });
  console.log(
    `Deliveries for ${staffId} with statuses ${statuses.join(",")}: ${
      deliveries.length
    }`
  );
  deliveries.forEach((d) =>
    console.log(`- ${d._id} | ${d.status} | ${d.tracking_number}`)
  );
  await mongoose.connection.close();
}

const staffId = process.argv[2];
const statuses = process.argv[3] || "assigned";
if (!staffId) {
  console.error(
    "Usage: node test-delivery-status-query.js <staffId> [statusesCsv]"
  );
  process.exit(1);
}
run(staffId, statuses).catch((e) => {
  console.error(e);
  process.exit(1);
});
