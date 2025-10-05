const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const instructorOrAdmin = require('../middleware/instructorOrAdmin');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:courseId/materials', auth, courseController.getCourseMaterials);
router.get('/:courseId/materials/:materialId/download', auth, courseController.downloadMaterial);

// Protected routes (require authentication)
router.post('/:courseId/enroll', auth, courseController.enrollInCourse);
router.post('/:courseId/rate', auth, courseController.rateCourse);
router.get('/user/enrolled', auth, courseController.getUserCourses);

// Admin/Instructor routes - instructors can create and update courses
router.post('/', auth, instructorOrAdmin, courseController.createCourse);
router.put('/:id', auth, instructorOrAdmin, courseController.updateCourse);
// Only admins can delete courses
router.delete('/:id', auth, admin, courseController.deleteCourse);

module.exports = router;
