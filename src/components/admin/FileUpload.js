import React, { useState } from 'react';
import { Upload, Video, FileText, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const FileUpload = ({ onUploadSuccess }) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    courseId: ''
  });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setFiles([{
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type.split('/')[0],
        status: 'pending'
      }]);
    }
  };

  const removeFile = () => {
    setFiles([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to upload files');
      return;
    }

    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', files[0].file);
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const token = await currentUser.getIdToken();
      
      const response = await axios.post('http://localhost:5002/api/materials', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('File uploaded successfully!');
      setFiles([]);
      setFormData({
        title: '',
        description: '',
        type: 'video',
        courseId: ''
      });
      
      // Notify parent component about successful upload
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error.response?.data?.message || 'Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Study Material</h2>
      <p className="upload-hint">
        Supported formats: PDF, DOCX, PPTX, MP4, WEBM, MOV (Max 500MB)
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter material title"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Enter material description"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>File Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="document">Document</option>
              <option value="presentation">Presentation</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Course ID</label>
            <input
              type="text"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
              placeholder="Enter course ID"
            />
          </div>
        </div>

        <div className="file-upload-area">
          <div className="file-drop-area">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="file-input"
              disabled={uploading}
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,video/mp4,video/webm,video/quicktime,application/zip,application/x-rar-compressed,application/x-7z-compressed"
            />
            <label htmlFor="file-upload" className="file-label">
              <Upload size={24} />
              <span>Choose a file or drag it here</span>
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="file-preview">
            <h4>Selected Files ({files.length})</h4>
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">
                    {file.type === 'video' ? <Video /> : <FileText />}
                  </div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{file.size}</span>
                  </div>
                  <button 
                    type="button" 
                    className="remove-file"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="upload-button"
          disabled={files.length === 0 || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Materials'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
