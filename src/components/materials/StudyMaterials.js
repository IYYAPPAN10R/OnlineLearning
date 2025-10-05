import React, { useState, useEffect } from 'react';
import { Video, FileText, Search, Download, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    courseId: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, [filters]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials', { params: filters });
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load study materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredMaterials = materials.filter(material => 
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (materialId, filename) => {
    try {
      const response = await axios.get(`http://localhost:5002/api/materials/download/${materialId}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={32} />
        <p>Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="study-materials-container">
      <div className="materials-header">
        <h2>Study Materials</h2>
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Type:</label>
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="pdf">PDFs</option>
            <option value="document">Documents</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Course:</label>
          <input
            type="text"
            name="courseId"
            value={filters.courseId}
            onChange={handleFilterChange}
            placeholder="Filter by course ID"
          />
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="empty-state">
          <p>No study materials found.</p>
        </div>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map((material) => (
            <div key={material._id} className="material-card">
              <div className="material-icon">
                {material.type === 'video' ? <Video size={32} /> : <FileText size={32} />}
              </div>
              <div className="material-details">
                <h3>{material.title}</h3>
                <p className="material-description">{material.description}</p>
                <div className="material-meta">
                  <span className="material-type">{material.type.toUpperCase()}</span>
                  <span className="material-course">Course: {material.courseId}</span>
                  <span className="material-size">{formatFileSize(material.size)}</span>
                </div>
              </div>
              <div className="material-actions">
                {material.type === 'video' ? (
                  <button 
                    className="view-button"
                    onClick={() => window.open(`/materials/view/${material._id}`, '_blank')}
                  >
                    Watch
                  </button>
                ) : (
                  <button 
                    className="download-button"
                    onClick={() => handleDownload(material._id, material.filename)}
                  >
                    <Download size={16} />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
