import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Run daily revenue sync at midnight
export const dailyRevenueSync = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('Running daily revenue sync...');

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;

      // Get all active subscriptions
      const subscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('status', '==', 'active')
        .get();

      let totalRevenue = 0;
      let subscriptionCount = 0;

      subscriptionsSnapshot.forEach((doc) => {
        const data = doc.data();
        totalRevenue += data.amount || 0;
        subscriptionCount++;
      });

      // Store daily snapshot
      await db.collection('revenue_metrics').doc(monthKey).set({
        month: monthKey,
        totalRevenue,
        subscriptionCount,
        lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`Daily revenue sync completed: $${totalRevenue}`);
      return null;
    } catch (error) {
      console.error('Error in daily revenue sync:', error);
      return null;
    }
  });

// Send appointment reminders (runs every hour)
export const sendAppointmentReminders = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('Checking for appointment reminders...');

      const now = new Date();
      const reminderWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Get appointments in the next 24 hours
      const appointmentsSnapshot = await db
        .collection('appointments')
        .where('status', '==', 'scheduled')
        .where('startTime', '>=', now)
        .where('startTime', '<=', reminderWindow)
        .get();

      console.log(`Found ${appointmentsSnapshot.size} appointments needing reminders`);

      // Process each appointment
      const batch = db.batch();
      
      for (const doc of appointmentsSnapshot.docs) {
        const appointmentData = doc.data();
        
        // Check if reminder already sent
        const reminderCheck = await db
          .collection('email_logs')
          .where('appointmentId', '==', doc.id)
          .where('type', '==', 'appointment_reminder')
          .get();

        if (reminderCheck.empty) {
          // Get client and coach info
          const clientDoc = await db.collection('client_profiles').doc(appointmentData.clientId).get();
          const coachDoc = await db.collection('coach_profiles').doc(appointmentData.coachId).get();

          const clientEmail = clientDoc.data()?.email;
          const coachEmail = coachDoc.data()?.email;

          console.log(`Reminder would be sent for appointment ${doc.id} to ${clientEmail}`);

          // Log reminder sent
          const logRef = db.collection('email_logs').doc();
          batch.set(logRef, {
            type: 'appointment_reminder',
            appointmentId: doc.id,
            recipients: [clientEmail, coachEmail],
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'sent',
          });
        }
      }

      await batch.commit();
      console.log('Appointment reminders processing completed');
      return null;
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
      return null;
    }
  });
