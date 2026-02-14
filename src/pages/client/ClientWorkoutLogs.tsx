import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ClientProfile, ClientProgress, Measurement } from '../../types';
import '../enterprise/ClientDashboard.css';
import './ClientWorkoutLogs.css';

const ClientWorkoutLogs: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'workout' | 'measurements'>('workout');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [bodyMeasurements, setBodyMeasurements] = useState<Measurement[]>([]);
  const [newMeasurement, setNewMeasurement] = useState({
    chest: '',
    shoulders: '',
    leftArm: '',
    rightArm: '',
    leftArmFlexed: '',
    rightArmFlexed: '',
    leftForearm: '',
    rightForearm: '',
    neck: '',
    leftThigh: '',
    rightThigh: '',
    waistMiddle: '',
    hips: '',
    glutes: '',
    leftCalf: '',
    rightCalf: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Find client profile by email
        const clientQuery = query(collection(db, 'client_profiles'), where('email', '==', user.email));
        const clientSnapshot = await getDocs(clientQuery);
        
        if (clientSnapshot.empty) {
          setLoading(false);
          return;
        }
        
        const clientDoc = clientSnapshot.docs[0];
        const clientData = { id: clientDoc.id, ...clientDoc.data() } as ClientProfile;
        setClient(clientData);

        // Fetch client progress data (measurements)
        const progressDocRef = doc(db, 'client_progress', clientDoc.id);
        const progressDoc = await getDoc(progressDocRef);
        
        if (progressDoc.exists()) {
          const progressData = progressDoc.data() as ClientProgress;
          setBodyMeasurements(progressData.measurements || []);
        } else {
          setBodyMeasurements([]);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleMeasurementChange = (field: string, value: string) => {
    setNewMeasurement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMeasurements = async () => {
    if (!client?.id) return;

    try {
      setSaving(true);

      // Get current date
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // Calculate week number (assuming the first measurement is week 1)
      const weekNumber = bodyMeasurements.length + 1;

      // Create new measurement object
      const measurementData: Measurement = {
        week: `Week ${weekNumber}`,
        date: formattedDate,
        measurements: {
          chest: parseFloat(newMeasurement.chest) || 0,
          shoulders: parseFloat(newMeasurement.shoulders) || 0,
          leftArm: parseFloat(newMeasurement.leftArm) || 0,
          rightArm: parseFloat(newMeasurement.rightArm) || 0,
          leftArmFlexed: parseFloat(newMeasurement.leftArmFlexed) || 0,
          rightArmFlexed: parseFloat(newMeasurement.rightArmFlexed) || 0,
          leftForearm: parseFloat(newMeasurement.leftForearm) || 0,
          rightForearm: parseFloat(newMeasurement.rightForearm) || 0,
          neck: parseFloat(newMeasurement.neck) || 0,
          leftThigh: parseFloat(newMeasurement.leftThigh) || 0,
          rightThigh: parseFloat(newMeasurement.rightThigh) || 0,
          waistMiddle: parseFloat(newMeasurement.waistMiddle) || 0,
          hips: parseFloat(newMeasurement.hips) || 0,
          glutes: parseFloat(newMeasurement.glutes) || 0,
          leftCalf: parseFloat(newMeasurement.leftCalf) || 0,
          rightCalf: parseFloat(newMeasurement.rightCalf) || 0,
        }
      };

      // Update Firestore
      const progressDocRef = doc(db, 'client_progress', client.id);
      await updateDoc(progressDocRef, {
        measurements: arrayUnion(measurementData)
      });

      // Update local state
      setBodyMeasurements(prev => [...prev, measurementData]);

      // Reset form
      setNewMeasurement({
        chest: '',
        shoulders: '',
        leftArm: '',
        rightArm: '',
        leftArmFlexed: '',
        rightArmFlexed: '',
        leftForearm: '',
        rightForearm: '',
        neck: '',
        leftThigh: '',
        rightThigh: '',
        waistMiddle: '',
        hips: '',
        glutes: '',
        leftCalf: '',
        rightCalf: '',
      });

      alert('Measurements saved successfully!');
    } catch (error) {
      console.error('Error saving measurements:', error);
      alert('Failed to save measurements. Please try again.');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="client-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Workout Logs</h1>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          Workout
        </button>
        <button 
          className={`tab ${activeTab === 'measurements' ? 'active' : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          Body Measurements
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <></>
        )}

        {/* Body Measurements Tab */}
        {activeTab === 'measurements' && (
          <>
            {/* Input Form for New Measurements */}
            <Card>
              <h3 className="section-title">Record New Measurements</h3>
              <div className="measurements-form">
                <div className="form-section">
                  <h4>Upper Body</h4>
                  <div className="form-row">
                    <Input
                      label="Chest (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Shoulders (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.shoulders}
                      onChange={(e) => handleMeasurementChange('shoulders', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Arms (Relaxed)</h4>
                  <div className="form-row">
                    <Input
                      label="Left Arm (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.leftArm}
                      onChange={(e) => handleMeasurementChange('leftArm', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Right Arm (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.rightArm}
                      onChange={(e) => handleMeasurementChange('rightArm', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Arms (Flexed)</h4>
                  <div className="form-row">
                    <Input
                      label="Left Arm Flexed (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.leftArmFlexed}
                      onChange={(e) => handleMeasurementChange('leftArmFlexed', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Right Arm Flexed (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.rightArmFlexed}
                      onChange={(e) => handleMeasurementChange('rightArmFlexed', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Forearms</h4>
                  <div className="form-row">
                    <Input
                      label="Left Forearm (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.leftForearm}
                      onChange={(e) => handleMeasurementChange('leftForearm', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Right Forearm (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.rightForearm}
                      onChange={(e) => handleMeasurementChange('rightForearm', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Neck</h4>
                  <div className="form-row">
                    <Input
                      label="Neck (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.neck}
                      onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thighs</h4>
                  <div className="form-row">
                    <Input
                      label="Left Thigh (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.leftThigh}
                      onChange={(e) => handleMeasurementChange('leftThigh', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Right Thigh (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.rightThigh}
                      onChange={(e) => handleMeasurementChange('rightThigh', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Core & Lower Body</h4>
                  <div className="form-row">
                    <Input
                      label="Waist (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.waistMiddle}
                      onChange={(e) => handleMeasurementChange('waistMiddle', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Hips (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.hips}
                      onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="form-row">
                    <Input
                      label="Glutes (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.glutes}
                      onChange={(e) => handleMeasurementChange('glutes', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>Calves</h4>
                  <div className="form-row">
                    <Input
                      label="Left Calf (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.leftCalf}
                      onChange={(e) => handleMeasurementChange('leftCalf', e.target.value)}
                      placeholder="0.0"
                    />
                    <Input
                      label="Right Calf (inches)"
                      type="number"
                      step="0.1"
                      value={newMeasurement.rightCalf}
                      onChange={(e) => handleMeasurementChange('rightCalf', e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button onClick={handleSaveMeasurements} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Measurements'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Display Existing Measurements */}
            {bodyMeasurements.length === 0 && (
              <Card>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <h3 style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>No measurements recorded yet</h3>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Use the form above to record your first measurement.</p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientWorkoutLogs;
