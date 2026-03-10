const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  getLeaderboard
} = require('../controllers/facultyController');
const { protect, facultyOnly } = require('../middleware/authMiddleware');

router.get('/students', protect, facultyOnly, getAllStudents);
router.get('/students/:id', protect, facultyOnly, getStudentById);
router.get('/leaderboard', protect, facultyOnly, getLeaderboard);

module.exports = router;
