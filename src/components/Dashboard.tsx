import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout, selectedPlan } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="logo-text">Coached</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2 className="welcome-title">Welcome to Coached!</h2>
          <p className="welcome-subtitle">
            You're successfully logged in as:
          </p>
          <div className="user-info">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <p className="user-email">{user?.email}</p>
              {user?.displayName && (
                <p className="user-name">{user.displayName}</p>
              )}
              {selectedPlan && (
                <div className="user-plan">
                  <span className={`plan-badge ${selectedPlan}`}>
                    {selectedPlan === 'individual' 
                      ? 'Individual Plan' 
                      : selectedPlan === 'business'
                      ? 'Business Plan'
                      : 'Enterprise Plan'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="dashboard-message">
            <h3>Start Your Fitness Journey</h3>
            <p>
              This is your dashboard. Here you can track your progress,
              manage your workouts, and achieve your fitness goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
