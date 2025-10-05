import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle, CheckCircle, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './QuizTaker.css';

const QuizTaker = ({ quiz, onComplete, onExit }) => {
  const { currentUser } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    startQuizAttempt();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);

  const startQuizAttempt = async () => {
    try {
      const response = await api.post(`/quizzes/${quiz._id}/start`);
      setAttempt(response.data.attempt);
      setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      
      // Initialize answers object
      const initialAnswers = {};
      quiz.questions.forEach(question => {
        initialAnswers[question._id] = {
          questionId: question._id,
          selectedOption: '',
          textAnswer: '',
          timeSpent: 0
        };
      });
      setAnswers(initialAnswers);
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error(error.response?.data?.error || 'Failed to start quiz');
      onExit();
    }
  };

  const handleAnswerChange = (questionId, type, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [type]: value
      }
    }));
  };

  const handleAutoSubmit = () => {
    toast.warning('Time is up! Quiz will be submitted automatically.');
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const answersArray = Object.values(answers);
      const response = await api.put(`/quizzes/attempts/${attempt._id}/submit`, {
        answers: answersArray
      });
      
      toast.success('Quiz submitted successfully!');
      onComplete(response.data.result);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return '#e74c3c'; // Red for < 5 minutes
    if (timeRemaining < 600) return '#f39c12'; // Orange for < 10 minutes
    return '#27ae60'; // Green for > 10 minutes
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredCount = Object.values(answers).filter(answer => 
    answer.selectedOption || answer.textAnswer.trim()
  ).length;

  if (!attempt) {
    return (
      <div className="quiz-loading">
        <div className="loading-spinner"></div>
        <p>Starting quiz...</p>
      </div>
    );
  }

  if (showConfirmSubmit) {
    return (
      <div className="quiz-confirm-submit">
        <div className="confirm-dialog">
          <h2>Submit Quiz?</h2>
          <div className="confirm-stats">
            <p>Questions answered: <strong>{answeredCount} of {quiz.questions.length}</strong></p>
            <p>Time remaining: <strong style={{ color: getTimeColor() }}>{formatTime(timeRemaining)}</strong></p>
          </div>
          
          {answeredCount < quiz.questions.length && (
            <div className="warning-message">
              <AlertCircle size={20} />
              <span>You have unanswered questions. Are you sure you want to submit?</span>
            </div>
          )}
          
          <div className="confirm-actions">
            <button 
              onClick={() => setShowConfirmSubmit(false)}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Continue Quiz
            </button>
            <button 
              onClick={submitQuiz}
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-taker">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>{quiz.title}</h2>
          <div className="quiz-progress">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <div className="quiz-timer">
          <Clock size={20} />
          <span style={{ color: getTimeColor() }}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="question-container">
        <div className="question-header">
          <h3>Question {currentQuestionIndex + 1}</h3>
          <span className="question-points">
            {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="question-text">
          {currentQuestion.question}
        </div>

        {/* Answer Options */}
        <div className="answer-section">
          {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') && (
            <div className="options-list">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="option-item">
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={option.text}
                    checked={answers[currentQuestion._id]?.selectedOption === option.text}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, 'selectedOption', e.target.value)}
                  />
                  <span className="option-text">{option.text}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'short-answer' && (
            <div className="text-answer">
              <textarea
                value={answers[currentQuestion._id]?.textAnswer || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, 'textAnswer', e.target.value)}
                placeholder="Enter your answer..."
                rows="4"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <div className="nav-left">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
        </div>

        <div className="nav-center">
          <div className="question-indicators">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`question-indicator ${
                  index === currentQuestionIndex ? 'current' : ''
                } ${
                  answers[quiz.questions[index]._id]?.selectedOption || 
                  answers[quiz.questions[index]._id]?.textAnswer?.trim() 
                    ? 'answered' : 'unanswered'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="nav-right">
          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              className="btn btn-primary"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="btn btn-success"
            >
              <Send size={16} />
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      {/* Answer Summary */}
      <div className="answer-summary">
        <div className="summary-stats">
          <span className="answered">
            <CheckCircle size={16} />
            {answeredCount} Answered
          </span>
          <span className="unanswered">
            <AlertCircle size={16} />
            {quiz.questions.length - answeredCount} Remaining
          </span>
        </div>
        
        <button
          onClick={() => setShowConfirmSubmit(true)}
          className="submit-early-btn"
        >
          Submit Early
        </button>
      </div>
    </div>
  );
};

export default QuizTaker;
