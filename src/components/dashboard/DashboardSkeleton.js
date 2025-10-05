import React from 'react';
import './DashboardSkeleton.css';

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
        <div className="skeleton-badge"></div>
      </div>
      
      <div className="skeleton-stats">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="skeleton-stat">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="skeleton-section">
        <div className="skeleton-section-header">
          <div className="skeleton-line title"></div>
          <div className="skeleton-button"></div>
        </div>
        <div className="skeleton-courses">
          {[1, 2, 3].map((item) => (
            <div key={item} className="skeleton-course">
              <div className="skeleton-course-header">
                <div className="skeleton-line"></div>
                <div className="skeleton-rating"></div>
              </div>
              <div className="skeleton-meta">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line short"></div>
              </div>
              <div className="skeleton-progress"></div>
              <div className="skeleton-button"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
