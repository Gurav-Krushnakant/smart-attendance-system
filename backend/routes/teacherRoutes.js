const express = require('express');
const { 
  getAssignedClasses, 
  getClassStudents,
  markAttendance, 
  updateAttendance, 
  getLeaveRequests, 
  handleLeaveRequest 
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/classes', getAssignedClasses);
router.get('/classes/:id/students', getClassStudents);

router.route('/attendance')
  .post(markAttendance);

router.put('/attendance/:id', updateAttendance);

router.route('/leave-requests')
  .get(getLeaveRequests);

router.put('/leave-requests/:id', handleLeaveRequest);

module.exports = router;
