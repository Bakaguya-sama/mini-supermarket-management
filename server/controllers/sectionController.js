const { Section, Shelf } = require("../models");

// @desc    Get all sections (if no sections exist, auto-generate from shelves)
exports.getAllSections = async (req, res) => {
  try {
    const { page = 1, limit = 100, search = "" } = req.query;

    // Try to fetch existing sections
    let sections = await Section.find({ isDelete: false })
      .sort("section_name")
      .skip((page - 1) * limit)
      .limit(parseInt(limit) || 100);

    // If none found, generate from shelves (useful for migrated DBs)
    if (!sections || sections.length === 0) {
      const agg = await Shelf.aggregate([
        { $match: { isDelete: false } },
        {
          $group: {
            _id: "$shelf_name",
            section_name: { $first: "$shelf_name" },
            shelf_count: { $sum: 1 },
            note: { $first: "$description" },
          },
        },
        { $sort: { section_name: 1 } },
      ]);

      if (agg.length > 0) {
        // Create Section docs from agg
        const toCreate = agg.map((a) => ({
          section_name: a.section_name,
          shelf_count: a.shelf_count || 0,
          note: a.note || "",
        }));

        await Section.insertMany(toCreate);

        sections = await Section.find({ isDelete: false }).sort("section_name");

        // Backfill shelf documents to reference created sections
        await Promise.all(
          sections.map(async (sec) => {
            await Shelf.updateMany(
              { shelf_name: sec.section_name },
              { $set: { section: sec._id } }
            );
          })
        );
      }
    }

    // Optionally filter by search
    const filtered = search
      ? sections.filter((s) =>
          s.section_name.toLowerCase().includes(search.toLowerCase())
        )
      : sections;

    return res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      page: parseInt(page),
      pages: 1,
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching sections" });
  }
};

// @desc    Get section by ID
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section || section.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    return res.json({ success: true, data: section });
  } catch (error) {
    console.error("Error fetching section by id:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching section" });
  }
};

// @desc    Create a new section
exports.createSection = async (req, res) => {
  try {
    const { section_name, shelf_count = 0, note = "" } = req.body;

    if (!section_name || !section_name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Section name is required" });
    }

    const existing = await Section.findOne({
      section_name: section_name.trim(),
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Section already exists" });

    const section = await Section.create({
      section_name: section_name.trim(),
      shelf_count,
      note,
    });
    return res
      .status(201)
      .json({ success: true, message: "Section created", data: section });
  } catch (error) {
    console.error("Error creating section:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error creating section" });
  }
};

// @desc    Update section
exports.updateSection = async (req, res) => {
  try {
    const { section_name, shelf_count, note, isDelete } = req.body;
    const section = await Section.findById(req.params.id);
    if (!section || section.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    if (section_name !== undefined) section.section_name = section_name.trim();
    if (shelf_count !== undefined) section.shelf_count = shelf_count;
    if (note !== undefined) section.note = note;
    if (isDelete !== undefined) section.isDelete = isDelete;

    await section.save();
    return res.json({
      success: true,
      message: "Section updated",
      data: section,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating section" });
  }
};

// @desc    Delete (soft) section
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section || section.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    // Soft delete
    section.isDelete = true;
    await section.save();

    return res.json({ success: true, message: "Section deleted" });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting section" });
  }
};

// @desc    Get shelves in a section
exports.getShelvesInSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section || section.isDelete)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    const shelves = await Shelf.find({
      shelf_name: section.section_name,
      isDelete: false,
    })
      .sort("shelf_number")
      .populate("section", "section_name");
    return res.json({ success: true, data: shelves });
  } catch (error) {
    console.error("Error fetching shelves for section:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching shelves for section" });
  }
};
