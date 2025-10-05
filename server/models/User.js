const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  enrolledCourses: [{
    courseId: String,
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginHistory: [{
    loggedInAt: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }]
});

// Add a method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Add a method to check if user is instructor
userSchema.methods.isInstructor = function() {
  return this.role === 'instructor' || this.role === 'admin';
};

// Add a method to enroll in a course
userSchema.methods.enrollInCourse = function(courseId) {
  if (!this.enrolledCourses.some(course => course.courseId === courseId)) {
    this.enrolledCourses.push({ courseId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Add a method to update course progress
userSchema.methods.updateCourseProgress = function(courseId, progress) {
  const course = this.enrolledCourses.find(c => c.courseId === courseId);
  if (course) {
    course.progress = Math.min(100, Math.max(0, progress)); // Ensure progress is between 0 and 100
    return this.save();
  }
  return Promise.resolve(this);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
