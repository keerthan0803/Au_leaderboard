const Student = require('../models/Student');
const User = require('../models/User');
const { fetchLeetCodeData, fetchGitHubData, fetchCodeChefData, fetchHackerRankData } = require('../utils/apiHelpers');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', '-password');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update coding profiles
// @route   PUT /api/student/coding-profiles
// @access  Private (Student)
const updateCodingProfiles = async (req, res) => {
  try {
    const { leetcode, hackerrank, codechef, github } = req.body;

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student.codingProfiles = {
      leetcode: leetcode || student.codingProfiles.leetcode,
      hackerrank: hackerrank || student.codingProfiles.hackerrank,
      codechef: codechef || student.codingProfiles.codechef,
      github: github || student.codingProfiles.github
    };

    await student.save();
    res.json({ message: 'Coding profiles updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload resume
// @route   POST /api/student/resume
// @access  Private (Student)
const uploadResume = async (req, res) => {
  try {
    const { resumeData, fileName } = req.body;

    if (!resumeData || !fileName) {
      return res.status(400).json({ message: 'Resume data and filename are required' });
    }

    // Validate that it's a PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }

    // Validate base64 format
    if (!resumeData.startsWith('data:application/pdf;base64,')) {
      return res.status(400).json({ message: 'Invalid PDF format' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Store the base64 PDF data
    student.resumeUrl = resumeData;
    await student.save();

    res.json({ message: 'Resume uploaded successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh performance data
// @route   POST /api/student/refresh-data
// @access  Private (Student)
const refreshPerformanceData = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Fetch data from all coding platforms
    const results = {
      leetcode: false,
      github: false,
      codechef: false,
      hackerrank: false
    };
    
    if (student.codingProfiles.leetcode) {
      const data = await fetchLeetCodeData(student.codingProfiles.leetcode);
      if (data) {
        student.performanceData.leetcode = data;
        results.leetcode = true;
      }
    }

    if (student.codingProfiles.github) {
      const data = await fetchGitHubData(student.codingProfiles.github);
      if (data) {
        student.performanceData.github = data;
        results.github = true;
      }
    }

    if (student.codingProfiles.codechef) {
      const data = await fetchCodeChefData(student.codingProfiles.codechef);
      if (data) {
        student.performanceData.codechef = data;
        results.codechef = true;
      }
    }

    if (student.codingProfiles.hackerrank) {
      const data = await fetchHackerRankData(student.codingProfiles.hackerrank);
      if (data) {
        student.performanceData.hackerrank = data;
        results.hackerrank = true;
      }
    }

    // Calculate total score based on new formula
    // LeetCode: ln*10 + ((lr-1300)^2)/10 + lc*50
    const leetcodeScore = 
      student.performanceData.leetcode.solved * 10 +
      Math.pow(Math.max(0, student.performanceData.leetcode.contestRating - 1300), 2) / 10 +
      student.performanceData.leetcode.contestCount * 50;

    // CodeChef: cn*2 + ((cr-1200)^2)/10 + cc*50
    const codechefScore = 
      student.performanceData.codechef.solved * 2 +
      Math.pow(Math.max(0, student.performanceData.codechef.rating - 1200), 2) / 10 +
      student.performanceData.codechef.contestCount * 50;

    // HackerRank: hackos*10 (hn = hackos number)
    const hackerrankScore = student.performanceData.hackerrank.solved * 10;

    // GitHub: gc*2 + gs*5 + gprs*2 - gi*2
    const githubScore = 
      student.performanceData.github.commits * 2 +
      student.performanceData.github.stars * 5 +
      student.performanceData.github.prs * 2 -
      student.performanceData.github.issues * 2;

    // Total score
    student.totalScore = Math.round(leetcodeScore + codechefScore + hackerrankScore + Math.max(0, githubScore));

    student.lastUpdated = Date.now();
    await student.save();

    // Build status message
    const fetchedPlatforms = Object.keys(results).filter(key => results[key]);
    const failedPlatforms = Object.keys(results).filter(key => !results[key] && student.codingProfiles[key]);
    
    let message = 'Performance data refreshed';
    if (fetchedPlatforms.length > 0) {
      message += ` (Success: ${fetchedPlatforms.join(', ')})`;
    }
    if (failedPlatforms.length > 0) {
      message += ` (Failed: ${failedPlatforms.join(', ')})`;
    }

    res.json({ message, student, fetchResults: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateCodingProfiles,
  uploadResume,
  refreshPerformanceData
};
