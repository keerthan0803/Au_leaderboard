const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/faculty/students
// @access  Private (Faculty)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'firstName lastName email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student by ID
// @route   GET /api/faculty/students/:id
// @access  Private (Faculty)
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'firstName lastName email');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/faculty/leaderboard
// @access  Private (Faculty)
const getLeaderboard = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email')
      .sort({ totalScore: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getLeaderboard
};
