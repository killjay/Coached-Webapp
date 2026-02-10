import * as admin from 'firebase-admin';

admin.initializeApp();

// Export all functions
export { calculateMonthlyRevenue, generateRevenueReport } from './revenue';
export { initializeClientDatabase } from './notifications';
export { updateCoachMetrics, updateClientMetrics } from './aggregation';
export { dailyRevenueSync } from './scheduled';
export { onClientFormSubmitted } from './adminNotifications';
