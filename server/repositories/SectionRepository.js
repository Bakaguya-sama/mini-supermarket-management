// server/repositories/SectionRepository.js
const { Section, Shelf } = require('../models');

class SectionRepository {
  async findAll(query, { sort = 'section_name', skip = 0, limit = 100 } = {}) {
    return await Section.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async findById(id) {
    return await Section.findById(id);
  }

  async findOne(query) {
    return await Section.findOne(query);
  }

  async create(data) {
    return await Section.create(data);
  }

  async insertMany(data) {
    return await Section.insertMany(data);
  }

  async save(doc) {
    return await doc.save();
  }

  async aggregateShelves(pipeline) {
    return await Shelf.aggregate(pipeline);
  }

  async updateManyShelves(filter, update) {
    return await Shelf.updateMany(filter, update);
  }

  async findShelves(query, sort = 'shelf_number') {
    return await Shelf.find(query)
      .sort(sort)
      .populate('section', 'section_name');
  }
}

module.exports = new SectionRepository();
