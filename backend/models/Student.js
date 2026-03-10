const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  resumeUrl: {
    type: String,
    default: null
  },
  codingProfiles: {
    leetcode: {
      type: String,
      default: null
    },
    hackerrank: {
      type: String,
      default: null
    },
    codechef: {
      type: String,
      default: null
    },
    github: {
      type: String,
      default: null
    }
  },
  performanceData: {
    leetcode: {
      solved: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      contestCount: { type: Number, default: 0 }
    },
    hackerrank: {
      solved: { type: Number, default: 0 }
    },
    codechef: {
      solved: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      contestCount: { type: Number, default: 0 }
    },
    github: {
      commits: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      prs: { type: Number, default: 0 },
      issues: { type: Number, default: 0 }
    }
  },
  totalScore: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
