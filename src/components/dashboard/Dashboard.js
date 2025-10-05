import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Award, Clock, Star, RefreshCw, TrendingUp, Users } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardSkeleton from './DashboardSkeleton';
import RoleUpgradeNotice from '../RoleUpgradeNotice';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState('student');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${currentUser.uid}`);
      const userData = response.data;
      setUserRole(userData.role || 'student');
      setIsAdmin(userData.role === 'admin');
      
      // Show success message if this was a manual refresh
      if (!loading) {
        toast.success('Dashboard refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
  
  const handleRefresh = () => {
    fetchUserData();
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const courses = [
    {
      id: 1,
      title: 'React Fundamentals',
      progress: 75,
      duration: '8 hours',
      instructor: 'John Doe',
      rating: 4.8
    },
    {
      id: 2,
      title: 'JavaScript Advanced',
      progress: 45,
      duration: '12 hours',
      instructor: 'Jane Smith',
      rating: 4.9
    },
    {
      id: 3,
      title: 'Node.js Backend',
      progress: 20,
      duration: '15 hours',
      instructor: 'Mike Johnson',
      rating: 4.7
    }
  ];

  const stats = [
    { icon: BookOpen, label: 'Courses Enrolled', value: '12' },
    { icon: Award, label: 'Certificates', value: '5' },
    { icon: Clock, label: 'Hours Learned', value: '48' },
    { icon: TrendingUp, label: 'Progress', value: '68%' }
  ];

  if (error && !loading) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="refresh-btn">
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-message">
            <div className="welcome-header">
              <h1>Welcome back, {currentUser?.displayName || 'Student'}!</h1>
              <button 
                onClick={handleRefresh} 
                className="refresh-btn"
                disabled={loading}
                title="Refresh dashboard"
              >
                <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              </button>
            </div>
            <p>Here's your learning dashboard</p>
            {userRole && (
              <span className={`role-badge role-${userRole}`}>
                {userRole.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Role Upgrade Notice for Students */}
        <RoleUpgradeNotice userRole={userRole} />
        
        <section className="stats-section">
          <h2>Your Learning Stats</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <stat.icon size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="courses-section">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <button className="view-all-btn">View All Courses</button>
          </div>
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <h3>{course.title}</h3>
                  <div className="course-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{course.rating}</span>
                  </div>
                </div>
                <div className="course-meta">
                  <span className="instructor">by {course.instructor}</span>
                  <span className="duration">
                    <Clock size={14} />
                    {course.duration}
                  </span>
                </div>
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress}% complete</span>
                </div>
                <button className="continue-btn">Continue Learning</button>
              </div>
            ))}
          </div>
        </section>

        <section className="recommendations-section">
          <h2>Recommended for You</h2>
          <div className="recommendation-cards">
            <div className="recommendation-card">
              <BookOpen size={32} />
              <h3>MongoDB Basics</h3>
              <p>Learn database fundamentals with hands-on projects</p>
              <button className="enroll-btn">Enroll Now</button>
            </div>
            <div className="recommendation-card">
              <Users size={32} />
              <h3>Team Collaboration</h3>
              <p>Master Git and collaborative development workflows</p>
              <button className="enroll-btn">Enroll Now</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
