import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Tabs, Tab, Box } from '@mui/material';
import UserManagement from './UserManagement';
import FileUpload from './FileUpload';
import './AdminPanel.css';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>
      
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
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <div className="tab-content">
        {tabValue === 0 && <UserManagement />}
        {tabValue === 1 && <FileUpload />}
        {tabValue === 2 && (
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
