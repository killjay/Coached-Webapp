import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './navigation/Navbar';
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
    <>
      <Navbar />
      <div className="dashboard-container">
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
    </>
  );
};

export default Dashboard;
