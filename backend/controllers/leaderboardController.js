const Student = require('../models/Student');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'firstName lastName email')
      .sort({ totalScore: -1 })
      .limit(100);
    
    const leaderboard = students.map((student, index) => {
      // Calculate individual platform scores based on the formula
      
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

      return {
        rank: index + 1,
        name: `${student.userId.firstName} ${student.userId.lastName}`,
        rollNumber: student.rollNumber,
        department: student.department,
        totalScore: student.totalScore,
        leetcode: Math.round(leetcodeScore),
        codechef: Math.round(codechefScore),
        hackerrank: Math.round(hackerrankScore),
        github: Math.round(Math.max(0, githubScore)),
        lastUpdated: student.lastUpdated
      };
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
