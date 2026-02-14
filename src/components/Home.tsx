import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './common/Button';
import './Home.css';
import TimelineIcon from '../assets/timeline.svg';
import CalendarIcon from '../assets/calendar_month.svg';
import ExerciseIcon from '../assets/exercise.svg';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleCoachLogin = () => {
    navigate('/login?type=coach');
  };

  const handleClientLogin = () => {
    navigate('/login?type=client');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="login-card">
        <div className="login-image">
          <img src="/fitness-image.png" alt="Fitness motivation" />
        </div>
        
        <div className="login-form-section">
          <div className="login-header">
            <div className="logo">
              <h1 className="logo-text">Coached</h1>
            </div>
          </div>

          <div className="home-cta-buttons">
            <button 
              className="home-cta-button home-cta-coach"
              onClick={handleCoachLogin}
            >
              <div className="cta-text">
                <span className="cta-label">Log in as Coach</span>
              </div>
            </button>

            <button 
              className="home-cta-button home-cta-client"
              onClick={handleClientLogin}
            >
              <div className="cta-text">
                <span className="cta-label">Log in as Client</span>
              </div>
            </button>
          </div>

          <div className="home-features">
            <div className="feature-item">
              <div className="feature-icon">
                <img src={TimelineIcon} alt="Track Progress" />
              </div>
              <span>Track Progress</span>
            </div>
            <div className="feature-divider"></div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={CalendarIcon} alt="Calendar" />
              </div>
              <span>Schedule Sessions</span>
            </div>
            <div className="feature-divider"></div>
            <div className="feature-item">
              <div className="feature-icon">
                <img src={ExerciseIcon} alt="Exercise" />
              </div>
              <span>Custom Plans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
