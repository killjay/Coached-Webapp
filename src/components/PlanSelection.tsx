import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ACCOUNT_PLANS } from '../constants';
import './PlanSelection.css';

const PlanSelection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { savePlan } = useAuth();
  const navigate = useNavigate();

  const plans = ACCOUNT_PLANS;

  const handlePlanSelect = async (planId: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlanSelection.tsx:63',message:'handlePlanSelect called',data:{planId:planId},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
    // #endregion
    
    setError('');
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlanSelection.tsx:69',message:'Calling savePlan',data:{planId:planId},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
      
      await savePlan(planId);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlanSelection.tsx:70',message:'savePlan completed - navigating',data:{planId:planId},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
      
      // Navigate to dashboard after successful plan save
      navigate('/dashboard');
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlanSelection.tsx:71',message:'Navigate called',data:{path:'/dashboard'},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/2595f84f-cbd5-495e-a29e-39870c95961e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PlanSelection.tsx:73',message:'handlePlanSelect error caught',data:{error:err?.message||String(err)},timestamp:Date.now(),hypothesisId:'H4',runId:'fix1'})}).catch(()=>{});
      // #endregion
      setError(err.message || 'Failed to save plan selection');
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="pricing-container">
      <div className="pricing-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="pricing-content">
        <div className="pricing-header">
          <div className="logo">
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
          <h2 className="pricing-title">
            Simple & <span className="italic">transparent</span> pricing
          </h2>
          <p className="pricing-subtitle">for all business sizes</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most popular</div>}
              
              <div className="pricing-card-content">
                <h3 className="pricing-plan-name">{plan.name}</h3>
                
                <div className="pricing-amount">
                  <span className="currency">$</span>
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>

                <button
                  className={`get-started-button ${plan.popular ? 'primary' : 'secondary'} ${
                    isLoading && selectedPlan === plan.id ? 'loading' : ''
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isLoading}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <span className="spinner"></span>
                      Selecting...
                    </>
                  ) : (
                    'Get started'
                  )}
                </button>

                <div className="features-section">
                  <h4 className="features-title">FEATURES</h4>
                  <p className="features-description">{plan.description}</p>
                  
                  <ul className="features-list">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <svg
                          className="check-icon"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
