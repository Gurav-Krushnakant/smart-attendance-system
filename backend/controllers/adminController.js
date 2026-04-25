const User = require('../models/User');
const Department = require('../models/Department');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

// --- User Management ---

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, status, department } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.accountStatus = status;
    if (department) query.department = department;

    const users = await User.find(query).populate('department class').select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a teacher
// @route   POST /api/admin/users/teacher
// @access  Private/Admin
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, department, contactDetails, subjectName, subjectCode, classId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      role: 'teacher',
      department,
      contactDetails,
      accountStatus: 'Approved' // Teachers created by admin are auto-approved
    });

    if (subjectName && subjectCode && classId) {
        // Create the subject and assign to teacher
        const subject = await Subject.create({
            name: subjectName,
            code: subjectCode,
            teacher: teacher._id
        });

        // Add the subject to the class
        await Class.findByIdAndUpdate(classId, {
            $push: { subjects: subject._id }
        });
    }

    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student status (Approve/Reject)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus: status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Academic Structure Management ---

// @desc    Create Department
// @route   POST /api/admin/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Departments
// @route   GET /api/admin/departments
// @access  Private/Admin
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Class
// @route   POST /api/admin/classes
// @access  Private/Admin
exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Classes
// @route   GET /api/admin/classes
// @access  Private/Admin
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('department subjects classTeacher');
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Class Teacher
// @route   PUT /api/admin/classes/:id/teacher
// @access  Private/Admin
exports.updateClassTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { classTeacher: teacherId },
      { new: true }
    ).populate('department subjects classTeacher');
    
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.status(200).json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Subject
// @route   POST /api/admin/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Subjects
// @route   GET /api/admin/subjects
// @access  Private/Admin
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher');
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dashboard Analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingStudents = await User.countDocuments({ role: 'student', accountStatus: 'Pending' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalClasses = await Class.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        pendingStudents,
        totalTeachers,
        totalClasses
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
