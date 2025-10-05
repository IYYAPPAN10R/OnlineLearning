import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Tabs, Tab, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';
import UserManagement from './UserManagement';
import FileUpload from './FileUpload';
import CourseUpload from './CourseUpload';
import './AdminPanel.css';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#e74c3c';
      case 'instructor': return '#f39c12';
      case 'student': 
      default: 
        return '#3498db';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5002/api/users', {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      toast.error('Failed to load materials');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchMaterials();
  }, [fetchUsers, fetchMaterials]);

  const handleUploadSuccess = () => {
    fetchMaterials();
    toast.success('File uploaded successfully!');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      
      {error && (
        <div className="error-message">
          <span>⚠</span> {error}
        </div>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="admin tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="User Management" />
          <Tab label="Upload Materials" />
          <Tab label="Create Course" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <div className="tab-content">
        {tabValue === 0 && <UserManagement users={users} />}
        {tabValue === 1 && (
          <div className="file-upload-section">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            
            {materials.length > 0 && (
              <div className="uploaded-materials">
                <h3>Recently Uploaded</h3>
                <div className="materials-grid">
                  {materials.slice(0, 3).map((material) => (
                    <div key={material._id} className="material-card">
                      <div className="material-icon">
                        {material.fileType === 'video' ? '🎥' : '📄'}
                      </div>
                      <div className="material-content">
                        <h4>{material.title}</h4>
                        <p className="material-description">{material.description}</p>
                        <div className="material-meta">
                          <span className="type">{material.fileType}</span>
                          <span className="date">
                            {new Date(material.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="view-all-container">
                  <Link to="/courses" className="view-all-btn">
                    View All Materials
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
        {tabValue === 2 && (
          <CourseUpload onUploadSuccess={fetchMaterials} />
        )}
        {tabValue === 3 && (
          <div className="analytics-tab">
            <h2>Analytics Dashboard</h2>
            <p>Analytics features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;