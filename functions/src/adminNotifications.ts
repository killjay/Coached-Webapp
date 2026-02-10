import * as functions from 'firebase-functions';
import { CLIENT_STATUS } from './constants';

// Trigger when client status changes (for logging only)
export const onClientFormSubmitted = functions.firestore
  .document('client_profiles/{clientId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      const clientId = context.params.clientId;

      // Check if status changed to 'form_submitted'
      if (beforeData.status !== CLIENT_STATUS.FORM_SUBMITTED && afterData.status === CLIENT_STATUS.FORM_SUBMITTED) {
        console.log(`Client ${clientId} form submitted`);
        console.log(`Client: ${afterData.fullName}, Email: ${afterData.email}`);
      }

      // Check if status changed to 'active' (coach assigned)
      if (beforeData.status !== CLIENT_STATUS.ACTIVE && afterData.status === CLIENT_STATUS.ACTIVE) {
        console.log(`Client ${clientId} activated - coach assigned`);
        console.log(`Client ${afterData.fullName} is now active with coach ${afterData.assignedCoachId}`);
      }
    } catch (error) {
      console.error('Error in onClientFormSubmitted:', error);
    }
  });
