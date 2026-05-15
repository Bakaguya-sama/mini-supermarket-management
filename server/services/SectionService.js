// server/services/SectionService.js
const sectionRepository = require('../repositories/SectionRepository');
const { BadRequestError, NotFoundError } = require('../middleware/errorClasses');
const logger = require('../config/logger');
const redisClient = require('../config/redis');

const CACHE_TTL = 600; // 10 minutes

class SectionService {
  async getAllSections({ page = 1, limit = 100, search = "" }) {
    let sections = await sectionRepository.findAll({ isDelete: false }, { 
      skip: (parseInt(page) - 1) * parseInt(limit), 
      limit: parseInt(limit) 
    });

    if (!sections || sections.length === 0) {
      const agg = await sectionRepository.aggregateShelves([
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
        const toCreate = agg.map((a) => ({
          section_name: a.section_name,
          shelf_count: a.shelf_count || 0,
          note: a.note || "",
        }));

        await sectionRepository.insertMany(toCreate);
        sections = await sectionRepository.findAll({ isDelete: false });

        await Promise.all(
          sections.map(async (sec) => {
            await sectionRepository.updateManyShelves(
              { shelf_name: sec.section_name },
              { $set: { section: sec._id } }
            );
          })
        );
        logger.info(`BUS-001: Auto-generated ${sections.length} sections from existing shelves`);
      }
    }

    const filtered = search
      ? sections.filter((s) =>
          s.section_name.toLowerCase().includes(search.toLowerCase())
        )
      : sections;

    return { sections: filtered, total: filtered.length, page: parseInt(page) };
  }

  async getSectionById(id) {
    const section = await sectionRepository.findById(id);
    if (!section || section.isDelete) throw new NotFoundError('Section not found');
    return section;
  }

  async createSection(data) {
    const { section_name, shelf_count = 0, note = "" } = data;

    if (!section_name || !section_name.trim()) {
      throw new BadRequestError('Section name is required');
    }

    const existing = await sectionRepository.findOne({ section_name: section_name.trim() });
    if (existing) throw new BadRequestError('Section already exists');

    const section = await sectionRepository.create({
      section_name: section_name.trim(),
      shelf_count,
      note,
    });

    logger.info(`BUS-001: Created new section: ${section_name}`);
    return section;
  }

  async updateSection(id, data) {
    const { section_name, shelf_count, note, isDelete } = data;
    const section = await sectionRepository.findById(id);
    if (!section || section.isDelete) throw new NotFoundError('Section not found');

    if (section_name !== undefined) section.section_name = section_name.trim();
    if (shelf_count !== undefined) section.shelf_count = shelf_count;
    if (note !== undefined) section.note = note;
    if (isDelete !== undefined) section.isDelete = isDelete;

    await sectionRepository.save(section);
    logger.info(`BUS-001: Updated section: ${id}`);
    return section;
  }

  async deleteSection(id) {
    const section = await sectionRepository.findById(id);
    if (!section || section.isDelete) throw new NotFoundError('Section not found');

    section.isDelete = true;
    await sectionRepository.save(section);
    logger.info(`BUS-001: Deleted section (soft delete): ${id}`);
    return true;
  }

  async getShelvesInSection(id) {
    const section = await sectionRepository.findById(id);
    if (!section || section.isDelete) throw new NotFoundError('Section not found');

    return await sectionRepository.findShelves({
      shelf_name: section.section_name,
      isDelete: false,
    });
  }
}

module.exports = new SectionService();
