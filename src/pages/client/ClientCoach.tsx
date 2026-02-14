import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { CoachProfile, ClientProfile } from '../../types';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { formatDate } from '../../utils/dateUtils';
import './ClientCoach.css';

const ClientCoach: React.FC = () => {
  const { user } = useAuth();
  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { getById: getCoach } = useFirestore('coach_profiles');

  useEffect(() => {
    const fetchCoachData = async () => {
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

        // Fetch assigned coach
        if (clientData?.assignedCoachId) {
          const coachData = await getCoach(clientData.assignedCoachId) as CoachProfile;
          setCoach(coachData);
        }
      } catch (error) {
        console.error('Error fetching coach data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [user, getCoach]);

  if (loading) {
    return (
      <div className="client-coach-page">
        <Card>
          <Loader />
        </Card>
      </div>
    );
  }

  if (!client || !coach) {
    return (
      <div className="client-content">
        <div className="client-header">
          <h1>My Coach</h1>
          <p>Your dedicated fitness professional</p>
        </div>
        
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>No coach assigned yet</h3>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>Your coach will be assigned soon and their information will appear here.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="client-coach-page">
      <div className="coach-header-section">
        <h1 className="page-title">My Coach</h1>
      </div>

      {/* Coach Profile Card */}
      <Card className="coach-profile-card">
        <div className="coach-profile-header">
          <div className="coach-avatar-large">
            {coach.photoURL ? (
              <img src={coach.photoURL} alt={coach.fullName} />
            ) : (
              <div className="avatar-placeholder-large">
                {coach.fullName?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
          </div>
          <div className="coach-header-info">
            <h2 className="coach-name">{coach.fullName}</h2>
            <div className="coach-meta">
              <span className="coach-status active">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                  <circle cx="4" cy="4" r="4" />
                </svg>
                Active
              </span>
              {coach.metrics?.rating && (
                <span className="coach-rating">
                  ⭐ {coach.metrics.rating.toFixed(1)} Rating
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="coach-bio-section">
          <h3 className="section-title">About Your Coach</h3>
          <p className="coach-bio">{coach.bio || 'No bio available'}</p>
        </div>

        <div className="coach-contact-section">
          <h3 className="section-title">Contact Information</h3>
          <div className="contact-info">
            <div className="contact-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>{coach.email}</span>
            </div>
            <div className="contact-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <span>{coach.phone}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClientCoach;
