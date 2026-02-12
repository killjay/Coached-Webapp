import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useFirestore } from '../../hooks/useFirestore';
import { formatDate } from '../../utils/dateUtils';
import {
  ClientProfile,
  ClientProgress,
  Measurement,
  WeightEntry,
  NutritionPlanItem,
  Template,
  TemplateAssignment,
  WorkoutPlan,
} from '../../types';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ClientDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ClientDashboard: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [coachName, setCoachName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weight' | 'measurements' | 'meals' | 'workout'>('overview');
  const [weightPeriod, setWeightPeriod] = useState<'1month' | '6months' | 'all'>('all');
  const [bodyMeasurements, setBodyMeasurements] = useState<Measurement[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [workoutAssignment, setWorkoutAssignment] = useState<TemplateAssignment | null>(null);
  const [workoutTemplate, setWorkoutTemplate] = useState<Template | null>(null);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [workoutError, setWorkoutError] = useState<string | null>(null);

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

        // Fetch client progress data (measurements and weight entries)
        const progressDocRef = doc(db, 'client_progress', clientId);
        const progressDoc = await getDoc(progressDocRef);
        
        if (progressDoc.exists()) {
          const progressData = progressDoc.data() as ClientProgress;
          setBodyMeasurements(progressData.measurements || []);
          setWeightEntries(progressData.weightEntries || []);
        } else {
          // Initialize empty arrays if no progress data exists
          setBodyMeasurements([]);
          setWeightEntries([]);
        }

        // Fetch nutrition plan
        const nutritionDocRef = doc(db, 'nutrition_plans', clientId);
        const nutritionDoc = await getDoc(nutritionDocRef);
        
        if (nutritionDoc.exists()) {
          const nutritionData = nutritionDoc.data();
          const currentPlanId = nutritionData.currentPlan;
          if (currentPlanId && nutritionData.plans) {
            const currentPlan = nutritionData.plans.find((p: NutritionPlanItem) => p.id === currentPlanId);
            if (currentPlan) {
              setMealPlan(currentPlan);
            }
          }
        }

        // Fetch assigned workout plan (template assignment + template)
        setWorkoutError(null);
        setWorkoutLoading(true);
        setWorkoutAssignment(null);
        setWorkoutTemplate(null);

        const assignmentQuery = query(
          collection(db, 'template_assignments'),
          where('clientId', '==', clientId),
          where('status', '==', 'active')
        );
        const assignmentSnap = await getDocs(assignmentQuery);
        const assignment = assignmentSnap.docs[0]?.data() as TemplateAssignment | undefined;
        if (assignment?.templateId) {
          setWorkoutAssignment(assignment);
          const templateRef = doc(db, 'templates', assignment.templateId);
          const templateSnap = await getDoc(templateRef);
          if (templateSnap.exists()) {
            setWorkoutTemplate({ id: templateSnap.id, ...(templateSnap.data() as any) } as Template);
          }
        }
      } catch (error) {
        console.error('Error fetching client:', error);
        setWorkoutError('Failed to load workout plan.');
      } finally {
        setLoading(false);
        setWorkoutLoading(false);
      }
    };

    fetchData();
  }, [clientId, getClient, getCoach]);

  const toYouTubeEmbed = (url: string): string | null => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      let id: string | null = null;
      if (host === 'youtu.be') id = u.pathname.replace('/', '') || null;
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        id = u.searchParams.get('v');
        if (!id) {
          const parts = u.pathname.split('/').filter(Boolean);
          const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed');
          if (idx >= 0 && parts[idx + 1]) id = parts[idx + 1];
        }
      }
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    } catch {
      return null;
    }
  };

  // Filter weight data based on selected period
  const getFilteredWeightData = () => {
    const allData = weightEntries;
    
    switch (weightPeriod) {
      case '1month':
        // Last 4 weeks
        return allData.slice(-4);
      case '6months':
        // Last 26 weeks (approximately 6 months)
        return allData.slice(-26);
      case 'all':
      default:
        return allData;
    }
  };

  const filteredWeightData = getFilteredWeightData();

  // Mock weight data for chart - use filtered weekly data
  const mockWeightData = {
    labels: filteredWeightData.map(entry => entry.weekLabel),
    datasets: [
      {
        label: 'Weight (kg)',
        data: filteredWeightData.map(entry => parseFloat(entry.weight)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#3b82f6',
        borderWidth: 1,
        padding: 12,
        bodySpacing: 6,
        boxPadding: 6,
        usePointStyle: true,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y + ' kg';
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#e5e7eb',
          drawBorder: true,
          borderColor: '#333333',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: '#e5e7eb',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: (value: any) => `${value} kg`,
        },
      },
    },
  };

  // Default meal plan structure (used when no meal plan exists in Firebase)
  const defaultMealPlan = {
    nutrition: { calories: 'N/A', carbs: 'N/A', protein: 'N/A' },
    preWorkout: { option1: 'Not set', option2: '', food: '' },
    postWorkout: { option1: 'Not set', option2: '' },
    breakfast: { name: 'Not set', items: [] },
    snacks: { name: 'Not set', items: [] },
    lunch: { name: 'Not set', items: [] },
    dinner: { name: 'Not set', items: [] },
  };

  // Convert Firebase nutrition plan to component format
  const formattedMealPlan = mealPlan ? {
    nutrition: {
      calories: `${mealPlan.dailyCalories || 0} cal`,
      carbs: `${mealPlan.macros?.carbs || 0}g`,
      protein: `${mealPlan.macros?.protein || 0}g`,
    },
    preWorkout: mealPlan.meals?.find((m: any) => m.name.toLowerCase().includes('pre workout')) || defaultMealPlan.preWorkout,
    postWorkout: mealPlan.meals?.find((m: any) => m.name.toLowerCase().includes('post workout')) || defaultMealPlan.postWorkout,
    breakfast: mealPlan.meals?.find((m: any) => m.name.toLowerCase().includes('breakfast')) || defaultMealPlan.breakfast,
    snacks: mealPlan.meals?.find((m: any) => m.name.toLowerCase().includes('snack')) || defaultMealPlan.snacks,
    lunch: mealPlan.meals?.find((m: any) => m.name.toLowerCase().includes('lunch')) || defaultMealPlan.lunch,
    dinner: mealPlan.meals?.find((m: any) => m.name.toLowerCase().includes('dinner')) || defaultMealPlan.dinner,
  } : defaultMealPlan;

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

  const startingWeight = parseFloat(weightEntries[0]?.weight || '0');
  const currentWeight = parseFloat(weightEntries[weightEntries.length - 1]?.weight || '0');
  const weightLoss = startingWeight - currentWeight;
  const progressPercentage = startingWeight > 0 ? ((weightLoss / startingWeight) * 100).toFixed(1) : '0.0';

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
        <button 
          className={`tab ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          Workout Plan
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="overview-charts-container">
              <div className="measurements-charts-grid">
              <Card className="mini-chart-card">
                <h4 className="mini-chart-title">Chest & Shoulders</h4>
                <div className="mini-chart-container">
                  <Line 
                    data={{
                      labels: bodyMeasurements.map(m => m.week || m.date),
                      datasets: [
                        {
                          label: 'Chest',
                          data: bodyMeasurements.map(m => m.measurements?.chest || 0),
                          borderColor: '#ef4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                        {
                          label: 'Shoulders',
                          data: bodyMeasurements.map(m => m.measurements?.shoulders || 0),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                      scales: {
                        x: { ticks: { font: { size: 9 } }, grid: { display: false } },
                        y: { ticks: { font: { size: 9 } }, grid: { color: '#e5e7eb' } },
                      },
                    }}
                  />
                </div>
              </Card>

              <Card className="mini-chart-card">
                <h4 className="mini-chart-title">Arms (Flexed)</h4>
                <div className="mini-chart-container">
                  <Line 
                    data={{
                      labels: bodyMeasurements.map(m => m.week || m.date),
                      datasets: [
                        {
                          label: 'Left Arm',
                          data: bodyMeasurements.map(m => m.measurements?.leftArmFlexed || 0),
                          borderColor: '#10b981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                        {
                          label: 'Right Arm',
                          data: bodyMeasurements.map(m => m.measurements?.rightArmFlexed || 0),
                          borderColor: '#06b6d4',
                          backgroundColor: 'rgba(6, 182, 212, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                      scales: {
                        x: { ticks: { font: { size: 9 } }, grid: { display: false } },
                        y: { ticks: { font: { size: 9 } }, grid: { color: '#e5e7eb' } },
                      },
                    }}
                  />
                </div>
              </Card>

              <Card className="mini-chart-card">
                <h4 className="mini-chart-title">Waist & Hips</h4>
                <div className="mini-chart-container">
                  <Line 
                    data={{
                      labels: bodyMeasurements.map(m => m.week || m.date),
                      datasets: [
                        {
                          label: 'Waist',
                          data: bodyMeasurements.map(m => m.measurements?.waistMiddle || 0),
                          borderColor: '#f59e0b',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                        {
                          label: 'Hips',
                          data: bodyMeasurements.map(m => m.measurements?.hips || 0),
                          borderColor: '#8b5cf6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                      scales: {
                        x: { ticks: { font: { size: 9 } }, grid: { display: false } },
                        y: { ticks: { font: { size: 9 } }, grid: { color: '#e5e7eb' } },
                      },
                    }}
                  />
                </div>
              </Card>

              <Card className="mini-chart-card">
                <h4 className="mini-chart-title">Thighs</h4>
                <div className="mini-chart-container">
                  <Line 
                    data={{
                      labels: bodyMeasurements.map(m => m.week || m.date),
                      datasets: [
                        {
                          label: 'Left Thigh',
                          data: bodyMeasurements.map(m => m.measurements?.leftThigh || 0),
                          borderColor: '#ec4899',
                          backgroundColor: 'rgba(236, 72, 153, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                        {
                          label: 'Right Thigh',
                          data: bodyMeasurements.map(m => m.measurements?.rightThigh || 0),
                          borderColor: '#14b8a6',
                          backgroundColor: 'rgba(20, 184, 166, 0.1)',
                          borderWidth: 2,
                          pointRadius: 3,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                      scales: {
                        x: { ticks: { font: { size: 9 } }, grid: { display: false } },
                        y: { ticks: { font: { size: 9 } }, grid: { color: '#e5e7eb' } },
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            <Card className="weight-chart-card">
              <div className="card-header-with-filter">
                <h3 className="card-title">Weight Progress</h3>
                <div className="chart-filter-buttons">
                  <button 
                    className={`filter-btn ${weightPeriod === '1month' ? 'active' : ''}`}
                    onClick={() => setWeightPeriod('1month')}
                  >
                    Last Month
                  </button>
                  <button 
                    className={`filter-btn ${weightPeriod === '6months' ? 'active' : ''}`}
                    onClick={() => setWeightPeriod('6months')}
                  >
                    Last 6 Months
                  </button>
                  <button 
                    className={`filter-btn ${weightPeriod === 'all' ? 'active' : ''}`}
                    onClick={() => setWeightPeriod('all')}
                  >
                    All
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <Line data={mockWeightData} options={chartOptions} />
              </div>
            </Card>
            </div>
          </>
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
                  {weightEntries.length > 0 ? (
                    weightEntries.map((entry, index) => {
                      const changeClass = entry.change === '0.00' ? 'neutral' : parseFloat(entry.change) < 0 ? 'positive' : 'negative';
                      const isLatest = index === weightEntries.length - 1;
                      
                      return (
                        <tr key={entry.day} className={isLatest ? 'highlight' : ''}>
                          <td>{entry.day}</td>
                          <td>{entry.date}</td>
                          <td>{entry.weight}</td>
                          <td className={changeClass}>{entry.change}</td>
                          <td><div className="progress-bar" style={{ width: `${entry.progress}%` }}></div></td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                        No weight data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Body Measurements Tab */}
        {activeTab === 'measurements' && (
          <>
            {bodyMeasurements.length > 0 ? (
              <>
                <h3 className="card-title">Body Measurements Progress</h3>
                <div className="measurements-grid">
                    <div className="measurement-card">
                      <h4>Chest & Shoulders</h4>
                      <div className="measurement-row">
                        <span>Chest:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.chest || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.chest || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.chest || 0) - (bodyMeasurements[0].measurements?.chest || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Shoulders:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.shoulders || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.shoulders || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.shoulders || 0) - (bodyMeasurements[0].measurements?.shoulders || 0)).toFixed(1)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="measurement-card">
                      <h4>Arms</h4>
                      <div className="measurement-row">
                        <span>Left Arm:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.leftArm || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftArm || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftArm || 0) - (bodyMeasurements[0].measurements?.leftArm || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Right Arm:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.rightArm || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightArm || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightArm || 0) - (bodyMeasurements[0].measurements?.rightArm || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Left Arm (Flexed):</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.leftArmFlexed || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftArmFlexed || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftArmFlexed || 0) - (bodyMeasurements[0].measurements?.leftArmFlexed || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Right Arm (Flexed):</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.rightArmFlexed || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightArmFlexed || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightArmFlexed || 0) - (bodyMeasurements[0].measurements?.rightArmFlexed || 0)).toFixed(1)})
                        </span>
                      </div>
                    </div>

                    <div className="measurement-card">
                      <h4>Forearms & Neck</h4>
                      <div className="measurement-row">
                        <span>Left Forearm:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.leftForearm || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftForearm || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftForearm || 0) - (bodyMeasurements[0].measurements?.leftForearm || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Right Forearm:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.rightForearm || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightForearm || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightForearm || 0) - (bodyMeasurements[0].measurements?.rightForearm || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Neck:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.neck || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.neck || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.neck || 0) - (bodyMeasurements[0].measurements?.neck || 0)).toFixed(1)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="measurement-card">
                      <h4>Thighs</h4>
                      <div className="measurement-row">
                        <span>Left Thigh:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.leftThigh || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftThigh || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftThigh || 0) - (bodyMeasurements[0].measurements?.leftThigh || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Right Thigh:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.rightThigh || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightThigh || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightThigh || 0) - (bodyMeasurements[0].measurements?.rightThigh || 0)).toFixed(1)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="measurement-card">
                      <h4>Core & Lower Body</h4>
                      <div className="measurement-row">
                        <span>Waist:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.waistMiddle || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.waistMiddle || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.waistMiddle || 0) - (bodyMeasurements[0].measurements?.waistMiddle || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Hips:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.hips || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.hips || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.hips || 0) - (bodyMeasurements[0].measurements?.hips || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Glutes:</span>
                        <span className="measurement-value highlight">
                          {bodyMeasurements[0].measurements?.glutes || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.glutes || 0} IN 
                          ({((bodyMeasurements[bodyMeasurements.length - 1].measurements?.glutes || 0) - (bodyMeasurements[0].measurements?.glutes || 0)).toFixed(1)})
                        </span>
                      </div>
                    </div>

                    <div className="measurement-card">
                      <h4>Calves</h4>
                      <div className="measurement-row">
                        <span>Left Calf:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.leftCalf || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftCalf || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.leftCalf || 0) - (bodyMeasurements[0].measurements?.leftCalf || 0)).toFixed(1)})
                        </span>
                      </div>
                      <div className="measurement-row">
                        <span>Right Calf:</span>
                        <span className="measurement-value">
                          {bodyMeasurements[0].measurements?.rightCalf || 0} IN → {bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightCalf || 0} IN 
                          (+{((bodyMeasurements[bodyMeasurements.length - 1].measurements?.rightCalf || 0) - (bodyMeasurements[0].measurements?.rightCalf || 0)).toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </div>
                
                <h3 className="section-title">Weekly Measurements</h3>
                <div className="measurements-table-container">
                  <table className="measurements-table">
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Date</th>
                        <th>Chest</th>
                        <th>Shoulders</th>
                        <th>Left Arm</th>
                        <th>Right Arm</th>
                        <th>Left Arm (Flexed)</th>
                        <th>Right Arm (Flexed)</th>
                        <th>Left Forearm</th>
                        <th>Right Forearm</th>
                        <th>Neck</th>
                        <th>Left Thigh</th>
                        <th>Right Thigh</th>
                        <th>Waist</th>
                        <th>Hips</th>
                        <th>Glutes</th>
                        <th>Left Calf</th>
                        <th>Right Calf</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bodyMeasurements.map((measurement, index) => (
                        <tr key={index}>
                          <td>{measurement.week || `Week ${index + 1}`}</td>
                          <td>{measurement.date}</td>
                          <td>{measurement.measurements?.chest || 0} IN</td>
                          <td>{measurement.measurements?.shoulders || 0} IN</td>
                          <td>{measurement.measurements?.leftArm || 0} IN</td>
                          <td>{measurement.measurements?.rightArm || 0} IN</td>
                          <td>{measurement.measurements?.leftArmFlexed || 0} IN</td>
                          <td>{measurement.measurements?.rightArmFlexed || 0} IN</td>
                          <td>{measurement.measurements?.leftForearm || 0} IN</td>
                          <td>{measurement.measurements?.rightForearm || 0} IN</td>
                          <td>{measurement.measurements?.neck || 0} IN</td>
                          <td>{measurement.measurements?.leftThigh || 0} IN</td>
                          <td>{measurement.measurements?.rightThigh || 0} IN</td>
                          <td>{measurement.measurements?.waistMiddle || 0} IN</td>
                          <td>{measurement.measurements?.hips || 0} IN</td>
                          <td>{measurement.measurements?.glutes || 0} IN</td>
                          <td>{measurement.measurements?.leftCalf || 0} IN</td>
                          <td>{measurement.measurements?.rightCalf || 0} IN</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <Card>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <h3 style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>No measurements available</h3>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Body measurements have not been recorded yet.</p>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Meal Plan Tab */}
        {activeTab === 'meals' && (
          <>
            <h3 className="card-title">Daily Nutrition Target</h3>
            
            <div className="nutrition-cards-container">
              <Card className="nutrition-stat-card">
                <div className="nutrition-stat">
                  <div className="stat-value">{formattedMealPlan.nutrition.calories}</div>
                  <div className="stat-label">Calories</div>
                </div>
              </Card>

              <Card className="nutrition-stat-card">
                <div className="nutrition-stat">
                  <div className="stat-value">{formattedMealPlan.nutrition.carbs}</div>
                  <div className="stat-label">Carbs</div>
                </div>
              </Card>

              <Card className="nutrition-stat-card">
                <div className="nutrition-stat">
                  <div className="stat-value">{formattedMealPlan.nutrition.protein}</div>
                  <div className="stat-label">Protein</div>
                </div>
              </Card>
            </div>

            <h3 className="card-title">Daily Meal Plan</h3>

            <div className="meal-plan-grid">
            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Pre Workout</span>
                <span className="meal-time">6:00 AM</span>
              </h4>
              <ul className="meal-list">
                {formattedMealPlan.preWorkout.option1 && <li>{formattedMealPlan.preWorkout.option1}</li>}
                {formattedMealPlan.preWorkout.food && <li>{formattedMealPlan.preWorkout.food}</li>}
                {!formattedMealPlan.preWorkout.option1 && !formattedMealPlan.preWorkout.food && <li>No meal plan set</li>}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Post Workout</span>
                <span className="meal-time">8:00 AM</span>
              </h4>
              <ul className="meal-list">
                {formattedMealPlan.postWorkout.option1 && <li>{formattedMealPlan.postWorkout.option1}</li>}
                {formattedMealPlan.postWorkout.option2 && <li>{formattedMealPlan.postWorkout.option2}</li>}
                {!formattedMealPlan.postWorkout.option1 && !formattedMealPlan.postWorkout.option2 && <li>No meal plan set</li>}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Breakfast</span>
                <span className="meal-time">9:00 AM</span>
              </h4>
              {formattedMealPlan.breakfast.name && <p className="meal-name">{formattedMealPlan.breakfast.name}</p>}
              <ul className="meal-list">
                {formattedMealPlan.breakfast.items && formattedMealPlan.breakfast.items.length > 0 ? (
                  formattedMealPlan.breakfast.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No meal plan set</li>
                )}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Snacks</span>
                <span className="meal-time">12:00 PM</span>
              </h4>
              {formattedMealPlan.snacks.name && <p className="meal-name">{formattedMealPlan.snacks.name}</p>}
              <ul className="meal-list">
                {formattedMealPlan.snacks.items && formattedMealPlan.snacks.items.length > 0 ? (
                  formattedMealPlan.snacks.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No meal plan set</li>
                )}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Lunch</span>
                <span className="meal-time">2:00 PM</span>
              </h4>
              {formattedMealPlan.lunch.name && <p className="meal-name">{formattedMealPlan.lunch.name}</p>}
              <ul className="meal-list">
                {formattedMealPlan.lunch.items && formattedMealPlan.lunch.items.length > 0 ? (
                  formattedMealPlan.lunch.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No meal plan set</li>
                )}
              </ul>
            </Card>

            <Card className="meal-card">
              <h4 className="meal-title">
                <span>Dinner</span>
                <span className="meal-time">7:00 PM</span>
              </h4>
              {formattedMealPlan.dinner.name && <p className="meal-name">{formattedMealPlan.dinner.name}</p>}
              <ul className="meal-list">
                {formattedMealPlan.dinner.items && formattedMealPlan.dinner.items.length > 0 ? (
                  formattedMealPlan.dinner.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No meal plan set</li>
                )}
              </ul>
            </Card>
          </div>
          </>
        )}

        {/* Workout Plan Tab */}
        {activeTab === 'workout' && (
          <Card className="workout-plan-card">
            <div className="section-header">
              <h3>Assigned Workout Plan</h3>
              {workoutTemplate?.name && (
                <span className="section-subtitle">{workoutTemplate.name}</span>
              )}
            </div>

            {workoutLoading ? (
              <Loader />
            ) : workoutError ? (
              <div className="error-state">
                <p>{workoutError}</p>
              </div>
            ) : !workoutAssignment || !workoutTemplate ? (
              <div className="empty-state">
                <p>No active workout plan assigned.</p>
              </div>
            ) : (
              <div className="workout-schedule">
                {Object.entries(((workoutTemplate.content as WorkoutPlan)?.schedule || {}) as Record<string, any[]>).map(
                  ([day, exercises]) => (
                    <div key={day} className="workout-day">
                      <h4 className="workout-day-title">{day}</h4>
                      {!exercises || exercises.length === 0 ? (
                        <p className="muted">No exercises</p>
                      ) : (
                        <div className="workout-exercises">
                          {exercises.map((ex: any) => {
                            const embed = ex?.videoURL ? toYouTubeEmbed(ex.videoURL) : null;
                            return (
                              <div key={ex.id || ex.name} className="workout-exercise">
                                <div className="workout-exercise-name">{ex.name}</div>
                                <div className="workout-exercise-meta">
                                  {ex.sets}×{ex.reps} • Rest {ex.restPeriod}s
                                  {ex.muscleGroups?.length ? ` • ${ex.muscleGroups.join(', ')}` : ''}
                                </div>
                                {ex.instructions && (
                                  <div className="workout-exercise-notes">{ex.instructions}</div>
                                )}
                                {embed && (
                                  <div className="workout-video">
                                    <iframe
                                      title={`${ex.name} video`}
                                      src={embed}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </Card>
        )}
      </div>
      </div>
    </>
  );
};

export default ClientDashboard;
