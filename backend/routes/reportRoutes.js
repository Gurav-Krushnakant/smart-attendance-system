const express = require('express');
const { exportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/export', exportReport);

module.exports = router;
