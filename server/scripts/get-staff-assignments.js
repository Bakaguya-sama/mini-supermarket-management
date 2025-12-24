const mongoose = require("mongoose");
require("dotenv").config();
const { Staff, Account } = require("../models");

async function run() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket"
  );
  const staffs = await Staff.find({}).populate(
    "account_id",
    "username full_name"
  );
  console.log("Staff assignments:");
  staffs.forEach((s) => {
    console.log(
      `- ${s.account_id?.username || "N/A"} (${
        s.position
      }) -> current_assignments: ${s.current_assignments || 0}`
    );
  });
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
