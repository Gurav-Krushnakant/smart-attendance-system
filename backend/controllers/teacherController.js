const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get classes assigned to teacher
// @route   GET /api/teacher/classes
// @access  Private/Teacher
exports.getAssignedClasses = async (req, res) => {
  try {
    // Find subjects taught by this teacher
    const subjects = await Subject.find({ teacher: req.user.id });
    const subjectIds = subjects.map(s => s._id);

    // Find classes that have these subjects
    const classes = await Class.find({ subjects: { $in: subjectIds } }).populate('department subjects');
    
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance for a class & subject
// @route   POST /api/teacher/attendance
// @access  Private/Teacher
exports.markAttendance = async (req, res) => {
  try {
    const { classId, subjectId, date, records } = req.body;

    // Check if attendance already exists for this date, class, and subject
    let attendance = await Attendance.findOne({
      class: classId,
      subject: subjectId,
      date: new Date(date).setHours(0, 0, 0, 0)
    });

    if (attendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date. Use update instead.' });
    }

    attendance = await Attendance.create({
      class: classId,
      subject: subjectId,
      date: new Date(date).setHours(0, 0, 0, 0),
      markedBy: req.user.id,
      records
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update attendance record
// @route   PUT /api/teacher/attendance/:id
// @access  Private/Teacher
exports.updateAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }

    attendance.records = records;
    await attendance.save();

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave requests for classes where user is Class Teacher
// @route   GET /api/teacher/leave-requests
// @access  Private/Teacher
exports.getLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Find classes where this teacher is the class teacher
    const myClasses = await Class.find({ classTeacher: req.user.id }).select('_id');
    const classIds = myClasses.map(c => c._id);

    // Find students in those classes
    const myStudents = await User.find({ role: 'student', class: { $in: classIds } }).select('_id');
    const studentIds = myStudents.map(s => s._id);

    let query = { student: { $in: studentIds } };
    if (status) query.status = status;
    
    const requests = await LeaveRequest.find(query).populate({
      path: 'student',
      populate: { path: 'class department' }
    });
    
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle leave request (Approve as OL/PL or Reject)
// @route   PUT /api/teacher/leave-requests/:id
// @access  Private/Teacher (or Admin)
exports.handleLeaveRequest = async (req, res) => {
  try {
    const { status, approvedAs } = req.body;

    if (status === 'Approved' && !approvedAs) {
      return res.status(400).json({ message: 'Must specify approvedAs (Official Leave or Personal Leave) when approving' });
    }

    const request = await LeaveRequest.findById(req.params.id).populate({
      path: 'student',
      populate: { path: 'class' }
    });

    if (!request) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Authorize: Ensure the teacher is the classTeacher for this student's class
    if (request.student.class.classTeacher && request.student.class.classTeacher.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized: You are not the Class Teacher for this student' });
    }

    request.status = status;
    request.approvedAs = approvedAs;
    request.handledBy = req.user.id;
    await request.save();

    if (status === 'Approved') {
        const student = request.student;
        const classId = student.class;
        const studentClass = await Class.findById(classId).populate('subjects');
        
        if (studentClass && studentClass.subjects) {
            let currentDate = new Date(request.startDate);
            const endDate = new Date(request.endDate);
            
            while (currentDate <= endDate) {
                const dateToMark = new Date(currentDate).setHours(0,0,0,0);
                
                for (let subject of studentClass.subjects) {
                    let attendance = await Attendance.findOne({
                        class: classId,
                        subject: subject._id,
                        date: dateToMark
                    });
                    
                    if (attendance) {
                        const recordIndex = attendance.records.findIndex(r => r.student.toString() === student._id.toString());
                        if (recordIndex > -1) {
                            attendance.records[recordIndex].status = approvedAs;
                        } else {
                            attendance.records.push({ student: student._id, status: approvedAs });
                        }
                        await attendance.save();
                    } else {
                        await Attendance.create({
                            class: classId,
                            subject: subject._id,
                            date: dateToMark,
                            markedBy: req.user.id,
                            records: [{ student: student._id, status: approvedAs }]
                        });
                    }
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    let message = `Your leave request from ${new Date(request.startDate).toDateString()} to ${new Date(request.endDate).toDateString()} has been ${status}.`;
    if (status === 'Approved') {
        message += ` It was approved as ${approvedAs}.`;
    }

    await Notification.create({
      title: `Leave Request ${status}`,
      message,
      user: request.student._id,
      type: 'leave'
    });

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students for a class
// @route   GET /api/teacher/classes/:id/students
// @access  Private/Teacher
exports.getClassStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', class: req.params.id, accountStatus: 'Approved' }).select('name rollNumber');
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
