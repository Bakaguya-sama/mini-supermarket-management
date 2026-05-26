const express = require('express');
const router = express.Router();
const testGenerationMonitorController = require('../controllers/testGenerationMonitorController');

router.get('/openapi', testGenerationMonitorController.getOpenApiGeneratedTestSummary);
router.post('/generate', testGenerationMonitorController.generateTests);
router.post('/run', testGenerationMonitorController.runTests);
router.post('/cancel', testGenerationMonitorController.cancelTask);
router.post('/clear', testGenerationMonitorController.clearAllData);

module.exports = router;