import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Update coach metrics when client or appointment changes
export const updateCoachMetrics = functions.firestore
  .document('client_profiles/{clientId}')
  .onWrite(async (change, context) => {
    try {
      const newData = change.after.exists ? change.after.data() : null;
      const oldData = change.before.exists ? change.before.data() : null;

      const coachId = newData?.assignedCoachId || oldData?.assignedCoachId;

      if (!coachId) return;

      // Count active clients for this coach
      const clientsSnapshot = await db
        .collection('client_profiles')
        .where('assignedCoachId', '==', coachId)
        .where('status', '==', 'active')
        .get();

      const clientCount = clientsSnapshot.size;

      // Get revenue from subscriptions of this coach's clients
      const clientIds = clientsSnapshot.docs.map(doc => doc.id);
      
      let totalRevenue = 0;
      if (clientIds.length > 0) {
        const subscriptionsSnapshot = await db
          .collection('subscriptions')
          .where('clientId', 'in', clientIds.slice(0, 10)) // Firestore limit
          .where('status', '==', 'active')
          .get();

        subscriptionsSnapshot.forEach(doc => {
          totalRevenue += doc.data().amount || 0;
        });
      }

      // Update coach metrics
      await db.collection('coach_profiles').doc(coachId).set({
        metrics: {
          clientCount,
          totalRevenue,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }
      }, { merge: true });

      console.log(`Updated metrics for coach ${coachId}: ${clientCount} clients, $${totalRevenue} revenue`);
    } catch (error) {
      console.error('Error updating coach metrics:', error);
    }
  });

// Update client metrics when appointments change
export const updateClientMetrics = functions.firestore
  .document('appointments/{appointmentId}')
  .onWrite(async (change, context) => {
    try {
      const newData = change.after.exists ? change.after.data() : null;
      const oldData = change.before.exists ? change.before.data() : null;

      const clientId = newData?.clientId || oldData?.clientId;

      if (!clientId) return;

      // Count completed sessions
      const appointmentsSnapshot = await db
        .collection('appointments')
        .where('clientId', '==', clientId)
        .where('status', '==', 'completed')
        .get();

      const sessionCount = appointmentsSnapshot.size;

      // Get last session date
      let lastSessionDate = null;
      if (appointmentsSnapshot.size > 0) {
        const sessions = appointmentsSnapshot.docs
          .map(doc => doc.data())
          .sort((a, b) => b.endTime.toMillis() - a.endTime.toMillis());
        lastSessionDate = sessions[0]?.endTime;
      }

      // Update client metrics
      await db.collection('client_profiles').doc(clientId).set({
        metrics: {
          sessionCount,
          lastSessionDate,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }
      }, { merge: true });

      console.log(`Updated metrics for client ${clientId}: ${sessionCount} sessions`);
    } catch (error) {
      console.error('Error updating client metrics:', error);
    }
  });
