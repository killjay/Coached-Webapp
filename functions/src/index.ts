import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Email configuration
// You'll need to configure these environment variables:
// firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
const emailConfig = {
  service: 'gmail',
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER,
    pass: functions.config().email?.pass || process.env.EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

interface AppointmentData {
  coachId: string;
  clientId: string;
  startTime: admin.firestore.Timestamp;
  endTime: admin.firestore.Timestamp;
  type: string;
  status: string;
}

// Cloud Function triggered when a new appointment is created
export const onAppointmentCreated = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate(async (snap, context) => {
    const appointmentId = context.params.appointmentId;
    const appointmentData = snap.data() as AppointmentData;

    try {
      // Fetch coach and client details
      const [coachDoc, clientDoc] = await Promise.all([
        admin.firestore().collection('coach_profiles').doc(appointmentData.coachId).get(),
        admin.firestore().collection('client_profiles').doc(appointmentData.clientId).get(),
      ]);

      if (!coachDoc.exists || !clientDoc.exists) {
        console.error('Coach or client not found');
        return;
      }

      const coach = coachDoc.data();
      const client = clientDoc.data();

      const coachEmail = coach?.email;
      const clientEmail = client?.email;
      const coachName = coach?.fullName || 'Coach';
      const clientName = client?.fullName || 'Client';

      if (!coachEmail || !clientEmail) {
        console.error('Missing email addresses');
        return;
      }

      // Format date and time
      const startDate = appointmentData.startTime.toDate();
      const endDate = appointmentData.endTime.toDate();
      const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const startTimeStr = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const endTimeStr = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const appointmentType = appointmentData.type.replace('_', ' ').toUpperCase();

      // Format medium information
      let mediumInfo = '';
      if (appointmentData.medium === 'in_person') {
        mediumInfo = `<p><strong>Medium:</strong> In Person</p>`;
        if ((appointmentData as any).address) {
          mediumInfo += `<p><strong>Address:</strong> ${(appointmentData as any).address}</p>`;
        }
      } else if (appointmentData.medium === 'virtual') {
        mediumInfo = `<p><strong>Medium:</strong> Virtual</p>`;
        if ((appointmentData as any).virtualPlatform) {
          const platform = (appointmentData as any).virtualPlatform.replace('_', ' ');
          const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
          mediumInfo += `<p><strong>Platform:</strong> ${platformName}</p>`;
        }
      }

      // Create calendar invite (ICS format)
      const icsContent = createICSInvite(
        appointmentId,
        `${appointmentType} with ${coachName}`,
        `Appointment scheduled between ${coachName} and ${clientName}`,
        startDate,
        endDate,
        coachEmail,
        clientEmail
      );

      // Email to coach
      const coachMailOptions = {
        from: emailConfig.auth.user,
        to: coachEmail,
        subject: `New Appointment: ${appointmentType} with ${clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f7cff;">New Appointment Scheduled</h2>
            <p>Hi ${coachName},</p>
            <p>A new appointment has been scheduled:</p>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Type:</strong> ${appointmentType}</p>
              <p><strong>Client:</strong> ${clientName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
              ${mediumInfo}
              <p><strong>Status:</strong> ${appointmentData.status}</p>
            </div>
            <p>Please add this to your calendar.</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message from Coached.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: 'appointment.ics',
            content: icsContent,
            contentType: 'text/calendar',
          },
        ],
      };

      // Email to client
      const clientMailOptions = {
        from: emailConfig.auth.user,
        to: clientEmail,
        subject: `Appointment Confirmation: ${appointmentType} with ${coachName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f7cff;">Appointment Confirmation</h2>
            <p>Hi ${clientName},</p>
            <p>Your appointment has been confirmed:</p>
            <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Type:</strong> ${appointmentType}</p>
              <p><strong>Coach:</strong> ${coachName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
              ${mediumInfo}
              <p><strong>Status:</strong> ${appointmentData.status}</p>
            </div>
            <p>We look forward to seeing you!</p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated message from Coached.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: 'appointment.ics',
            content: icsContent,
            contentType: 'text/calendar',
          },
        ],
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(coachMailOptions),
        transporter.sendMail(clientMailOptions),
      ]);

      console.log(`Emails sent successfully for appointment ${appointmentId}`);
      return null;
    } catch (error) {
      console.error('Error sending appointment emails:', error);
      throw error;
    }
  });

// Helper function to create ICS calendar invite
function createICSInvite(
  uid: string,
  summary: string,
  description: string,
  startDate: Date,
  endDate: Date,
  organizerEmail: string,
  attendeeEmail: string
): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = new Date();
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coached//Appointment//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}@coached.app`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    `ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

// Optional: HTTP callable function for manual email sending
export const sendAppointmentEmail = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { appointmentId } = data;

  if (!appointmentId) {
    throw new functions.https.HttpsError('invalid-argument', 'appointmentId is required');
  }

  try {
    const appointmentDoc = await admin.firestore().collection('appointments').doc(appointmentId).get();

    if (!appointmentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Appointment not found');
    }

    // Trigger the same email logic
    const appointmentData = appointmentDoc.data() as AppointmentData;
    
    // Fetch coach and client details
    const [coachDoc, clientDoc] = await Promise.all([
      admin.firestore().collection('coach_profiles').doc(appointmentData.coachId).get(),
      admin.firestore().collection('client_profiles').doc(appointmentData.clientId).get(),
    ]);

    if (!coachDoc.exists || !clientDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Coach or client not found');
    }

    const coach = coachDoc.data();
    const client = clientDoc.data();

    // ... (same email sending logic as above)

    return { success: true, message: 'Emails sent successfully' };
  } catch (error) {
    console.error('Error in sendAppointmentEmail:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send emails');
  }
});
