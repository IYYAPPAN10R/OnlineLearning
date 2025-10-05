import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const InstructorRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/${currentUser.uid}`);
          const role = response.data.role;
          setUserRole(role);
        } catch (error) {
          console.error('Error checking user role:', error);
          setUserRole('student'); // Default to student if error
        }
      }
      setRoleLoading(false);
    };

    if (!loading) {
      checkUserRole();
    }
  }, [currentUser, loading]);

  if (loading || roleLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (userRole !== 'instructor' && userRole !== 'admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You need instructor or admin privileges to access this page.</p>
        <p>Contact an administrator to upgrade your account.</p>
      </div>
    );
  }

  return children;
};

export default InstructorRoute;
