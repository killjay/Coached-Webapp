import React, { useState, useEffect } from 'react';
import { query, where, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { useFirestore } from '../../hooks/useFirestore';
import { ClientProfile, CoachProfile } from '../../types';
import { SUBSCRIPTION_PLANS, CLIENT_STATUS, COACH_STATUS, formatFitnessGoal, UI_MESSAGES } from '../../constants';
import './PendingClients.css';

const PendingClients: React.FC = () => {
  const [pendingClients, setPendingClients] = useState<ClientProfile[]>([]);
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [coachesLoading, setCoachesLoading] = useState(true);
  const { update } = useFirestore('client_profiles');

  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Real-time listener for pending clients
  useEffect(() => {
    const q = query(
      collection(db, 'client_profiles'),
      where('status', '==', CLIENT_STATUS.FORM_SUBMITTED)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClientProfile[];
      setPendingClients(clients);
      setClientsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for active coaches
  useEffect(() => {
    const q = query(
      collection(db, 'coach_profiles'),
      where('status', '==', COACH_STATUS.ACTIVE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coachList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CoachProfile[];
      setCoaches(coachList);
      setCoachesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleViewDetails = (client: ClientProfile) => {
    setSelectedClient(client);
    setSelectedCoach('');
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    setSelectedCoach('');
  };

  const handleAssignCoach = async () => {
    if (!selectedClient || !selectedCoach) {
      alert(UI_MESSAGES.PENDING_CLIENTS.SELECT_COACH_ERROR);
      return;
    }

    setAssigning(true);
    try {
      await update(selectedClient.id, {
        assignedCoachId: selectedCoach,
        status: CLIENT_STATUS.ACTIVE,
        updatedAt: new Date().toISOString(),
      });

      alert(UI_MESSAGES.PENDING_CLIENTS.ASSIGN_SUCCESS(selectedClient.fullName));
      handleCloseModal();
    } catch (error) {
      console.error('Error assigning coach:', error);
      alert(UI_MESSAGES.PENDING_CLIENTS.ASSIGN_ERROR);
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPlanLabel = (planType: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planType);
    return plan ? `${plan.name} ($${plan.price}/mo)` : planType;
  };

  const getGoalLabel = (goal: string) => {
    return formatFitnessGoal(goal);
  };

  if (clientsLoading || coachesLoading) {
    return (
      <div className="pending-clients-page">
        <div className="page-header">
          <h1 className="page-title">Pending Clients</h1>
        </div>
        <Card>
          <div className="loading-state">{UI_MESSAGES.PENDING_CLIENTS.LOADING}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="pending-clients-page">
      <div className="page-header">
        <h1 className="page-title">Pending Clients</h1>
        <p className="page-description">
          Clients who have completed their onboarding form and are waiting for coach assignment
        </p>
      </div>

      {!pendingClients || pendingClients.length === 0 ? (
        <Card>
          <div className="empty-state">
            <p>No pending clients at the moment.</p>
            <p className="empty-state-subtitle">
              Clients who complete their onboarding form will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Submitted Date</th>
                  <th>Requested Plan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.fullName}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{formatDate(client.updatedAt?.toString() || client.createdAt.toString())}</td>
                    <td>
                      <span className="plan-badge">
                        {client.planType ? getPlanLabel(client.planType) : 'Not selected'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleViewDetails(client)}
                      >
                        View & Assign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Client Details & Coach Assignment</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Personal Information */}
              <section className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedClient.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedClient.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedClient.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Requested Plan:</span>
                    <span className="detail-value">
                      {selectedClient.planType ? getPlanLabel(selectedClient.planType) : 'Not selected'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Fitness Goals */}
              {selectedClient.fitnessGoals && (
                <section className="detail-section">
                  <h3>Fitness Goals</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Primary Goal:</span>
                      <span className="detail-value">
                        {getGoalLabel(selectedClient.fitnessGoals.primaryGoal)}
                      </span>
                    </div>
                    {selectedClient.fitnessGoals.targetWeight && (
                      <div className="detail-item">
                        <span className="detail-label">Target Weight:</span>
                        <span className="detail-value">{selectedClient.fitnessGoals.targetWeight} kg</span>
                      </div>
                    )}
                    {selectedClient.fitnessGoals.targetDate && (
                      <div className="detail-item">
                        <span className="detail-label">Target Date:</span>
                        <span className="detail-value">{formatDate(selectedClient.fitnessGoals.targetDate)}</span>
                      </div>
                    )}
                  </div>
                  {selectedClient.fitnessGoals.specificGoals && selectedClient.fitnessGoals.specificGoals.length > 0 && (
                    <div className="detail-item-full">
                      <span className="detail-label">Specific Goals:</span>
                      <ul className="list-items">
                        {selectedClient.fitnessGoals.specificGoals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Medical History */}
              {selectedClient.medicalHistory && (
                <section className="detail-section">
                  <h3>Medical History</h3>
                  {selectedClient.medicalHistory.injuries && selectedClient.medicalHistory.injuries.length > 0 && (
                    <div className="detail-item-full">
                      <span className="detail-label">Injuries:</span>
                      <ul className="list-items">
                        {selectedClient.medicalHistory.injuries.map((injury, idx) => (
                          <li key={idx}>{injury}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedClient.medicalHistory.conditions && selectedClient.medicalHistory.conditions.length > 0 && (
                    <div className="detail-item-full">
                      <span className="detail-label">Medical Conditions:</span>
                      <ul className="list-items">
                        {selectedClient.medicalHistory.conditions.map((condition, idx) => (
                          <li key={idx}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedClient.medicalHistory.medications && selectedClient.medicalHistory.medications.length > 0 && (
                    <div className="detail-item-full">
                      <span className="detail-label">Medications:</span>
                      <ul className="list-items">
                        {selectedClient.medicalHistory.medications.map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedClient.medicalHistory.allergies && selectedClient.medicalHistory.allergies.length > 0 && (
                    <div className="detail-item-full">
                      <span className="detail-label">Allergies:</span>
                      <ul className="list-items">
                        {selectedClient.medicalHistory.allergies.map((allergy, idx) => (
                          <li key={idx}>{allergy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Coach Assignment */}
              <section className="detail-section coach-assignment">
                <h3>Assign Coach</h3>
                <Select
                  label="Select Coach"
                  options={[
                    { value: '', label: 'Choose a coach...' },
                    ...(coaches || []).map((coach) => ({
                      value: coach.id,
                      label: `${coach.fullName} - ${coach.specializations.join(', ')}`,
                    })),
                  ]}
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                />
              </section>
            </div>

            <div className="modal-footer">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleAssignCoach}
                loading={assigning}
                disabled={!selectedCoach || assigning}
              >
                Assign Coach
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingClients;
