import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CLIENT_STATUS } from './constants';

const db = admin.firestore();

// Initialize client database when new client is created (no email)
export const initializeClientDatabase = functions.firestore
  .document('client_profiles/{clientId}')
  .onCreate(async (snap, context) => {
    try {
      const clientData = snap.data();
      const clientId = context.params.clientId;

      // Only initialize for pending clients
      if (clientData.status !== CLIENT_STATUS.PENDING) {
        console.log(`Client ${clientId} is not pending, skipping database initialization`);
        return;
      }

      console.log(`Initializing database for client: ${clientId}`);
      
      const batch = db.batch();
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      
      // 1. Create client settings document
      const settingsRef = db.collection('client_settings').doc(clientId);
      batch.set(settingsRef, {
        clientId,
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        preferences: {
          units: 'metric',
          language: 'en',
          theme: 'light',
        },
        privacy: {
          profileVisible: true,
          progressVisible: true,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      // 2. Create initial progress tracking document
      const progressRef = db.collection('client_progress').doc(clientId);
      batch.set(progressRef, {
        clientId,
        measurements: [],
        milestones: [],
        lastUpdated: timestamp,
        createdAt: timestamp,
      });
      
      // 3. Create workout plan collection reference
      const workoutPlanRef = db.collection('workout_plans').doc(clientId);
      batch.set(workoutPlanRef, {
        clientId,
        plans: [],
        currentPlan: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      // 4. Create nutrition plan collection reference
      const nutritionPlanRef = db.collection('nutrition_plans').doc(clientId);
      batch.set(nutritionPlanRef, {
        clientId,
        plans: [],
        currentPlan: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      
      // 5. Create assessment history document
      const assessmentRef = db.collection('client_assessments').doc(clientId);
      batch.set(assessmentRef, {
        clientId,
        assessments: [],
        lastAssessment: null,
        createdAt: timestamp,
      });
      
      // 6. Create activity log document
      const activityRef = db.collection('client_activities').doc(clientId);
      batch.set(activityRef, {
        clientId,
        activities: [],
        totalWorkouts: 0,
        totalDuration: 0,
        lastActivity: null,
        createdAt: timestamp,
      });
      
      // 7. Create notes document (for coach notes)
      const notesRef = db.collection('client_notes').doc(clientId);
      batch.set(notesRef, {
        clientId,
        notes: [],
        createdAt: timestamp,
      });
      
      // Commit all documents at once
      await batch.commit();
      
      console.log(`Client database initialized successfully for: ${clientId}`);
    } catch (error) {
      console.error('Error initializing client database:', error);
    }
  });
