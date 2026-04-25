const express = require('express');
const { 
  getUsers, 
  createTeacher, 
  updateUserStatus, 
  createDepartment, 
  getDepartments,
  createClass,
  getClasses,
  updateClassTeacher,
  createSubject,
  getSubjects,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.route('/users')
  .get(getUsers);

router.post('/users/teacher', createTeacher);
router.put('/users/:id/status', updateUserStatus);

router.route('/departments')
  .post(createDepartment)
  .get(getDepartments);

router.route('/classes')
  .post(createClass)
  .get(getClasses);

router.put('/classes/:id/teacher', updateClassTeacher);

router.route('/subjects')
  .post(createSubject)
  .get(getSubjects);

module.exports = router;
