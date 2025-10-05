import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Home, User, LogOut, Settings, Users, Info, Mail, Shield, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Navigation = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    const checkUserRole = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/${currentUser.uid}`);
          setUserRole(response.data.role || 'student');
        } catch (error) {
          console.error('Error checking user role:', error);
          setUserRole('student');
        }
      }
    };

    checkUserRole();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">
          <BookOpen className="nav-logo" />
          <span>LearnHub</span>
        </Link>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>
        <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Courses</span>
        </Link>
        <Link to="/quizzes" className={`nav-link ${isActive('/quizzes') ? 'active' : ''}`}>
          <HelpCircle size={20} />
          <span>Quizzes</span>
        </Link>
        <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
          <Info size={20} />
          <span>About</span>
        </Link>
        <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
          <Mail size={20} />
          <span>Contact</span>
        </Link>
      </div>

      <div className="nav-user">
        {currentUser ? (
          <>
            {/* Admin Panel - Only for Admins */}
            {userRole === 'admin' && (
              <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <Shield size={20} />
                <span>Admin Panel</span>
              </Link>
            )}
            
            {/* Instructor Dashboard - For Instructors and Admins */}
            {(userRole === 'instructor' || userRole === 'admin') && (
              <Link to="/instructor" className={`nav-link ${location.pathname === '/instructor' ? 'active' : ''}`}>
                <Users size={20} />
                <span>Instructor</span>
              </Link>
            )}
            <Link to="/dashboard" className="nav-avatar">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
              ) : (
                <User size={24} />
              )}
              <span>{currentUser.displayName || 'Profile'}</span>
            </Link>
            <button onClick={handleLogout} className="nav-logout" title="Logout">
              <LogOut size={20} />
              <span className="logout-text">Logout</span>
            </button>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
