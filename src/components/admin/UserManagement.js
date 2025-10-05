import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, RefreshCw, Activity } from 'lucide-react';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all | active | inactive
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/users-stats');
      setStats(response.data);
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = useMemo(() => {
    if (filter === 'active') return users.filter(u => u.isActive);
    if (filter === 'inactive') return users.filter(u => !u.isActive);
    return users;
  }, [users, filter]);

  const updateUserRole = async (uid, newRole) => {
    try {
      const handleRoleChange = async (userId, newRole) => {
        try {
          await api.put(`/users/${userId}/role`, { role: newRole });
        } catch (error) {
          console.error('Error updating user role:', error);
        }
      };
      await handleRoleChange(uid, newRole);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#e74c3c';
      case 'instructor': return '#f39c12';
      case 'student': return '#3498db';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <RefreshCw className="spinner" size={32} />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <button onClick={fetchUsers} className="refresh-button">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>
      
      <div className="users-table-container">
        {stats && (
          <div className="user-stats" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <span><strong>Total:</strong> {stats.totalUsers}</span>
            <span><strong>Active:</strong> {stats.activeUsers}</span>
            <span><strong>Inactive:</strong> {stats.inactiveUsers}</span>
            <span><strong>Logins (5m):</strong> {stats.loginsLast5Min}</span>
          </div>
        )}

        <div className="filters" style={{ marginBottom: '12px' }}>
          <label>Filter: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>{user.displayName || 'N/A'}</td>
                <td>{user.email}</td>
                <td>
                  <span 
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                </td>
                <td className="actions">
                  <select 
                    value={user.role}
                    onChange={(e) => updateUserRole(user.uid, e.target.value)}
                    className="role-select"
                    title="Change user role (Admin only)"
                  >
                    <option value="student">Student (Default)</option>
                    <option value="instructor">Instructor (Can upload materials & create courses)</option>
                    <option value="admin">Admin (Full access)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
