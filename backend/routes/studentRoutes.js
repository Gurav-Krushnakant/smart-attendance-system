const express = require('express');
const { 
  getAttendance, 
  submitLeaveRequest, 
  getMyLeaveRequests 
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/attendance', getAttendance);

router.route('/leave-requests')
  .post(submitLeaveRequest)
  .get(getMyLeaveRequests);

module.exports = router;
