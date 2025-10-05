const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300
  },
  instructor: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'design', 'business', 'marketing', 'data-science', 'other'],
    default: 'other'
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  thumbnail: {
    type: String,
    default: null
  },
  materials: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true,
      enum: ['video', 'pdf', 'document', 'presentation', 'audio']
    },
    fileSize: {
      type: Number,
      required: true
    },
    duration: {
      type: Number, // in minutes for videos/audio
      default: 0
    },
    order: {
      type: Number,
      default: 0
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  }],
  enrolledStudents: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedMaterials: [{
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isPublished: 1, isActive: 1 });
courseSchema.index({ 'enrolledStudents.user': 1 });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = Math.round((totalRating / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
  return this.save();
};

// Method to check if user is enrolled
courseSchema.methods.isUserEnrolled = function(userId) {
  return this.enrolledStudents.some(enrollment => 
    enrollment.user.toString() === userId.toString()
  );
};

// Method to get user progress
courseSchema.methods.getUserProgress = function(userId) {
  const enrollment = this.enrolledStudents.find(enrollment => 
    enrollment.user.toString() === userId.toString()
  );
  return enrollment ? enrollment.progress : 0;
};

// Method to update user progress
courseSchema.methods.updateUserProgress = function(userId, progress) {
  const enrollment = this.enrolledStudents.find(enrollment => 
    enrollment.user.toString() === userId.toString()
  );
  if (enrollment) {
    enrollment.progress = Math.min(100, Math.max(0, progress));
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark material as completed
courseSchema.methods.markMaterialCompleted = function(userId, materialId) {
  const enrollment = this.enrolledStudents.find(enrollment => 
    enrollment.user.toString() === userId.toString()
  );
  if (enrollment) {
    const isAlreadyCompleted = enrollment.completedMaterials.some(
      completed => completed.materialId.toString() === materialId.toString()
    );
    if (!isAlreadyCompleted) {
      enrollment.completedMaterials.push({ materialId });
      // Update overall progress
      const totalMaterials = this.materials.length;
      const completedCount = enrollment.completedMaterials.length;
      enrollment.progress = Math.round((completedCount / totalMaterials) * 100);
      return this.save();
    }
  }
  return Promise.resolve(this);
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
