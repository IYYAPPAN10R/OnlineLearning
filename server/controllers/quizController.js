const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');

// Create a new quiz (Instructor/Admin only)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, timeLimit, maxAttempts, passingScore, courseId } = req.body;
    
    // Get user from database
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'Quiz must have at least one question' });
    }

    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      questions,
      timeLimit: timeLimit || 30,
      maxAttempts: maxAttempts || 1,
      passingScore: passingScore || 60,
      courseId: courseId || 'general',
      createdBy: user._id
    });

    await quiz.save();
    await quiz.populate('createdBy', 'displayName email');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to create quiz',
      details: error.message 
    });
  }
};

// Get all quizzes (with filters)
exports.getAllQuizzes = async (req, res) => {
  try {
    const { courseId, createdBy, isPublished, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (courseId) query.courseId = courseId;
    if (createdBy) query.createdBy = createdBy;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const skip = (page - 1) * limit;
    
    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'displayName email')
      .select('-questions.correctAnswer -questions.explanation') // Hide answers for security
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Get single quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeAnswers = false } = req.query;
    
    let selectFields = '';
    if (!includeAnswers) {
      selectFields = '-questions.correctAnswer -questions.explanation';
    }

    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'displayName email')
      .select(selectFields);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user can see answers (instructor/admin or after submission)
    if (includeAnswers && req.user) {
      const user = await User.findOne({ uid: req.user.uid });
      if (user && (user.role === 'instructor' || user.role === 'admin' || user._id.equals(quiz.createdBy))) {
        // User can see answers
        const fullQuiz = await Quiz.findById(id).populate('createdBy', 'displayName email');
        return res.json(fullQuiz);
      }
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

// Update quiz (Instructor/Admin only)
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get user
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find quiz and check ownership
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user can edit (creator or admin)
    if (!quiz.createdBy.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own quizzes' });
    }

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'displayName email');

    res.json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

// Delete quiz (Admin only)
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Soft delete
    quiz.isActive = false;
    await quiz.save();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

// Start quiz attempt
exports.startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    console.log('Starting quiz attempt for quiz:', quizId);
    
    console.log('Looking for user with uid:', req.user.uid);
    let user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      console.log('User not found in database:', req.user.uid);
      console.log('Creating user entry...');
      
      // Create user if not exists (this can happen with Firebase auth)
      const newUser = new User({
        uid: req.user.uid,
        email: req.user.email || 'unknown@example.com',
        displayName: req.user.name || 'Unknown User',
        role: 'student'
      });
      
      try {
        await newUser.save();
        console.log('User created:', newUser.displayName);
        user = newUser;
      } catch (createError) {
        console.log('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
    } else {
      console.log('User found:', user.displayName);
    }

    const quiz = await Quiz.findById(quizId);
    console.log('Quiz found:', quiz ? quiz.title : 'null');
    console.log('Quiz isActive:', quiz?.isActive);
    console.log('Quiz isPublished:', quiz?.isPublished);
    
    if (!quiz || !quiz.isActive || !quiz.isPublished) {
      return res.status(404).json({ error: 'Quiz not available' });
    }

    // Check if quiz is within date range
    const now = new Date();
    if (quiz.endDate && now > quiz.endDate) {
      return res.status(400).json({ error: 'Quiz has expired' });
    }

    // Check existing attempts count
    const attemptCount = await QuizAttempt.countDocuments({
      quiz: quizId,
      student: user._id
    });

    console.log('Existing attempts count:', attemptCount);
    console.log('Max attempts allowed:', quiz.maxAttempts);
    console.log('Can attempt?', attemptCount < quiz.maxAttempts);

    if (attemptCount >= quiz.maxAttempts) {
      console.log('Maximum attempts reached - blocking attempt');
      return res.status(400).json({ 
        error: `Maximum attempts reached. You have used ${attemptCount} of ${quiz.maxAttempts} allowed attempts.` 
      });
    }

    // Use a retry mechanism to handle potential duplicate key errors
    let attempt;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        // Get the next attempt number by finding the highest existing number
        const lastAttempt = await QuizAttempt.findOne({
          quiz: quizId,
          student: user._id
        }).sort({ attemptNumber: -1 });

        const nextAttemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
        
        console.log('Attempting to create attempt number:', nextAttemptNumber);

        // Create new attempt
        attempt = new QuizAttempt({
          quiz: quizId,
          student: user._id,
          attemptNumber: nextAttemptNumber,
          totalPoints: quiz.totalPoints,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });

        await attempt.save();
        console.log('Quiz attempt created successfully');
        break; // Success, exit the retry loop

      } catch (saveError) {
        if (saveError.code === 11000 && retryCount < maxRetries - 1) {
          // Duplicate key error, retry with a small delay
          console.log(`Duplicate key error, retrying... (attempt ${retryCount + 1})`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
        } else {
          throw saveError; // Re-throw if it's not a duplicate key error or max retries reached
        }
      }
    }

    // Return quiz without answers
    const quizForAttempt = await Quiz.findById(quizId)
      .select('-questions.correctAnswer -questions.explanation');

    res.json({
      message: 'Quiz attempt started',
      attempt: {
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        timeLimit: quiz.timeLimit
      },
      quiz: quizForAttempt
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({ error: 'Failed to start quiz attempt' });
  }
};

