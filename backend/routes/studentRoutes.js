const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateCodingProfiles,
  uploadResume,
  refreshPerformanceData
} = require('../controllers/studentController');
const { protect, studentOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, studentOnly, getProfile);
router.put('/coding-profiles', protect, studentOnly, updateCodingProfiles);
router.post('/resume', protect, studentOnly, uploadResume);
router.post('/refresh-data', protect, studentOnly, refreshPerformanceData);

module.exports = router;
