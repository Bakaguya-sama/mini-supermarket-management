const mongoose = require("mongoose");
require("dotenv").config();
const { DeliveryOrder, Staff } = require("../models");

async function run() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
  );
  const docs = await DeliveryOrder.find()
    .limit(20)
    .populate("staff_id", "position");
  console.log("Sample deliveries:");
  docs.forEach((d) =>
    console.log(
      `- ${d._id} | staff_id=${d.staff_id ? d.staff_id._id : "N/A"} | status=${
        d.status
      }`
    )
  );
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
