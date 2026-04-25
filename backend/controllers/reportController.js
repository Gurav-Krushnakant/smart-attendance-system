const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { Parser } = require('json2csv');

// @desc    Export reports
// @route   GET /api/reports/export
// @access  Private (Teacher/Admin)
exports.exportReport = async (req, res) => {
  try {
    const { type, classId, month, format } = req.query; // format = csv or pdf
    
    if (format !== 'csv') {
      return res.status(400).json({ message: 'Only CSV format is currently implemented for demonstration.' });
    }

    if (type === 'attendance') {
      let query = {};
      if (classId) query.class = classId;
      
      if (month) {
        const year = new Date().getFullYear();
        const startDate = new Date(year, parseInt(month) - 1, 1);
        const endDate = new Date(year, parseInt(month), 0);
        query.date = { $gte: startDate, $lte: endDate };
      }

      const attendances = await Attendance.find(query).populate('subject class markedBy records.student');
      
      let data = [];
      attendances.forEach(att => {
        att.records.forEach(record => {
            data.push({
                Date: att.date.toISOString().split('T')[0],
                Class: att.class?.name || 'N/A',
                Subject: att.subject?.name || 'N/A',
                Teacher: att.markedBy?.name || 'N/A',
                Student_Name: record.student?.name || 'N/A',
                Roll_No: record.student?.rollNumber || 'N/A',
                Status: record.status
            });
        });
      });

      if (data.length === 0) {
        return res.status(404).json({ message: 'No data found for the given criteria.' });
      }

      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);

      res.header('Content-Type', 'text/csv');
      res.attachment('attendance_report.csv');
      return res.send(csv);
    }

    res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