// Submit quiz attempt
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz');

    if (!attempt) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    if (!attempt.student.equals(user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({ error: 'Quiz already submitted' });
    }

    // Grade the quiz
    const gradedAnswers = answers.map(answer => {
      const question = attempt.quiz.questions.id(answer.questionId);
      if (!question) return answer;

      let isCorrect = false;
      let pointsEarned = 0;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && answer.selectedOption === correctOption.text;
      } else if (question.type === 'short-answer') {
        // Simple text matching (can be enhanced with fuzzy matching)
        isCorrect = question.correctAnswer && 
          answer.textAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) {
        pointsEarned = question.points;
      }

      return {
        ...answer,
        isCorrect,
        pointsEarned
      };
    });

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.submittedAt = new Date();
    attempt.timeSpent = Math.floor((attempt.submittedAt - attempt.startedAt) / 1000);
    attempt.status = 'graded';
    
    // Check if passed
    attempt.passed = attempt.percentage >= attempt.quiz.passingScore;

    await attempt.save();

    // Update quiz statistics
    await Quiz.findByIdAndUpdate(attempt.quiz._id, {
      $inc: { totalAttempts: 1 }
    });

    res.json({
      message: 'Quiz submitted successfully',
      result: {
        pointsEarned: attempt.pointsEarned,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        passed: attempt.passed,
        grade: attempt.grade,
        timeSpent: attempt.formattedTimeSpent
      }
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
};

// Get quiz results for instructor
exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user can view results
    if (!quiz.createdBy.equals(user._id) && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to view results' });
    }

    const skip = (page - 1) * limit;

    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate('student', 'displayName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await QuizAttempt.countDocuments({ quiz: quizId });

    // Calculate statistics
    const stats = await QuizAttempt.aggregate([
      { $match: { quiz: quiz._id } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$percentage' },
          highestScore: { $max: '$percentage' },
          lowestScore: { $min: '$percentage' },
          totalAttempts: { $sum: 1 },
          passedCount: {
            $sum: { $cond: ['$passed', 1, 0] }
          }
        }
      }
    ]);

    const statistics = stats[0] || {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      totalAttempts: 0,
      passedCount: 0
    };

    statistics.passRate = statistics.totalAttempts > 0 
      ? Math.round((statistics.passedCount / statistics.totalAttempts) * 100) 
      : 0;

    res.json({
      quiz: {
        title: quiz.title,
        totalPoints: quiz.totalPoints,
        passingScore: quiz.passingScore
      },
      attempts,
      statistics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
};

// Get student's quiz attempts
exports.getStudentAttempts = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const attempts = await QuizAttempt.find({ student: user._id })
      .populate('quiz', 'title description totalPoints passingScore')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching student attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
};

module.exports = exports;
