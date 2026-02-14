import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'workouts',
      label: 'Workouts',
      path: '/workouts',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 7H4C2.89543 7 2 7.89543 2 9V15C2 16.1046 2.89543 17 4 17H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 7H20C21.1046 7 22 7.89543 22 9V15C22 16.1046 21.1046 17 20 17H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      path: '/nutrition',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C11.4477 2 11 2.44772 11 3V4H7C6.44772 4 6 4.44772 6 5V21C6 21.5523 6.44772 22 7 22H17C17.5523 22 18 21.5523 18 21V5C18 4.44772 17.5523 4 17 4H13V3C13 2.44772 12.5523 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 8H15M9 12H15M9 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'progress',
      label: 'Progress',
      path: '/progress',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16C1 15.45 1.19583 14.9792 1.5875 14.5875C1.97917 14.1958 2.45 14 3 14H3.2625C3.3375 14 3.41667 14.0167 3.5 14.05L8.05 9.5C8.01667 9.41667 8 9.3375 8 9.2625V9C8 8.45 8.19583 7.97917 8.5875 7.5875C8.97917 7.19583 9.45 7 10 7C10.55 7 11.0208 7.19583 11.4125 7.5875C11.8042 7.97917 12 8.45 12 9C12 9.03333 11.9833 9.2 11.95 9.5L14.5 12.05C14.5833 12.0167 14.6625 12 14.7375 12H15.2625C15.3375 12 15.4167 12.0167 15.5 12.05L19.05 8.5C19.0167 8.41667 19 8.3375 19 8.2625V8C19 7.45 19.1958 6.97917 19.5875 6.5875C19.9792 6.19583 20.45 6 21 6C21.55 6 22.0208 6.19583 22.4125 6.5875C22.8042 6.97917 23 7.45 23 8C23 8.55 22.8042 9.02083 22.4125 9.4125C22.0208 9.80417 21.55 10 21 10H20.7375C20.6625 10 20.5833 9.98333 20.5 9.95L16.95 13.5C16.9833 13.5833 17 13.6625 17 13.7375V14C17 14.55 16.8042 15.0208 16.4125 15.4125C16.0208 15.8042 15.55 16 15 16C14.45 16 13.9792 15.8042 13.5875 15.4125C13.1958 15.0208 13 14.55 13 14V13.7375C13 13.6625 13.0167 13.5833 13.05 13.5L10.5 10.95C10.4167 10.9833 10.3375 11 10.2625 11H10C9.96667 11 9.8 10.9833 9.5 10.95L4.95 15.5C4.98333 15.5833 5 15.6625 5 15.7375V16C5 16.55 4.80417 17.0208 4.4125 17.4125C4.02083 17.8042 3.55 18 3 18Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      id: 'schedule',
      label: 'Schedule',
      path: '/schedule',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="logo-text">Coached</h1>
          </div>

          <div className="navbar-nav">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="navbar-right">
          <div className="user-section">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="user-info">
              <p className="user-email">{user?.email || 'User'}</p>
            </div>
          </div>
          <button className="logout-button" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
