import React, { useState, useEffect } from 'react';
import { Clock, Users, Target, Play, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import QuizTaker from '../components/quiz/QuizTaker';
import './Quizzes.css';

const Quizzes = () => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [filter, setFilter] = useState('available'); // available, completed, all

  useEffect(() => {
    fetchQuizzes();
    if (currentUser) {
      fetchMyAttempts();
    }
  }, [currentUser]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quizzes?isPublished=true');
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttempts = async () => {
    try {
      const response = await api.get('/quizzes/my/attempts');
      setMyAttempts(response.data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const getQuizAttempt = (quizId) => {
    return myAttempts.find(attempt => attempt.quiz._id === quizId);
  };

  const canTakeQuiz = (quiz) => {
    const attempt = getQuizAttempt(quiz._id);
    if (!attempt) return true;
    
    const attemptCount = myAttempts.filter(a => a.quiz._id === quiz._id).length;
    return attemptCount < quiz.maxAttempts;
  };

  const getQuizStatus = (quiz) => {
    const attempt = getQuizAttempt(quiz._id);
    if (!attempt) return 'not-attempted';
    if (attempt.passed) return 'passed';
    return canTakeQuiz(quiz) ? 'can-retake' : 'failed';
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const status = getQuizStatus(quiz);
    
    switch (filter) {
      case 'available':
        return status === 'not-attempted' || status === 'can-retake';
      case 'completed':
        return status === 'passed' || status === 'failed';
      case 'all':
      default:
        return true;
    }
  });

  const handleStartQuiz = (quiz) => {
    if (!currentUser) {
      toast.error('Please log in to take quizzes');
      return;
    }

    if (!canTakeQuiz(quiz)) {
      toast.error('You have reached the maximum number of attempts for this quiz');
      return;
    }

    setSelectedQuiz(quiz);
  };

  const handleQuizComplete = (result) => {
    setQuizResult(result);
    setSelectedQuiz(null);
    fetchMyAttempts(); // Refresh attempts
  };

  const handleExitQuiz = () => {
    setSelectedQuiz(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={20} className="status-icon passed" />;
      case 'failed':
        return <XCircle size={20} className="status-icon failed" />;
      case 'can-retake':
        return <Play size={20} className="status-icon retake" />;
      default:
        return <Play size={20} className="status-icon available" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      case 'can-retake':
        return 'Retake Available';
      default:
        return 'Available';
    }
  };

  if (selectedQuiz) {
    return (
      <QuizTaker
        quiz={selectedQuiz}
        onComplete={handleQuizComplete}
        onExit={handleExitQuiz}
      />
    );
  }

  if (quizResult) {
    return (
      <div className="quiz-result-page">
        <div className="result-container">
          <div className="result-header">
            <h2>Quiz Completed!</h2>
            <div className={`result-score ${quizResult.passed ? 'passed' : 'failed'}`}>
              {quizResult.percentage}%
            </div>
          </div>
          
          <div className="result-details">
            <div className="result-item">
              <span>Score:</span>
              <span>{quizResult.pointsEarned} / {quizResult.totalPoints} points</span>
            </div>
            <div className="result-item">
              <span>Grade:</span>
              <span className={`grade-${quizResult.grade.toLowerCase()}`}>{quizResult.grade}</span>
            </div>
            <div className="result-item">
              <span>Status:</span>
              <span className={quizResult.passed ? 'passed' : 'failed'}>
                {quizResult.passed ? 'Passed' : 'Failed'}
              </span>
            </div>
            <div className="result-item">
              <span>Time Spent:</span>
              <span>{quizResult.timeSpent}</span>
            </div>
          </div>

          <div className="result-actions">
            <button 
              onClick={() => setQuizResult(null)}
              className="btn btn-primary"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      <div className="page-header">
        <h1>Quizzes</h1>
        <p>Test your knowledge with interactive quizzes</p>
      </div>

      <div className="quizzes-filters">
        <button
          onClick={() => setFilter('available')}
          className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
        >
          Available
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        >
          All Quizzes
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.length === 0 ? (
            <div className="no-quizzes">
              <Target size={48} />
              <h3>No quizzes found</h3>
              <p>
                {filter === 'available' 
                  ? 'No quizzes are currently available to take.'
                  : filter === 'completed'
                  ? 'You haven\'t completed any quizzes yet.'
                  : 'No quizzes have been created yet.'
                }
              </p>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const status = getQuizStatus(quiz);
              const attempt = getQuizAttempt(quiz._id);
              
              return (
                <div key={quiz._id} className={`quiz-card ${status}`}>
                  <div className="quiz-card-header">
                    <h3>{quiz.title}</h3>
                    <div className="quiz-status">
                      {getStatusIcon(status)}
                      <span>{getStatusText(status)}</span>
                    </div>
                  </div>

                  <p className="quiz-description">{quiz.description}</p>

                  <div className="quiz-meta">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{quiz.timeLimit} minutes</span>
                    </div>
                    <div className="meta-item">
                      <Target size={16} />
                      <span>{quiz.totalPoints} points</span>
                    </div>
                    <div className="meta-item">
                      <Users size={16} />
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                  </div>

                  <div className="quiz-details">
                    <div className="detail-item">
                      <span>Passing Score:</span>
                      <span>{quiz.passingScore}%</span>
                    </div>
                    <div className="detail-item">
                      <span>Attempts Allowed:</span>
                      <span>{quiz.maxAttempts}</span>
                    </div>
                    {attempt && (
                      <div className="detail-item">
                        <span>Your Best Score:</span>
                        <span className={attempt.passed ? 'passed' : 'failed'}>
                          {attempt.percentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="quiz-actions">
                    {currentUser ? (
                      canTakeQuiz(quiz) ? (
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="btn btn-primary"
                        >
                          <Play size={16} />
                          {attempt ? 'Retake Quiz' : 'Start Quiz'}
                        </button>
                      ) : (
                        <button className="btn btn-disabled" disabled>
                          Max Attempts Reached
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => toast.info('Please log in to take quizzes')}
                        className="btn btn-secondary"
                      >
                        <Eye size={16} />
                        Login to Take Quiz
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
