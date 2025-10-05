const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: {
    type: String, // For multiple choice questions
    required: false
  },
  textAnswer: {
    type: String, // For short answer questions
    required: false,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  
  // Attempt details
  answers: [answerSchema],
  
  // Timing
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    required: false
  },
  timeSpent: {
    type: Number, // total time in seconds
    default: 0
  },
  
  // Scoring
  totalPoints: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded', 'expired'],
    default: 'in-progress'
  },
  
  // IP and browser info for security
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  
  // Instructor feedback
  feedback: {
    type: String,
    required: false,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  gradedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate score before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.isModified('answers') || this.isModified('totalPoints')) {
    // Calculate points earned
    this.pointsEarned = this.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
    
    // Calculate percentage
    if (this.totalPoints > 0) {
      this.percentage = Math.round((this.pointsEarned / this.totalPoints) * 100);
    }
    
    // Update status if submitted
    if (this.submittedAt && this.status === 'in-progress') {
      this.status = 'submitted';
    }
  }
  next();
});

// Virtual for formatted time spent
quizAttemptSchema.virtual('formattedTimeSpent').get(function() {
  const minutes = Math.floor(this.timeSpent / 60);
  const seconds = this.timeSpent % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for grade letter
quizAttemptSchema.virtual('grade').get(function() {
  if (this.percentage >= 90) return 'A';
  if (this.percentage >= 80) return 'B';
  if (this.percentage >= 70) return 'C';
  if (this.percentage >= 60) return 'D';
  return 'F';
});

// Compound index to ensure unique attempts per user per quiz
quizAttemptSchema.index({ quiz: 1, student: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ quiz: 1, status: 1 });
quizAttemptSchema.index({ student: 1, createdAt: -1 });

// Clear any existing model to avoid OverwriteModelError
if (mongoose.models.QuizAttempt) {
  delete mongoose.models.QuizAttempt;
}

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;
