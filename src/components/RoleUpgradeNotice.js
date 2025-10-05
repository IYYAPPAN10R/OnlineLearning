import React from 'react';
import { Shield, BookOpen, Upload } from 'lucide-react';
import './RoleUpgradeNotice.css';

const RoleUpgradeNotice = ({ userRole }) => {
  if (userRole === 'admin' || userRole === 'instructor') {
    return null; // Don't show notice for admins or instructors
  }

  return (
    <div className="role-upgrade-notice">
      <div className="notice-content">
        <div className="notice-icon">
          <Shield size={24} />
        </div>
        <div className="notice-text">
          <h3>Want to become an Instructor?</h3>
          <p>
            As an instructor, you can upload materials, create courses, and share your knowledge with students.
            Contact an administrator to upgrade your account.
          </p>
        </div>
        <div className="notice-features">
          <div className="feature">
            <Upload size={16} />
            <span>Upload Materials</span>
          </div>
          <div className="feature">
            <BookOpen size={16} />
            <span>Create Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleUpgradeNotice;
