import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import './EnterpriseLayout.css';

const EnterpriseLayout: React.FC = () => {
  return (
    <div className="enterprise-layout">
      <Sidebar />
      <main className="enterprise-main">
        <Outlet />
      </main>
    </div>
  );
};

export default EnterpriseLayout;
