const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Class = require('../models/Class');

// @desc    Get student attendance history & percentage
// @route   GET /api/student/attendance
// @access  Private/Student
exports.getAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { month, subject } = req.query; // e.g. month=4 for April

    let query = { 'records.student': studentId };
    if (subject) query.subject = subject;
    
    if (month) {
        // month is 1-indexed in query, so subtract 1
        const year = new Date().getFullYear();
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0);
        query.date = { $gte: startDate, $lte: endDate };
    }

    const attendances = await Attendance.find(query).populate('subject markedBy', 'name');

    let totalClasses = 0;
    let presentCount = 0;
    let absentCount = 0;
    let officialLeaveCount = 0;
    let personalLeaveCount = 0;

    const history = attendances.map(att => {
      const record = att.records.find(r => r.student.toString() === studentId);
      totalClasses++;
      
      if (record.status === 'Present') presentCount++;
      else if (record.status === 'Absent') absentCount++;
      else if (record.status === 'Official Leave') officialLeaveCount++;
      else if (record.status === 'Personal Leave') personalLeaveCount++;

      return {
        date: att.date,
        subject: att.subject.name,
        teacher: att.markedBy.name,
        status: record.status
      };
    });

    // Attendance % = (Present + Official Leave) / Total Lectures * 100
    const attendancePercentage = totalClasses === 0 ? 0 : 
      (((presentCount + officialLeaveCount) / totalClasses) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        percentage: attendancePercentage,
        summary: { totalClasses, presentCount, absentCount, officialLeaveCount, personalLeaveCount },
        history
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a leave request
// @route   POST /api/student/leave-requests
// @access  Private/Student
exports.submitLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    const leaveRequest = await LeaveRequest.create({
      student: req.user.id,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({ success: true, data: leaveRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my leave requests
// @route   GET /api/student/leave-requests
// @access  Private/Student
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
