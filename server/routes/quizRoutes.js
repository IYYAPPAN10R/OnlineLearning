const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const instructorOrAdmin = require('../middleware/instructorOrAdmin');

// Public routes (for viewing published quizzes)
router.get('/', quizController.getAllQuizzes);

// Student routes (authenticated) - Put specific routes first
router.post('/:quizId/start', (req, res, next) => {
  console.log('POST /:quizId/start route hit with quizId:', req.params.quizId);
  next();
}, auth, quizController.startQuizAttempt);
router.put('/attempts/:attemptId/submit', auth, quizController.submitQuizAttempt);
router.get('/my/attempts', auth, quizController.getStudentAttempts);

// Get single quiz (put this after specific routes to avoid conflicts)
router.get('/:id', quizController.getQuizById);

// Instructor/Admin routes (quiz management)
router.post('/', auth, instructorOrAdmin, quizController.createQuiz);
router.put('/:id', auth, instructorOrAdmin, quizController.updateQuiz);
router.get('/:quizId/results', auth, instructorOrAdmin, quizController.getQuizResults);

// Admin only routes
router.delete('/:id', auth, admin, quizController.deleteQuiz);

// Debug route to clear quiz attempts (remove in production)
router.delete('/:quizId/attempts/clear', auth, async (req, res) => {
  try {
    const QuizAttempt = require('../models/QuizAttempt');
    const { quizId } = req.params;
    
    const result = await QuizAttempt.deleteMany({ quiz: quizId });
    res.json({ 
      message: `Cleared ${result.deletedCount} attempts for quiz ${quizId}`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing attempts:', error);
    res.status(500).json({ error: 'Failed to clear attempts' });
  }
});

module.exports = router;
