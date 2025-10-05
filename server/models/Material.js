const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  // For file uploads
  filePath: {
    type: String,
    required: false
  },
  // For external content (YouTube, Vimeo, etc.)
  contentUrl: {
    type: String,
    required: false,
    trim: true
  },
  // Content can be embedded directly for text-based materials
  content: {
    type: String,
    required: false,
    default: ''
  },
  // Material type - simplified enum
  type: {
    type: String,
    required: false,
    enum: ['video', 'pdf', 'document', 'presentation', 'audio', 'image', 'other'],
    default: 'document'
  },
  // File type for uploaded files
  fileType: {
    type: String,
    required: false,
    enum: ['video', 'pdf', 'document', 'presentation', 'audio', 'image', 'other']
  },
  // File size in bytes
  fileSize: {
    type: Number,
    required: false
  },
  // Course ID as string (simplified)
  courseId: {
    type: String,
    required: false,
    default: 'general'
  },
  // Reference to the user who uploaded this material
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Legacy field for compatibility (maps to uploadedBy)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Legacy field for compatibility (maps to courseId)
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false
  },
  // Order of the material in the course
  order: {
    type: Number,
    default: 0
  },
  // Duration in minutes (for videos, readings, etc.)
  duration: {
    type: Number,
    min: 0
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: String
  },
  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  // Stats
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
materialSchema.index({ title: 'text', description: 'text' });

// Clear any existing model to avoid OverwriteModelError
if (mongoose.models.Material) {
  delete mongoose.models.Material;
}

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
