// controllers/sectionController.js
const sectionService = require('../services/SectionService');
const logger = require('../config/logger');

/** @route GET /api/sections */
/**
 * @openapi
 * /api/sections/:
 *   get:
 *     tags: [section]
 *     summary: get All Sections
 *     operationId: getAllSections
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
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
/**
 * @openapi
 * /api/sections/{id}:
 *   get:
 *     tags: [section]
 *     summary: get Section By Id
 *     operationId: getSectionById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getSectionById = async (req, res, next) => {
  try {
    const data = await sectionService.getSectionById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** @route POST /api/sections */
/**
 * @openapi
 * /api/sections/:
 *   post:
 *     tags: [section]
 *     summary: create Section
 *     operationId: createSection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.createSection = async (req, res, next) => {
  try {
    const section = await sectionService.createSection(req.body);
    logger.info(`Section created successfully via controller: ${section.section_name}`);
    res.status(201).json({ success: true, message: "Section created", data: section });
  } catch (error) { next(error); }
};

/** @route PUT /api/sections/:id */
/**
 * @openapi
 * /api/sections/{id}:
 *   put:
 *     tags: [section]
 *     summary: update Section
 *     operationId: updateSection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.updateSection = async (req, res, next) => {
  try {
    const section = await sectionService.updateSection(req.params.id, req.body);
    logger.info(`Section updated successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: "Section updated", data: section });
  } catch (error) { next(error); }
};

/** @route DELETE /api/sections/:id */
/**
 * @openapi
 * /api/sections/{id}:
 *   delete:
 *     tags: [section]
 *     summary: delete Section
 *     operationId: deleteSection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.deleteSection = async (req, res, next) => {
  try {
    await sectionService.deleteSection(req.params.id);
    logger.info(`Section deleted successfully via controller: ${req.params.id}`);
    res.status(200).json({ success: true, message: "Section deleted" });
  } catch (error) { next(error); }
};

/** @route GET /api/sections/:id/shelves */
/**
 * @openapi
 * /api/sections/{id}/shelves:
 *   get:
 *     tags: [section]
 *     summary: get Shelves In Section
 *     operationId: getShelvesInSection
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
exports.getShelvesInSection = async (req, res, next) => {
  try {
    const data = await sectionService.getShelvesInSection(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

