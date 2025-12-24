// scripts/reconcile-shelves.js
// Usage: node reconcile-shelves.js [--fix]
// Runs a report of shelves where the computed used quantity (sum of ProductShelf.quantity)
// differs from the stored shelf.current_quantity or exceeds shelf.capacity.
// If --fix is supplied, the script will set shelf.current_quantity = computedSum for affected shelves.

const mongoose = require("mongoose");
require("dotenv").config();

const { Shelf, ProductShelf } = require("../models");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/mini-supermarket";
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function computeShelfUsage() {
  // Aggregate sum of quantities grouped by shelf
  const agg = await ProductShelf.aggregate([
    { $match: { isDelete: false } },
    { $group: { _id: "$shelf_id", total_quantity: { $sum: "$quantity" } } },
  ]);

  // Convert to map for quick lookup
  const usageMap = new Map();
  for (const row of agg) {
    usageMap.set(row._id.toString(), row.total_quantity);
  }

  // Fetch all shelves
  const shelves = await Shelf.find({}).lean();

  const report = [];

  for (const shelf of shelves) {
    const id = shelf._id.toString();
    const computed = usageMap.get(id) || 0;
    const stored = shelf.current_quantity || 0;
    const capacity = shelf.capacity || 0;

    const mismatch = computed !== stored;
    const overCapacity = computed > capacity;

    if (mismatch || overCapacity) {
      report.push({
        shelf_id: id,
        shelf_number: shelf.shelf_number,
        shelf_name: shelf.shelf_name,
        computed,
        stored,
        capacity,
        mismatch,
        overCapacity,
      });
    }
  }

  return report;
}

async function applyFixes(report) {
  for (const r of report) {
    try {
      console.log(
        `Fixing shelf ${r.shelf_number} (${r.shelf_id}): setting current_quantity ${r.stored} -> ${r.computed}`
      );
      await Shelf.findByIdAndUpdate(r.shelf_id, {
        current_quantity: r.computed,
      });
    } catch (err) {
      console.error("Failed to fix shelf", r.shelf_id, err.message);
    }
  }
}

(async () => {
  const shouldFix = process.argv.includes("--fix");

  try {
    console.log("Connecting to DB...");
    await connectDB();
    console.log("Connected");

    const report = await computeShelfUsage();

    if (report.length === 0) {
      console.log("No mismatches found. All shelves consistent.");
      process.exit(0);
    }

    console.log(`Found ${report.length} shelf(s) with issues:`);
    report.forEach((r) => {
      console.log(
        `- ${r.shelf_number} (${r.shelf_id}): computed=${r.computed}, stored=${r.stored}, capacity=${r.capacity}, overCapacity=${r.overCapacity}`
      );
    });

    if (shouldFix) {
      console.log(
        "\nApplying fixes: updating shelf.current_quantity to computed values..."
      );
      await applyFixes(report);
      console.log("Fixes applied. Re-running report...");
      const newReport = await computeShelfUsage();
      if (newReport.length === 0) {
        console.log("All shelves are now consistent.");
      } else {
        console.log("Remaining discrepancies:");
        newReport.forEach((r) =>
          console.log(
            `- ${r.shelf_number} (${r.shelf_id}): computed=${r.computed}, stored=${r.stored}, capacity=${r.capacity}, overCapacity=${r.overCapacity}`
          )
        );
      }
    } else {
      console.log(
        "\nRun with --fix to automatically set shelf.current_quantity to the computed sums."
      );
    }

    process.exit(0);
  } catch (err) {
    console.error("Error during reconciliation:", err.message);
    process.exit(1);
  }
})();
