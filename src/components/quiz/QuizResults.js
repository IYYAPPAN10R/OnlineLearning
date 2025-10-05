import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Target, Clock, Download, Eye, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './QuizResults.css';

const QuizResults = ({ quizId, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, percentage, timeSpent
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${quizId}/results`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast.error('Failed to fetch quiz results');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAttempts = () => {
    if (!results) return [];
    
    let filtered = results.attempts;
    
    // Apply filter
    if (filter === 'passed') {
      filtered = filtered.filter(attempt => attempt.passed);
    } else if (filter === 'failed') {
      filtered = filtered.filter(attempt => !attempt.passed);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvData = [
      ['Student Name', 'Email', 'Score (%)', 'Points Earned', 'Total Points', 'Grade', 'Status', 'Time Spent', 'Submitted At']
    ];
    
    results.attempts.forEach(attempt => {
      csvData.push([
        attempt.student.displayName || 'N/A',
        attempt.student.email,
        attempt.percentage,
        attempt.pointsEarned,
        attempt.totalPoints,
        attempt.grade,
        attempt.passed ? 'Passed' : 'Failed',
        attempt.formattedTimeSpent,
        new Date(attempt.createdAt).toLocaleString()
      ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.quiz.title}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#27ae60';
      case 'B': return '#2ecc71';
      case 'C': return '#f39c12';
      case 'D': return '#e67e22';
      case 'F': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="quiz-results-loading">
        <div className="loading-spinner"></div>
        <p>Loading quiz results...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="quiz-results-error">
        <p>Failed to load quiz results</p>
        <button onClick={fetchResults} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const attempts = filteredAndSortedAttempts();

  return (
    <div className="quiz-results">
      <div className="results-header">
        <div className="header-info">
          <h2>{results.quiz.title} - Results</h2>
          <p>Total Points: {results.quiz.totalPoints} | Passing Score: {results.quiz.passingScore}%</p>
        </div>
        <div className="header-actions">
          <button onClick={exportResults} className="btn btn-secondary">
            <Download size={16} />
            Export CSV
          </button>
          {onClose && (
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{results.statistics.totalAttempts}</h3>
            <p>Total Attempts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>{results.statistics.passRate}%</h3>
            <p>Pass Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-info">
            <h3>{Math.round(results.statistics.averageScore)}%</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{results.statistics.highestScore}%</h3>
            <p>Highest Score</p>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="results-controls">
        <div className="filters">
          <div className="filter-group">
            <label>Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Attempts</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Submission Date</option>
              <option value="percentage">Score</option>
              <option value="timeSpent">Time Spent</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="results-summary">
          Showing {attempts.length} of {results.attempts.length} attempts
        </div>
      </div>

      {/* Results Table */}
      <div className="results-table-container">
        {attempts.length === 0 ? (
          <div className="no-results">
            <p>No attempts match the current filter</p>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Time Spent</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt._id}>
                  <td>
                    <div className="student-info">
                      <strong>{attempt.student.displayName || 'N/A'}</strong>
                      <small>{attempt.student.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="score-info">
                      <strong>{attempt.percentage}%</strong>
                      <small>{attempt.pointsEarned}/{attempt.totalPoints} pts</small>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="grade-badge"
                      style={{ backgroundColor: getGradeColor(attempt.grade) }}
                    >
                      {attempt.grade}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${attempt.passed ? 'passed' : 'failed'}`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td>{attempt.formattedTimeSpent}</td>
                  <td>{new Date(attempt.createdAt).toLocaleString()}</td>
                  <td>
                    <button 
                      className="action-btn"
                      onClick={() => {/* TODO: View detailed attempt */}}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Grade Distribution */}
      <div className="grade-distribution">
        <h3>Grade Distribution</h3>
        <div className="grade-bars">
          {['A', 'B', 'C', 'D', 'F'].map(grade => {
            const count = results.attempts.filter(attempt => attempt.grade === grade).length;
            const percentage = results.attempts.length > 0 ? (count / results.attempts.length) * 100 : 0;
            
            return (
              <div key={grade} className="grade-bar">
                <div className="grade-label">{grade}</div>
                <div className="grade-progress">
                  <div 
                    className="grade-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getGradeColor(grade)
                    }}
                  ></div>
                </div>
                <div className="grade-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
