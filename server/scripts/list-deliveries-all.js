const mongoose = require("mongoose");
require("dotenv").config();
const { DeliveryOrder } = require("../models");

async function run(staffId) {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
  );
  const deliveries = await DeliveryOrder.find({ staff_id: staffId });
  console.log(`All deliveries for ${staffId}: ${deliveries.length}`);
  deliveries.forEach((d) =>
    console.log(
      `- ${d._id} | status=${d.status} | tracking=${d.tracking_number}`
    )
  );
  await mongoose.connection.close();
}

const staffId = process.argv[2];
if (!staffId) {
  console.error("Usage: node list-deliveries-all.js <staffId>");
  process.exit(1);
}
run(staffId).catch((e) => {
  console.error(e);
  process.exit(1);
});
