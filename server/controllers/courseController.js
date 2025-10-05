const Course = require('../models/Course');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Get all published courses
const getAllCourses = async (req, res) => {
  try {
    console.log('Fetching all courses with query:', req.query);
    
    const { category, level, search, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Build filter object
    const filter = { isPublished: true, isActive: true };
    console.log('Initial filter:', filter);
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (level && level !== 'all') {
      filter.level = level;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    console.log('Final filter:', filter);
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    console.log('Sort object:', sortObj);
    
    // Get count of total courses
    const total = await Course.countDocuments(filter);
    console.log(`Found ${total} courses matching filter`);
    
    // Get paginated courses
    const courses = await Course.find(filter)
      .populate('createdBy', 'displayName email')
      .populate('materials')
      .sort(sortObj)
      .select('-enrolledStudents -ratings')
      .lean();
    
    console.log(`Returning ${courses.length} courses`);
    
    // Add additional data to the response
    const response = {
      success: true,
      count: courses.length,
      total,
      data: courses
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getAllCourses:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch courses',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Optional: to check enrollment status
    
    const course = await Course.findById(id)
      .populate('createdBy', 'displayName email')
      .populate('enrolledStudents.user', 'displayName email');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (!course.isPublished || !course.isActive) {
      return res.status(404).json({ error: 'Course not available' });
    }
    
    // If userId is provided, check enrollment status
    if (userId) {
      const isEnrolled = course.isUserEnrolled(userId);
      const userProgress = course.getUserProgress(userId);
      
      return res.json({
        ...course.toObject(),
        isEnrolled,
        userProgress
      });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Create new course (admin/instructor only)
const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    courseData.createdBy = req.user.uid; // Assuming auth middleware sets req.user
    
    const course = new Course(courseData);
    await course.save();
    
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Update course (admin/instructor only)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Delete course (admin only)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Delete associated files
    course.materials.forEach(material => {
      const filePath = path.join(__dirname, '..', 'uploads', material.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

// Enroll in course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.uid;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (!course.isPublished || !course.isActive) {
      return res.status(400).json({ error: 'Course is not available for enrollment' });
    }
    
    // Check if already enrolled
    if (course.isUserEnrolled(userId)) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Add user to enrolled students
    course.enrolledStudents.push({ user: userId });
    await course.save();
    
    // Update user's enrolled courses
    await User.findOneAndUpdate(
      { uid: userId },
      { $addToSet: { enrolledCourses: { courseId, enrolledAt: new Date() } } }
    );
    
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
};

// Get course materials
const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.uid;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user is enrolled (for non-public materials)
    if (userId && !course.isUserEnrolled(userId)) {
      return res.status(403).json({ error: 'You must be enrolled to access course materials' });
    }
    
    // Return materials with file paths for enrolled users
    const materials = course.materials.map(material => ({
      ...material.toObject(),
      filePath: userId && course.isUserEnrolled(userId) ? material.filePath : null
    }));
    
    res.json(materials);
  } catch (error) {
    console.error('Error fetching course materials:', error);
    res.status(500).json({ error: 'Failed to fetch course materials' });
  }
};

// Download course material
const downloadMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    const userId = req.user?.uid;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const material = course.materials.id(materialId);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    // Check if user is enrolled
    if (userId && !course.isUserEnrolled(userId)) {
      return res.status(403).json({ error: 'You must be enrolled to download materials' });
    }
    
    const filePath = path.join(__dirname, '..', 'uploads', material.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Increment download count
    material.downloads = (material.downloads || 0) + 1;
    await course.save();
    
    res.download(filePath, `${material.title}.${material.fileType}`);
  } catch (error) {
    console.error('Error downloading material:', error);
    res.status(500).json({ error: 'Failed to download material' });
  }
};

// Rate course
const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.uid;
    const { rating, review } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if user is enrolled
    if (!course.isUserEnrolled(userId)) {
      return res.status(403).json({ error: 'You must be enrolled to rate this course' });
    }
    
    // Remove existing rating if any
    course.ratings = course.ratings.filter(r => r.user.toString() !== userId);
    
    // Add new rating
    course.ratings.push({ user: userId, rating, review });
    
    // Calculate new average rating
    await course.calculateAverageRating();
    
    res.json({ message: 'Course rated successfully' });
  } catch (error) {
    console.error('Error rating course:', error);
    res.status(500).json({ error: 'Failed to rate course' });
  }
};

// Get user's enrolled courses
const getUserCourses = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const courses = await Course.find({
      'enrolledStudents.user': userId,
      isPublished: true,
      isActive: true
    })
    .populate('createdBy', 'displayName')
    .select('-materials.filePath -enrolledStudents -ratings');
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ error: 'Failed to fetch user courses' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getCourseMaterials,
  downloadMaterial,
  rateCourse,
  getUserCourses
};
