// controllers/sectionController.js
const sectionService = require('../services/SectionService');
const logger = require('../config/logger');

/** @route GET /api/sections */
exports.getAllSections = async (req, res, next) => {
  try {
    const { sections, total, page } = await sectionService.getAllSections(req.query);
    res.status(200).json({
      success: true,
      data: sections,
      total,
      page,
      pages: 1
    });
  } catch (error) { next(error); }
};

/** @route GET /api/sections/:id */
exports.getSectionById = async (req, res, next) => {
  try {
    const data = await sectionService.getSectionById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/sections */
exports.createSection = async (req, res, next) => {
  try {
    const section = await sectionService.createSection(req.body);
    logger.info(`Section created successfully via controller: ${section.section_name}`);
    res.status(201).json({ success: true, message: "Section created", data: section });
  } catch (error) { next(error); }
};

/** @route PUT /api/sections/:id */
exports.updateSection = async (req, res, next) => {
  try {
    const section = await sectionService.updateSection(req.params.id, req.body);
    logger.info(`Section updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: "Section updated", data: section });
  } catch (error) { next(error); }
};

/** @route DELETE /api/sections/:id */
exports.deleteSection = async (req, res, next) => {
  try {
    await sectionService.deleteSection(req.params.id);
    logger.info(`Section deleted successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: "Section deleted" });
  } catch (error) { next(error); }
};

/** @route GET /api/sections/:id/shelves */
exports.getShelvesInSection = async (req, res, next) => {
  try {
    const data = await sectionService.getShelvesInSection(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
