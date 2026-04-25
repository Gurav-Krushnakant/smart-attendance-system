const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load models
const User = require('../models/User');
const Department = require('../models/Department');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Class.deleteMany();
    await Subject.deleteMany();
    await Attendance.deleteMany();
    await LeaveRequest.deleteMany();
    await Notification.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    // 1. Create Departments
    const depts = await Department.insertMany([
      { name: 'Computer Science', code: 'CSE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Mechanical Engineering', code: 'ME' }
    ]);

    // 2. Create Classes
    const classes = await Class.insertMany([
      { name: 'FY CSE', department: depts[0]._id },
      { name: 'SY CSE', department: depts[0]._id },
      { name: 'TY CSE', department: depts[0]._id },
      { name: 'Final Year CSE', department: depts[0]._id }
    ]);

    // 3. Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@college.com',
      password: 'password123',
      role: 'admin',
      accountStatus: 'Approved'
    });

    // 4. Create Teachers
    const teacherData = [];
    for (let i = 1; i <= 5; i++) {
      teacherData.push({
        name: `Teacher ${i}`,
        email: `teacher${i}@college.com`,
        password: defaultPassword,
        role: 'teacher',
        department: depts[0]._id,
        accountStatus: 'Approved'
      });
    }
    const teachers = await User.insertMany(teacherData);

    // 5. Create Subjects and Assign to Classes
    const subjects = await Subject.insertMany([
      { name: 'Data Structures', code: 'CS201', teacher: teachers[0]._id },
      { name: 'Database Management', code: 'CS301', teacher: teachers[1]._id },
      { name: 'Operating Systems', code: 'CS302', teacher: teachers[2]._id }
    ]);

    // Update classes with subjects
    await Class.findByIdAndUpdate(classes[1]._id, { subjects: [subjects[0]._id] });
    await Class.findByIdAndUpdate(classes[2]._id, { subjects: [subjects[1]._id, subjects[2]._id] });

    // 6. Create Students
    const studentData = [];
    for (let i = 1; i <= 20; i++) {
      studentData.push({
        name: `Student ${i}`,
        email: `student${i}@college.com`,
        password: defaultPassword,
        role: 'student',
        department: depts[0]._id,
        class: classes[2]._id, // TY CSE
        rollNumber: `CSE-TY-${i.toString().padStart(3, '0')}`,
        accountStatus: i <= 15 ? 'Approved' : 'Pending' // Some pending for demo
      });
    }
    const students = await User.insertMany(studentData);

    // 7. Create Sample Attendance
    const attendanceRecords = students.map((s, index) => ({
      student: s._id,
      status: index % 5 === 0 ? 'Absent' : (index % 7 === 0 ? 'Official Leave' : 'Present')
    }));

    await Attendance.create({
      class: classes[2]._id,
      subject: subjects[1]._id,
      date: new Date(),
      markedBy: teachers[1]._id,
      records: attendanceRecords
    });

    // 8. Create Sample Leave Request
    await LeaveRequest.create({
      student: students[0]._id,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // +2 days
      reason: 'Attending hackathon',
      status: 'Pending'
    });

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
