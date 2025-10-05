import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload, BookOpen, FileText, Users, BarChart3, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import FileUpload from '../components/admin/FileUpload';
import CourseUpload from '../components/admin/CourseUpload';
import QuizCreator from '../components/quiz/QuizCreator';
import QuizResults from '../components/quiz/QuizResults';
import api from '../services/api';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalMaterials: 0,
    totalStudents: 0,
    totalQuizzes: 0
  });
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchInstructorStats();
    }
  }, [currentUser]);

  const fetchInstructorStats = async () => {
    try {
      // Fetch instructor's quizzes
      await fetchInstructorQuizzes();
      
      // TODO: Implement API calls for other stats when endpoints are available
      setStats({
        totalCourses: 0, // Will be updated when course API is integrated
        totalMaterials: 0, // Will be updated when material API is integrated  
        totalStudents: 0, // Will be updated when enrollment API is integrated
        totalQuizzes: myQuizzes.length
      });
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
    }
  };

  const fetchInstructorQuizzes = async () => {
    try {
      if (!currentUser) return;
      
      setLoading(true);
      
      // Get current user data to get their ObjectId
      const userResponse = await api.get(`/users/${currentUser.uid}`);
      const userId = userResponse.data._id;
      
      // Fetch quizzes created by this instructor
      const quizzesResponse = await api.get(`/quizzes?createdBy=${userId}`);
      const quizzes = quizzesResponse.data.quizzes || [];
      
      // For each quiz, we'll calculate stats from the quiz data itself
      const quizzesWithStats = quizzes.map(quiz => ({
        _id: quiz._id,
        title: quiz.title,
        totalAttempts: quiz.totalAttempts || 0,
        averageScore: Math.round(quiz.averageScore || 0),
        isPublished: quiz.isPublished,
        createdAt: quiz.createdAt
      }));
      
      setMyQuizzes(quizzesWithStats);
      
      // Update quiz count in stats
      setStats(prev => ({
        ...prev,
        totalQuizzes: quizzesWithStats.length
      }));
      
    } catch (error) {
      console.error('Error fetching instructor quizzes:', error);
      setMyQuizzes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const publishQuiz = async (quizId) => {
    try {
      setLoading(true);
      await api.put(`/quizzes/${quizId}`, { isPublished: true });
      
      // Update the quiz in the local state
      setMyQuizzes(prev => prev.map(quiz => 
        quiz._id === quizId ? { ...quiz, isPublished: true } : quiz
      ));
      
      toast.success('Quiz published successfully! Students can now see it.');
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast.error(error.response?.data?.error || 'Failed to publish quiz');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'upload-material', label: 'Upload Material', icon: Upload },
    { id: 'create-course', label: 'Create Course', icon: BookOpen },
    { id: 'create-quiz', label: 'Create Quiz', icon: HelpCircle },
    { id: 'quiz-results', label: 'Quiz Results', icon: Users },
    { id: 'my-content', label: 'My Content', icon: FileText }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="instructor-overview">
            <h2>Instructor Dashboard</h2>
            <p>Welcome back, {currentUser?.displayName}! Here's your teaching overview.</p>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalCourses}</h3>
                  <p>Courses Created</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalMaterials}</h3>
                  <p>Materials Uploaded</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalStudents}</h3>
                  <p>Students Enrolled</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <HelpCircle size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalQuizzes}</h3>
                  <p>Quizzes Created</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {myQuizzes.length > 0 ? (
                  myQuizzes.slice(0, 3).map((quiz, index) => (
                    <div key={quiz._id} className="activity-item">
                      <HelpCircle size={16} />
                      <span>Created quiz "{quiz.title}"</span>
                      <span className="activity-time">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="activity-item">
                    <FileText size={16} />
                    <span>Welcome to your instructor dashboard!</span>
                    <span className="activity-time">Start by creating your first quiz</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'upload-material':
        return (
          <div className="upload-section">
            <FileUpload onUploadSuccess={() => {
              // Refresh stats or show success message
              fetchInstructorStats();
            }} />
          </div>
        );
      
      case 'create-course':
        return (
          <div className="course-section">
            <CourseUpload onUploadSuccess={() => {
              // Refresh stats or show success message
              fetchInstructorStats();
            }} />
          </div>
        );
      
      case 'create-quiz':
        return (
          <div className="quiz-section">
            <QuizCreator onQuizCreated={() => {
              // Refresh quiz data after creating a new quiz
              fetchInstructorQuizzes();
            }} />
          </div>
        );
      
      case 'quiz-results':
        return (
          <div className="quiz-results-section">
            {selectedQuizId ? (
              <QuizResults 
                quizId={selectedQuizId} 
                onClose={() => setSelectedQuizId(null)}
              />
            ) : (
              <div className="quiz-list">
                <h2>Quiz Results</h2>
                <p>Select a quiz to view detailed results and analytics.</p>
                
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your quizzes...</p>
                  </div>
                ) : (
                  <>
                    <div className="quiz-grid">
                      {myQuizzes.map((quiz) => (
                        <div key={quiz._id} className="quiz-card">
                          <h3>{quiz.title}</h3>
                          <div className="quiz-stats">
                            <span>Attempts: {quiz.totalAttempts}</span>
                            <span>Avg Score: {quiz.averageScore}%</span>
                          </div>
                          <div className="quiz-meta">
                            <span>Status: {quiz.isPublished ? 'Published' : 'Draft'}</span>
                            <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="quiz-actions">
                            {!quiz.isPublished && (
                              <button 
                                onClick={() => publishQuiz(quiz._id)}
                                className="btn btn-success"
                                style={{ marginRight: '10px' }}
                              >
                                Publish Quiz
                              </button>
                            )}
                            <button 
                              onClick={() => setSelectedQuizId(quiz._id)}
                              className="btn btn-primary"
                            >
                              View Results
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {myQuizzes.length === 0 && (
                      <div className="no-quizzes">
                        <HelpCircle size={48} />
                        <h3>No quizzes created yet</h3>
                        <p>Create your first quiz to see results here.</p>
                        <button 
                          onClick={() => setActiveTab('create-quiz')}
                          className="btn btn-primary"
                        >
                          Create Your First Quiz
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      
      case 'my-content':
        return (
          <div className="content-section">
            <h2>My Content</h2>
            <p>View and manage your courses and materials here.</p>
            {/* TODO: Add content management interface */}
            <div className="content-placeholder">
              <FileText size={48} />
              <p>Content management interface coming soon...</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <h1>Instructor Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.displayName}</span>
          <span className="role-badge instructor">Instructor</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default InstructorDashboard;
