import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useFirestore } from '../../hooks/useFirestore';
import { formatDate } from '../../utils/dateUtils';
import { ClientProfile } from '../../types';
import './ClientDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ClientDashboard: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [coachName, setCoachName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weight' | 'measurements' | 'meals'>('overview');

  const { getById: getClient } = useFirestore('client_profiles');
  const { getById: getCoach } = useFirestore('coach_profiles');

  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const clientData = await getClient(clientId);
        setClient(clientData as ClientProfile);

        if (clientData?.assignedCoachId) {
          const coachData = await getCoach(clientData.assignedCoachId);
          setCoachName(coachData?.fullName || 'Unassigned');
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  // Mock weight data (we'll store this in Firestore later)
  const mockWeightData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Weight (kg)',
        data: [95, 93.44, 92.44, 90.8, 89.9, 90, 88, 87.6],
        backgroundColor: 'rgba(79, 124, 255, 0.8)',
        borderColor: '#4f7cff',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1d2e',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4f7cff',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          callback: (value: any) => `${value} kg`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Mock body measurements
  const bodyMeasurements = [
    { week: 'Week 1', date: '3/6/2025', leftArm: 13, rightArm: 13, leftThigh: 24, rightThigh: 24, waistMiddle: 30 },
    { week: 'Week 4', date: '4/13/2025', leftArm: 13, rightArm: 13, leftThigh: 22, rightThigh: 22, waistMiddle: 35 },
  ];

  // Mock meal plan
  const mealPlan = {
    preWorkout: { option1: 'Green Tea/Black Coffee', option2: 'Green Tea/Black Coffee', food: 'Orange 150g / Watermelon 300g' },
    postWorkout: { option1: 'Greek Yogurt 200g', option2: 'Egg Whites 5' },
    breakfast: { name: 'Bread Omelette / Peanut Butter Sandwich', items: ['Wheat Bread 2 slices', 'Egg Whites 6', 'Add Veggies 150g'] },
    snacks: { name: 'Green Tea / Protein Bar', items: ['Protein Bar 1 (20g protein)', 'Greek Yogurt 200g'] },
    lunch: { name: 'Chicken / Paneer', items: ['Cooked Chapati 60g / Rice 150g', 'Chicken 200g / Tofu 200g', 'Salad 200g'] },
    dinner: { name: 'Soya Pulav', items: ['Cooked Rice 150g', 'Chicken 150g / Soya 50g', 'Salad/Mix Vegetables 150g'] },
    nutrition: { calories: '1800 cal', carbs: '230g', protein: '110g' },
  };

  if (loading) {
    return (
      <div className="client-dashboard-page">
        <Card>
          <Loader />
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="client-dashboard-page">
        <Card>
          <div className="error-state">
            <h3>Client not found</h3>
            <Button onClick={() => navigate('/enterprise/clients')}>
              Back to Client List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const startingWeight = 95;
  const currentWeight = 87.6;
  const weightLoss = startingWeight - currentWeight;
  const progressPercentage = ((weightLoss / startingWeight) * 100).toFixed(1);

  return (
    <>
      <Button
        variant="ghost"
        className="back-to-list-btn"
        onClick={() => navigate('/enterprise/clients')}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </Button>
      <div className="client-dashboard-page">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-info">
            <h1 className="client-name">{client.fullName}</h1>
          </div>
          <div className="client-subtitle">
            <div>{client.email}</div>
            <div>{client.phone}</div>
            <div>Age: {client.dateOfBirth ? new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear() : 'N/A'}</div>
            <div>Joined: {formatDate(client.createdAt?.toDate?.() || new Date())}</div>
          </div>
          <div className="header-divider"></div>
          <div className="fitness-goals-summary">
            <div><strong>Primary Goal:</strong> {client.fitnessGoals?.primaryGoal?.replace('_', ' ')}</div>
            {client.fitnessGoals?.targetWeight && (
              <div><strong>Target Weight:</strong> {client.fitnessGoals.targetWeight} kg</div>
            )}
            <div><strong>Plan:</strong> {client.planType}</div>
          </div>
        </div>

      {/* Client Info Cards */}
      <div className="info-cards">
        <Card className="info-card">
          <div className="info-card-content">
            <div className="info-details">
              <span className="info-label">Current Weight</span>
              <span className="info-value">{currentWeight} kg</span>
              <span className="info-change negative">-{weightLoss.toFixed(1)} kg</span>
            </div>
          </div>
        </Card>

        <Card className="info-card">
          <div className="info-card-content">
            <div className="info-details">
              <span className="info-label">Total Progress</span>
              <span className="info-value">{progressPercentage}%</span>
              <span className="info-change positive">On track</span>
            </div>
          </div>
        </Card>

        <Card className="info-card">
          <div className="info-card-content">
            <div className="info-details">
              <span className="info-label">Goal</span>
              <span className="info-value">{client.fitnessGoals?.primaryGoal?.replace('_', ' ')}</span>
              <span className="info-change neutral">Plan: {client.planType}</span>
            </div>
          </div>
        </Card>

        <Card className="info-card">
          <div className="info-card-content">
            <div className="info-details">
              <span className="info-label">Coach</span>
              <span className="info-value small">{coachName}</span>
              <span className="info-change positive">Active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'weight' ? 'active' : ''}`}
          onClick={() => setActiveTab('weight')}
        >
          Weight Tracker
        </button>
        <button 
          className={`tab ${activeTab === 'measurements' ? 'active' : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          Body Measurements
        </button>
        <button 
          className={`tab ${activeTab === 'meals' ? 'active' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          Meal Plan
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <Card className="weight-chart-card">
              <h3 className="card-title">Weight Progress</h3>
              <div className="chart-container">
                <Bar data={mockWeightData} options={chartOptions} />
              </div>
            </Card>
          </div>
        )}

        {/* Weight Tracker Tab */}
        {activeTab === 'weight' && (
          <Card>
            <h3 className="card-title">Daily Weight Log</h3>
            <div className="weight-table-container">
              <table className="weight-table">
                <thead>
                  <tr>
                    <th>Day #</th>
                    <th>Date</th>
                    <th>Weight (kg)</th>
                    <th>+/- From Start</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>3/7/2025</td>
                    <td>95.00</td>
                    <td className="neutral">0.00</td>
                    <td><div className="progress-bar" style={{ width: '0%' }}></div></td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>3/10/2025</td>
                    <td>93.44</td>
                    <td className="positive">-1.56</td>
                    <td><div className="progress-bar" style={{ width: '21%' }}></div></td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>3/13/2025</td>
                    <td>92.44</td>
                    <td className="positive">-2.56</td>
                    <td><div className="progress-bar" style={{ width: '35%' }}></div></td>
                  </tr>
                  <tr>
                    <td>9</td>
                    <td>3/15/2025</td>
                    <td>90.80</td>
                    <td className="positive">-4.20</td>
                    <td><div className="progress-bar" style={{ width: '57%' }}></div></td>
                  </tr>
                  <tr>
                    <td>12</td>
                    <td>3/18/2025</td>
                    <td>89.90</td>
                    <td className="positive">-5.10</td>
                    <td><div className="progress-bar" style={{ width: '69%' }}></div></td>
                  </tr>
                  <tr>
                    <td>15</td>
                    <td>3/21/2025</td>
                    <td>90.00</td>
                    <td className="positive">-5.00</td>
                    <td><div className="progress-bar" style={{ width: '68%' }}></div></td>
                  </tr>
                  <tr>
                    <td>29</td>
                    <td>4/4/2025</td>
                    <td>88.00</td>
                    <td className="positive">-7.00</td>
                    <td><div className="progress-bar" style={{ width: '95%' }}></div></td>
                  </tr>
                  <tr className="highlight">
                    <td>44</td>
                    <td>4/19/2025</td>
                    <td>87.60</td>
                    <td className="positive">-7.40</td>
                    <td><div className="progress-bar" style={{ width: '100%' }}></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Body Measurements Tab */}
        {activeTab === 'measurements' && (
          <Card>
            <h3 className="card-title">Body Measurements Progress</h3>
            <div className="measurements-grid">
              <div className="measurement-card">
                <h4>Arms</h4>
                <div className="measurement-row">
                  <span>Left Arm:</span>
                  <span className="measurement-value">13 IN → 13 IN</span>
                </div>
                <div className="measurement-row">
                  <span>Right Arm:</span>
                  <span className="measurement-value">13 IN → 13 IN</span>
                </div>
              </div>
              <div className="measurement-card">
                <h4>Thighs</h4>
                <div className="measurement-row">
                  <span>Left Thigh:</span>
                  <span className="measurement-value highlight">24 IN → 22 IN (-2)</span>
                </div>
                <div className="measurement-row">
                  <span>Right Thigh:</span>
                  <span className="measurement-value highlight">24 IN → 22 IN (-2)</span>
                </div>
              </div>
              <div className="measurement-card">
                <h4>Waist</h4>
                <div className="measurement-row">
                  <span>Waist Middle:</span>
                  <span className="measurement-value">30 IN → 35 IN</span>
                </div>
              </div>
            </div>
            
            <div className="measurements-table-container">
              <h4 className="section-title">Weekly Measurements</h4>
              <table className="measurements-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Date</th>
                    <th>Left Arm</th>
                    <th>Right Arm</th>
                    <th>Left Thigh</th>
                    <th>Right Thigh</th>
                    <th>Waist Middle</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyMeasurements.map((measurement, index) => (
                    <tr key={index}>
                      <td>{measurement.week}</td>
                      <td>{measurement.date}</td>
                      <td>{measurement.leftArm} IN</td>
                      <td>{measurement.rightArm} IN</td>
                      <td>{measurement.leftThigh} IN</td>
                      <td>{measurement.rightThigh} IN</td>
                      <td>{measurement.waistMiddle} IN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Meal Plan Tab */}
        {activeTab === 'meals' && (
          <>
            <h3 className="card-title">Daily Nutrition Target</h3>
            
            <div className="nutrition-cards-container">
              <Card className="nutrition-stat-card">
                <div className="nutrition-stat">
                  <div className="stat-value">{mealPlan.nutrition.calories}</div>
                  <div className="stat-label">Calories</div>
                </div>
              </Card>

              <Card className="nutrition-stat-card">
                <div className="nutrition-stat">
                  <div className="stat-value">{mealPlan.nutrition.carbs}</div>
                  <div className="stat-label">Carbs</div>
                </div>
              </Card>

              <Card className="nutrition-stat-card">
                <div className="nutrition-stat">
                  <div className="stat-value">{mealPlan.nutrition.protein}</div>
                  <div className="stat-label">Protein</div>
                </div>
              </Card>
            </div>

            <h3 className="card-title">Daily Nutrition Target</h3>

            <div className="meal-plan-grid">
            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Pre Workout</span>
                <span className="meal-time">6:00 AM</span>
              </h4>
              <ul className="meal-list">
                <li>{mealPlan.preWorkout.option1}</li>
                <li>{mealPlan.preWorkout.food}</li>
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Post Workout</span>
                <span className="meal-time">8:00 AM</span>
              </h4>
              <ul className="meal-list">
                <li>{mealPlan.postWorkout.option1}</li>
                <li>{mealPlan.postWorkout.option2}</li>
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Breakfast</span>
                <span className="meal-time">9:00 AM</span>
              </h4>
              <p className="meal-name">{mealPlan.breakfast.name}</p>
              <ul className="meal-list">
                {mealPlan.breakfast.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Snacks</span>
                <span className="meal-time">12:00 PM</span>
              </h4>
              <p className="meal-name">{mealPlan.snacks.name}</p>
              <ul className="meal-list">
                {mealPlan.snacks.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Lunch</span>
                <span className="meal-time">2:00 PM</span>
              </h4>
              <p className="meal-name">{mealPlan.lunch.name}</p>
              <ul className="meal-list">
                {mealPlan.lunch.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Dinner</span>
                <span className="meal-time">7:00 PM</span>
              </h4>
              <p className="meal-name">{mealPlan.dinner.name}</p>
              <ul className="meal-list">
                {mealPlan.dinner.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
          </>
        )}
      </div>
      </div>
    </>
  );
};

export default ClientDashboard;
