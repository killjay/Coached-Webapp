import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Calculate monthly revenue when subscription changes
export const calculateMonthlyRevenue = functions.firestore
  .document('subscriptions/{subscriptionId}')
  .onWrite(async (change, context) => {
    try {
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

      // Store aggregated revenue
      await db.collection('revenue_metrics').doc(monthKey).set({
        month: monthKey,
        totalRevenue,
        subscriptionCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`Updated revenue for ${monthKey}: $${totalRevenue}`);
    } catch (error) {
      console.error('Error calculating monthly revenue:', error);
    }
  });

// HTTP callable function to generate revenue report
export const generateRevenueReport = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { startDate, endDate } = data;

    // Get revenue metrics for date range
    const metricsSnapshot = await db
      .collection('revenue_metrics')
      .where('month', '>=', startDate)
      .where('month', '<=', endDate)
      .orderBy('month', 'asc')
      .get();

    const metrics: any[] = [];
    metricsSnapshot.forEach((doc) => {
      metrics.push({ id: doc.id, ...doc.data() });
    });

    // Get subscription breakdown
    const subscriptionsSnapshot = await db
      .collection('subscriptions')
      .where('status', '==', 'active')
      .get();

    const byCoach: { [key: string]: number } = {};
    const byPlan: { [key: string]: number } = {};

    subscriptionsSnapshot.forEach((doc) => {
      const data = doc.data();
      const coachId = data.coachId || 'unassigned';
      const planType = data.planType || 'unknown';

      byCoach[coachId] = (byCoach[coachId] || 0) + (data.amount || 0);
      byPlan[planType] = (byPlan[planType] || 0) + (data.amount || 0);
    });

    return {
      metrics,
      breakdown: {
        byCoach,
        byPlan,
      },
      generatedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error generating revenue report:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
