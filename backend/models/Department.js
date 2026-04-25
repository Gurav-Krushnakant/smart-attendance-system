const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Please add a department code'],
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
