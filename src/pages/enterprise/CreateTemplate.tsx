import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import './CreateTemplate.css';

const CreateTemplate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');
  const navigate = useNavigate();

  return (
    <div className="create-template-page">
      <div className="page-header">
        <h1 className="page-title">Templates</h1>
        <Button 
          variant="secondary" 
          size="medium" 
          onClick={() => navigate(activeTab === 'workout' ? '/enterprise/workout-planner' : '/enterprise/diet-planner')}
        >
          {activeTab === 'workout' ? '+ New Workout Template' : '+ New Diet Template'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          Workout Templates
        </button>
        <button 
          className={`tab ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => setActiveTab('nutrition')}
        >
          Nutrition Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
      </div>
    </div>
  );
};

export default CreateTemplate;
