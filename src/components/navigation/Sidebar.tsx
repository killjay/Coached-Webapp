import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: boolean;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useAdminNotifications();

  const navItems: NavItem[] = [
    {
      id: 'revenue',
      label: 'Revenue Dashboard',
      path: '/enterprise/revenue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'client-onboard',
      label: 'Client Onboard',
      path: '/enterprise/client-onboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'pending-clients',
      label: 'Pending Clients',
      path: '/enterprise/pending-clients',
      badge: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'coach-onboard',
      label: 'Coach Onboard',
      path: '/enterprise/coach-onboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 11L20 14L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'clients',
      label: 'Client List',
      path: '/enterprise/clients',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'coaches',
      label: 'Coach List',
      path: '/enterprise/coaches',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 21V19C3 17.9391 3.42143 16.9217 4.17157 16.1716C4.92172 15.4214 5.93913 15 7 15H11C12.0609 15 13.0783 15.4214 13.8284 16.1716C14.5786 16.9217 15 17.9391 15 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 11H22M19 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'templates',
      label: 'Create Template',
      path: '/enterprise/templates',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18V12M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      path: '/enterprise/calendar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'roles',
      label: 'Roles Management',
      path: '/enterprise/roles',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Debug: Log user data to check photoURL
  React.useEffect(() => {
    if (user) {
      console.log('User data:', {
        email: user.email,
        photoURL: user.photoURL,
        displayName: user.displayName,
        providerId: user.providerId,
        providerData: user.providerData
      });
    }
  }, [user]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && <div className="mobile-overlay" onClick={toggleMobileMenu} />}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <svg width="40" height="40" viewBox="0 0 35 37" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
              <path d="M6.23994 3.432V1.56H9.35994V-5.48363e-06H11.5439V1.872H10.9199V0.623996H9.98394V2.18399H6.86394V3.432H6.23994ZM9.35994 8.42399V6.552H9.98394V7.8H10.9199V6.23999H12.4799V-5.48363e-06H16.2239V5.30399H14.3519V4.68H15.5999V0.623996H13.1039V6.864H11.5439V8.42399H9.35994ZM21.8399 5.30399V3.744H17.1599V-5.48363e-06H19.3439V1.56H20.2799V-5.48363e-06H23.7119V0.623996H20.9039V2.18399H18.7199V0.623996H17.7839V3.11999H22.4639V4.68H26.5199V3.744H23.3999V2.18399H22.1519V1.56H24.0239V3.11999H27.1439V5.30399H21.8399ZM29.6399 4.992V3.744H28.0799V2.18399H25.2719V1.56H28.7039V3.11999H30.2639V4.992H29.6399ZM14.0399 3.432V1.872H14.6639V3.432H14.0399ZM-5.65872e-05 20.904V17.16H1.55994V14.664H0.623943V15.912H-5.65872e-05V14.04H2.18394V17.784H0.623943V20.28H4.67994V17.16H6.23994V15.6H9.35994V14.664H7.79994V13.104H4.67994V10.92H6.23994V9.984H4.67994V8.42399H1.55994V6.23999H3.11994V4.68H5.30394V6.23999H7.79994V4.68H9.35994V3.11999H11.5439V4.992H10.9199V3.744H9.98394V5.30399H8.42394V6.864H4.67994V5.30399H3.74394V6.864H2.18394V7.8H5.30394V9.35999H6.86394V11.544H5.30394V12.48H8.42394V14.04H9.98394V16.224H6.86394V17.784H5.30394V20.904H-5.65872e-05ZM20.2799 6.864V5.30399H17.4719V4.68H20.9039V6.23999H22.1519V6.864H20.2799ZM7.79994 11.232V9.35999H12.4799V7.8H14.0399V6.23999H17.7839V9.984H14.3519V9.35999H17.1599V6.864H14.6639V8.42399H13.1039V9.984H8.42394V11.232H7.79994ZM23.3999 9.984V6.23999H28.7039V9.672H28.0799V6.864H24.0239V9.35999H26.5199V8.112H27.1439V9.984H23.3999ZM23.3999 13.104V10.92H28.3919V11.544H24.0239V12.48H29.6399V10.92H31.8239V12.48H32.7599V6.864H31.8239V8.42399H30.2639V9.35999H31.5119V9.984H29.6399V7.8H31.1999V6.23999H33.3839V13.104H31.1999V11.544H30.2639V13.104H23.3999ZM20.2799 11.232V9.35999H21.8399V8.42399H18.7199V6.552H19.3439V7.8H22.4639V9.984H20.9039V11.232H20.2799ZM6.55194 8.42399V7.8H8.11194V8.42399H6.55194ZM1.87194 19.344V18.72H3.11994V15.6H4.67994V14.664H3.11994V13.104H1.55994V9.984H0.623943V12.792H-5.65872e-05V9.35999H2.18394V12.48H3.74394V14.04H5.30394V16.224H3.74394V19.344H1.87194ZM3.11994 11.232V9.672H3.74394V11.232H3.11994ZM7.79994 19.344V17.16H12.4799V11.544H9.98394V12.48H11.5439V15.912H10.9199V13.104H9.35994V10.92H13.1039V17.784H8.42394V18.72H9.67194V19.344H7.79994ZM34.3199 12.792V11.232H34.9439V12.792H34.3199ZM21.8399 12.792V11.232H22.4639V12.792H21.8399ZM10.9199 25.584V22.152H11.5439V24.96H12.4799V20.904H10.9199V18.72H12.7919V19.344H11.5439V20.28H13.1039V25.584H10.9199ZM6.23994 20.904V19.032H6.86394V20.28H9.67194V20.904H6.23994ZM3.11994 25.272V24.024H1.55994V21.84H3.43194V22.464H2.18394V23.4H3.74394V25.272H3.11994ZM1.55994 30.264V28.08H3.11994V27.144H1.87194V26.52H3.74394V28.704H2.18394V29.64H6.23994V28.704H4.67994V26.52H6.23994V24.96H7.79994V23.4H9.35994V22.464H5.30394V23.4H6.55194V24.024H4.67994V21.84H9.98394V24.024H8.42394V25.584H6.86394V27.144H5.30394V28.08H6.86394V30.264H1.55994ZM28.0799 26.832V24.024H26.5199V22.464H23.7119V21.84H27.1439V23.4H28.7039V26.832H28.0799ZM28.3919 22.464V21.84H31.5119V22.464H28.3919ZM-5.65872e-05 23.712V22.152H0.623943V23.712H-5.65872e-05ZM31.1999 25.584V23.712H31.8239V24.96H32.7599V23.4H34.9439V25.272H34.3199V24.024H33.3839V25.584H31.1999ZM15.5999 30.264V28.08H17.1599V26.52H21.8399V25.584H20.2799V23.4H25.5839V25.584H24.0239V26.52H25.5839V30.264H23.3999V28.392H24.0239V29.64H24.9599V27.144H23.3999V24.96H24.9599V24.024H20.9039V24.96H22.4639V27.144H17.7839V28.704H16.2239V29.64H17.4719V30.264H15.5999ZM29.6399 25.272V23.712H30.2639V25.272H29.6399ZM0.311943 25.584V24.96H1.87194V25.584H0.311943ZM26.5199 26.832V25.272H27.1439V26.832H26.5199ZM7.79994 33.384V26.52H11.5439V30.264H9.35994V28.392H9.98394V29.64H10.9199V27.144H8.42394V32.76H10.9199V31.824H9.67194V31.2H11.5439V33.384H7.79994ZM12.7919 30.264V29.64H14.0399V28.704H12.4799V26.52H14.3519V27.144H13.1039V28.08H14.6639V30.264H12.7919ZM21.8399 36.504V34.944H20.2799V33.384H18.7199V31.2H20.2799V30.264H18.7199V28.08H22.4639V31.2H24.0239V34.32H28.0799V33.384H24.9599V31.2H28.0799V30.264H26.5199V28.08H29.6399V26.52H31.8239V28.08H33.3839V30.264H31.5119V29.64H32.7599V28.704H31.1999V27.144H30.2639V28.704H27.1439V29.64H28.7039V31.824H25.5839V32.76H28.7039V34.944H23.3999V31.824H21.8399V28.704H19.3439V29.64H20.9039V31.824H19.3439V32.76H20.9039V34.32H22.4639V35.88H23.7119V36.504H21.8399ZM29.6399 33.072V29.952H30.2639V33.072H29.6399ZM3.43194 31.824V31.2H4.99194V31.824H3.43194ZM9.35994 36.504V34.32H13.1039V35.88H15.5999V34.944H14.0399V33.384H12.4799V31.2H17.4719V31.824H13.1039V32.76H14.6639V34.32H16.2239V36.504H12.4799V34.944H9.98394V35.88H11.2319V36.504H9.35994ZM6.23994 34.944V31.512H6.86394V34.32H8.11194V34.944H6.23994ZM15.9119 33.384V32.76H17.4719V33.384H15.9119ZM17.4719 36.504V35.88H18.7199V34.944H17.4719V34.32H19.3439V36.504H17.4719Z" fill="currentColor"/>
            </svg>
            {!isCollapsed && <h1 className="logo-text">Coached</h1>}
          </div>
          <button className="collapse-button desktop-only" onClick={toggleCollapse}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={isCollapsed ? 'rotated' : ''}>
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="nav-icon">{item.icon}</div>
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {item.badge && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
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
            {!isCollapsed && (
              <div className="user-info">
                <p className="user-email">{user?.email || 'User'}</p>
                <span className="user-plan">Enterprise</span>
              </div>
            )}
          </div>
          <button className="logout-button" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
