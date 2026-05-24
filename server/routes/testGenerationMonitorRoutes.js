const express = require('express');
const router = express.Router();
const testGenerationMonitorController = require('../controllers/testGenerationMonitorController');

router.get('/openapi', testGenerationMonitorController.getOpenApiGeneratedTestSummary);

module.exports = router;