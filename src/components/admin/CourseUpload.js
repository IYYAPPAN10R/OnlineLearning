import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, X, Plus, FileText, Play, Volume2, Image } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CourseUpload.css';

const CourseUpload = ({ onUploadSuccess }) => {
  const { currentUser } = useAuth();
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    instructor: '',
    category: 'programming',
    level: 'beginner',
    duration: 0,
    price: 0,
    tags: []
  });
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !courseData.tags.includes(tagInput.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      // Determine file type
      let fileType = 'document';
      if (file.type.startsWith('video/')) {
        fileType = 'video';
      } else if (file.type === 'application/pdf') {
        fileType = 'pdf';
      } else if (file.type.includes('presentation') || file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        fileType = 'presentation';
      } else if (file.type.startsWith('audio/')) {
        fileType = 'audio';
      }

      // Add required fields expected by backend
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('description', `Uploaded material: ${file.name}`);
      formData.append('type', fileType);
      formData.append('courseId', 'general');

      try {
        const idToken = await currentUser.getIdToken();
        const response = await axios.post('http://localhost:5002/api/materials', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${idToken}`
          }
        });

        const newMaterial = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded material: ${file.name}`,
          filePath: response.data.material?.filePath || response.data.filePath,
          fileType: fileType,
          fileSize: file.size,
          duration: 0,
          order: materials.length
        };

        setMaterials(prev => [...prev, newMaterial]);
        toast.success(`${file.name} uploaded successfully!`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveMaterial = (index) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseData.title || !courseData.description || materials.length === 0) {
      toast.error('Please fill in all required fields and upload at least one material');
      return;
    }

    setUploading(true);
    
    try {
      const coursePayload = {
        ...courseData,
        materials: materials,
        createdBy: currentUser.uid,
        isPublished: true
      };

      const idToken = await currentUser.getIdToken();
      const response = await axios.post('http://localhost:5002/api/courses', coursePayload, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      toast.success('Course created successfully!');
      
      // Reset form
      setCourseData({
        title: '',
        description: '',
        shortDescription: '',
        instructor: '',
        category: 'programming',
        level: 'beginner',
        duration: 0,
        price: 0,
        tags: []
      });
      setMaterials([]);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setUploading(false);
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'video': return <Play size={16} />;
      case 'pdf': return <FileText size={16} />;
      case 'document': return <FileText size={16} />;
      case 'presentation': return <FileText size={16} />;
      case 'audio': return <Volume2 size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="course-upload">
      <h2>Create New Course</h2>
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-section">
          <h3>Course Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={courseData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter course title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="instructor">Instructor *</label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={courseData.instructor}
                onChange={handleInputChange}
                required
                placeholder="Enter instructor name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={courseData.category}
                onChange={handleInputChange}
                required
              >
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="data-science">Data Science</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="level">Level *</label>
              <select
                id="level"
                name="level"
                value={courseData.level}
                onChange={handleInputChange}
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (hours) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleInputChange}
                required
                min="0"
                step="0.5"
                placeholder="Enter duration in hours"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={courseData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Enter price (0 for free)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="shortDescription">Short Description</label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              value={courseData.shortDescription}
              onChange={handleInputChange}
              placeholder="Brief description for course cards"
              maxLength="300"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Full Description *</label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Detailed course description"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tags (press Enter to add)"
              />
              <button type="button" onClick={handleAddTag} className="add-tag-btn">
                <Plus size={16} />
              </button>
            </div>
            <div className="tags-list">
              {courseData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Course Materials</h3>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.mp4,.mp3,.doc,.docx,.ppt,.pptx,.txt"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="file-upload-label">
              <Upload size={24} />
              <span>Upload Materials (PDF, Video, Audio, Documents)</span>
              <small>Click to select files or drag and drop</small>
            </label>
          </div>

          {materials.length > 0 && (
            <div className="materials-list">
              <h4>Uploaded Materials ({materials.length})</h4>
              {materials.map((material, index) => (
                <div key={index} className="material-item">
                  <div className="material-info">
                    {getFileTypeIcon(material.fileType)}
                    <div>
                      <span className="material-title">{material.title}</span>
                      <span className="material-meta">
                        {material.fileType} • {formatFileSize(material.fileSize)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(index)}
                    className="remove-material"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={uploading || materials.length === 0}
            className="submit-btn"
          >
            {uploading ? 'Creating Course...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseUpload;
