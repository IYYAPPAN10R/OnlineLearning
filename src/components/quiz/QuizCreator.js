import React, { useState } from 'react';
import { Plus, Trash2, Save, Eye, Clock, Users, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './QuizCreator.css';

const QuizCreator = ({ onQuizCreated }) => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    courseId: 'general',
    timeLimit: 30,
    maxAttempts: 3,
    passingScore: 60,
    showResults: true,
    showCorrectAnswers: true,
    randomizeQuestions: false,
    isPublished: false
  });

  const [questions, setQuestions] = useState([{
    question: '',
    type: 'multiple-choice',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    points: 1,
    explanation: ''
  }]);

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleQuizChange = (field, value) => {
    setQuiz(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions(prev => prev.map((q, index) => 
      index === questionIndex ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setQuestions(prev => prev.map((q, qIndex) => {
      if (qIndex !== questionIndex) return q;
      
      const newOptions = q.options.map((opt, oIndex) => {
        if (oIndex !== optionIndex) {
          return field === 'isCorrect' && value ? { ...opt, isCorrect: false } : opt;
        }
        return { ...opt, [field]: value };
      });
      
      return { ...q, options: newOptions };
    }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question: '',
      type: 'multiple-choice',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      points: 1,
      explanation: ''
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addOption = (questionIndex) => {
    setQuestions(prev => prev.map((q, index) => 
      index === questionIndex 
        ? { ...q, options: [...q.options, { text: '', isCorrect: false }] }
        : q
    ));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions(prev => prev.map((q, qIndex) => {
      if (qIndex !== questionIndex) return q;
      if (q.options.length <= 2) return q; // Minimum 2 options
      
      return {
        ...q,
        options: q.options.filter((_, oIndex) => oIndex !== optionIndex)
      };
    }));
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }

    if (!quiz.description.trim()) {
      toast.error('Quiz description is required');
      return false;
    }

    if (questions.length === 0) {
      toast.error('Quiz must have at least one question');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        const hasCorrectAnswer = q.options.some(opt => opt.isCorrect && opt.text.trim());
        if (!hasCorrectAnswer) {
          toast.error(`Question ${i + 1} must have a correct answer selected`);
          return false;
        }

        const hasEmptyOptions = q.options.some(opt => !opt.text.trim());
        if (hasEmptyOptions) {
          toast.error(`Question ${i + 1} has empty options`);
          return false;
        }
      }

      if (q.type === 'short-answer' && !q.correctAnswer.trim()) {
        toast.error(`Question ${i + 1} must have a correct answer`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (publishNow = false) => {
    if (!validateQuiz()) return;

    setLoading(true);
    try {
      const quizData = {
        ...quiz,
        questions,
        isPublished: publishNow
      };

      const response = await api.post('/quizzes', quizData);
      
      toast.success(`Quiz ${publishNow ? 'created and published' : 'saved as draft'} successfully!`);
      
      if (onQuizCreated) {
        onQuizCreated(response.data.quiz);
      }

      // Reset form
      setQuiz({
        title: '',
        description: '',
        courseId: 'general',
        timeLimit: 30,
        maxAttempts: 3,
        passingScore: 60,
        showResults: true,
        showCorrectAnswers: true,
        randomizeQuestions: false,
        isPublished: false
      });
      
      setQuestions([{
        question: '',
        type: 'multiple-choice',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        correctAnswer: '',
        points: 1,
        explanation: ''
      }]);

    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error(error.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question, questionIndex) => (
    <div key={questionIndex} className="question-editor">
      <div className="question-header">
        <h4>Question {questionIndex + 1}</h4>
        <button
          type="button"
          onClick={() => removeQuestion(questionIndex)}
          className="remove-question-btn"
          disabled={questions.length === 1}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="question-content">
        <div className="form-group">
          <label>Question Text</label>
          <textarea
            value={question.question}
            onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
            placeholder="Enter your question..."
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Question Type</label>
            <select
              value={question.type}
              onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Points</label>
            <input
              type="number"
              value={question.points}
              onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value) || 1)}
              min="1"
              max="10"
            />
          </div>
        </div>

        {/* Options for multiple choice and true/false */}
        {(question.type === 'multiple-choice' || question.type === 'true-false') && (
          <div className="options-section">
            <label>Answer Options</label>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-editor">
                <input
                  type="radio"
                  name={`correct-${questionIndex}`}
                  checked={option.isCorrect}
                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="option-text"
                />
                {question.type === 'multiple-choice' && question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(questionIndex, optionIndex)}
                    className="remove-option-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            
            {question.type === 'multiple-choice' && question.options.length < 6 && (
              <button
                type="button"
                onClick={() => addOption(questionIndex)}
                className="add-option-btn"
              >
                <Plus size={16} />
                Add Option
              </button>
            )}
          </div>
        )}

        {/* Correct answer for short answer */}
        {question.type === 'short-answer' && (
          <div className="form-group">
            <label>Correct Answer</label>
            <input
              type="text"
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
              placeholder="Enter the correct answer..."
            />
          </div>
        )}

        <div className="form-group">
          <label>Explanation (Optional)</label>
          <textarea
            value={question.explanation}
            onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
            placeholder="Explain why this is the correct answer..."
            rows="2"
          />
        </div>
      </div>
    </div>
  );

  if (previewMode) {
    return (
      <div className="quiz-preview">
        <div className="preview-header">
          <h2>{quiz.title}</h2>
          <button onClick={() => setPreviewMode(false)} className="btn btn-secondary">
            Back to Edit
          </button>
        </div>
        <p>{quiz.description}</p>
        <div className="quiz-info">
          <span><Clock size={16} /> {quiz.timeLimit} minutes</span>
          <span><Users size={16} /> {quiz.maxAttempts} attempt(s)</span>
          <span><Target size={16} /> {quiz.passingScore}% to pass</span>
        </div>
        
        {questions.map((question, index) => (
          <div key={index} className="preview-question">
            <h4>Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})</h4>
            <p>{question.question}</p>
            
            {(question.type === 'multiple-choice' || question.type === 'true-false') && (
              <div className="preview-options">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className={`preview-option ${option.isCorrect ? 'correct' : ''}`}>
                    <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                    {option.text}
                  </div>
                ))}
              </div>
            )}
            
            {question.type === 'short-answer' && (
              <div className="preview-answer">
                <strong>Expected Answer:</strong> {question.correctAnswer}
              </div>
            )}
            
            {question.explanation && (
              <div className="preview-explanation">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="quiz-creator">
      <div className="creator-header">
        <h2>Create New Quiz</h2>
        <div className="header-actions">
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="btn btn-secondary"
          >
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Quiz Basic Info */}
        <div className="quiz-info-section">
          <h3>Quiz Information</h3>
          
          <div className="form-group">
            <label>Quiz Title</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => handleQuizChange('title', e.target.value)}
              placeholder="Enter quiz title..."
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => handleQuizChange('description', e.target.value)}
              placeholder="Describe what this quiz covers..."
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Course ID</label>
              <input
                type="text"
                value={quiz.courseId}
                onChange={(e) => handleQuizChange('courseId', e.target.value)}
                placeholder="general"
              />
            </div>
            
            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                value={quiz.timeLimit}
                onChange={(e) => handleQuizChange('timeLimit', parseInt(e.target.value) || 30)}
                min="5"
                max="180"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Max Attempts</label>
              <input
                type="number"
                value={quiz.maxAttempts}
                onChange={(e) => handleQuizChange('maxAttempts', parseInt(e.target.value) || 1)}
                min="1"
                max="5"
              />
            </div>
            
            <div className="form-group">
              <label>Passing Score (%)</label>
              <input
                type="number"
                value={quiz.passingScore}
                onChange={(e) => handleQuizChange('passingScore', parseInt(e.target.value) || 60)}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quiz.showResults}
                  onChange={(e) => handleQuizChange('showResults', e.target.checked)}
                />
                Show results to students
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quiz.showCorrectAnswers}
                  onChange={(e) => handleQuizChange('showCorrectAnswers', e.target.checked)}
                />
                Show correct answers after submission
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={quiz.randomizeQuestions}
                  onChange={(e) => handleQuizChange('randomizeQuestions', e.target.checked)}
                />
                Randomize question order
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="questions-section">
          <div className="section-header">
            <h3>Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="add-question-btn"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>

          {questions.map((question, index) => renderQuestion(question, index))}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="btn btn-secondary"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="btn btn-primary"
          >
            <Save size={16} />
            {loading ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreator;
