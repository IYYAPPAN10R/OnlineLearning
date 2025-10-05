import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';
import { BookOpen, Clock, Star, Users, Play, FileText, Download, Eye } from 'lucide-react';
import './Pages.css';
import api from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting data fetch...');
        
        // Test API connection first
        try {
          const healthCheck = await fetch('http://localhost:5002/api/health');
          console.log('Health check status:', healthCheck.status);
          const healthData = await healthCheck.json();
          console.log('Health check data:', healthData);
        } catch (healthErr) {
          console.error('Health check failed:', healthErr);
          throw new Error(`Cannot connect to the server: ${healthErr.message}`);
        }
        
        // Get current user token for debugging
        const auth = getAuth();
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : 'No user logged in';
        console.log('Current user token:', token ? 'Token exists' : 'No token');
        
        // Make API requests
        console.log('Fetching courses and materials...');
        const [coursesResponse, materialsResponse] = await Promise.all([
          api.get('/courses')
            .then(res => {
              console.log('Courses API response:', res);
              return res;
            })
            .catch(err => {
              console.error('Courses API Error:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
              });
              throw err;
            }),
          
          api.get('/materials')
            .then(res => {
              console.log('Materials API response:', res);
              return res;
            })
            .catch(err => {
              console.error('Materials API Error:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
              });
              throw err;
            })
        ]);

        console.log('Courses data:', coursesResponse.data);
        console.log('Materials data:', materialsResponse.data);
        
        if (!Array.isArray(coursesResponse?.data)) {
          console.warn('Courses data is not an array:', coursesResponse?.data);
          setCourses([]);
        } else {
          setCourses(coursesResponse.data);
        }
        
        if (!Array.isArray(materialsResponse?.data)) {
          console.warn('Materials data is not an array:', materialsResponse?.data);
          setMaterials([]);
        } else {
          setMaterials(materialsResponse.data);
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message;
        console.error('Error in fetchData:', {
          name: err.name,
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
        
        setError(`Failed to load data: ${errorMessage}. Please check your connection and try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up Courses component');
    };
  }, []);

  // Filter courses based on search and filters
 // Add error handling for empty or undefined data
  const filteredCourses = (courses || []).filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Play size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'document': return <FileText size={16} />;
      case 'presentation': return <FileText size={16} />;
      case 'audio': return <Play size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'programming': return '#3b82f6';
      case 'design': return '#8b5cf6';
      case 'business': return '#10b981';
      case 'marketing': return '#f59e0b';
      case 'data-science': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚠</span>
            <h3>Something went wrong</h3>
          </div>
          <p>{error}</p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ↻ Try Again
            </button>
            <button 
              onClick={() => setError(null)} 
              className="dismiss-button"
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Dismiss
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
              <summary>Debug Information</summary>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px', 
                marginTop: '10px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Explore Our Learning Platform</h1>
          <p>Discover courses and study materials to enhance your skills</p>
          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="admin-link">
              Go to Admin Panel to Manage Content
            </Link>
          )}
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={20} />
          Courses ({courses.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <FileText size={20} />
          Materials ({materials.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses and materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {activeTab === 'courses' && (
          <div className="filters">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="data-science">Data Science</option>
              <option value="other">Other</option>
            </select>
            
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        )}
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <section className="courses-section">
          {filteredCourses.length === 0 ? (
            <div className="no-materials">
              <p>No courses found matching your criteria.</p>
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="upload-btn">
                  Create New Course
                </Link>
              )}
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-header">
                    <div className="course-badges">
                      <span 
                        className="level-badge"
                        style={{ backgroundColor: getLevelBadgeColor(course.level) }}
                      >
                        {course.level}
                      </span>
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(course.category) }}
                      >
                        {course.category}
                      </span>
                    </div>
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.shortDescription || course.description}</p>
                  </div>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{course.duration}h</span>
                    </div>
                    <div className="meta-item">
                      <Users size={16} />
                      <span>{course.enrollmentCount || 0} enrolled</span>
                    </div>
                    <div className="meta-item">
                      <Star size={16} />
                      <span>{course.averageRating || 0} ({course.totalRatings || 0})</span>
                    </div>
                  </div>

                  <div className="course-materials">
                    <h4>Course Content:</h4>
                    <div className="materials-list">
                      {course.materials.slice(0, 3).map((material, index) => (
                        <div key={index} className="material-item">
                          {getFileTypeIcon(material.fileType)}
                          <span>{material.title}</span>
                        </div>
                      ))}
                      {course.materials.length > 3 && (
                        <div className="material-item more">
                          +{course.materials.length - 3} more materials
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="course-footer">
                    <div className="course-price">
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </div>
                    <button className="enroll-btn">
                      {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <section className="materials-section">
          {materials.length === 0 ? (
            <div className="no-materials">
              <p>No learning materials available yet. Please check back later.</p>
              {currentUser?.role === 'admin' && (
                <Link to="/admin" className="upload-btn">
                  Upload Materials
                </Link>
              )}
            </div>
          ) : (
            <div className="materials-grid">
              {materials.map((material) => (
                <div key={material._id} className="material-card">
                  <div className="material-icon">
                    {getFileTypeIcon(material.fileType)}
                  </div>
                  <div className="material-content">
                    <h3>{material.title}</h3>
                    <p className="material-description">{material.description}</p>
                    <div className="material-meta">
                      <span className="type">Type: {material.fileType}</span>
                      <span className="date">
                        Uploaded: {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="material-actions">
                      <a 
                        href={`http://localhost:5002/${material.filePath}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        <Eye size={16} />
                        View
                      </a>
                      <a 
                        href={`http://localhost:5002/${material.filePath}`} 
                        download
                        className="download-btn"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Courses;
