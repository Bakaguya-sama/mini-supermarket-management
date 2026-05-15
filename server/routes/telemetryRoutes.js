const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

// Không bọc auth để dễ test/demo (chỉ dùng trong mạng nội bộ)
router.get('/traces', telemetryController.getTraces);
router.delete('/traces', telemetryController.clearTraces);

module.exports = router;
