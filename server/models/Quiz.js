const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String, // For short-answer questions
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  explanation: {
    type: String,
    trim: true
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Quiz description is required'],
    trim: true
  },
  courseId: {
    type: String,
    required: false,
    default: 'general'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  
  // Quiz settings
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  maxAttempts: {
    type: Number,
    default: 1
  },
  passingScore: {
    type: Number,
    default: 60 // percentage
  },
  showResults: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  
  // Availability
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  totalPoints: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total points when questions are modified
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

// Virtual for quiz duration in human readable format
quizSchema.virtual('duration').get(function() {
  if (this.timeLimit < 60) {
    return `${this.timeLimit} minutes`;
  } else {
    const hours = Math.floor(this.timeLimit / 60);
    const minutes = this.timeLimit % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  }
});

// Index for better performance
quizSchema.index({ createdBy: 1, isActive: 1 });
quizSchema.index({ courseId: 1, isPublished: 1 });
quizSchema.index({ title: 'text', description: 'text' });

// Clear any existing model to avoid OverwriteModelError
if (mongoose.models.Quiz) {
  delete mongoose.models.Quiz;
}

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
