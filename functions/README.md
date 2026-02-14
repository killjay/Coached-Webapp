# Cloud Functions for Coached

This directory contains Firebase Cloud Functions for the Coached application.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Email Service

You have two options for email configuration:

#### Option A: Using Gmail (Recommended for Development)

1. Create an App Password for your Gmail account:
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"

2. Set the Firebase configuration:
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
   ```

#### Option B: Using SendGrid or another service

Modify the `emailConfig` in `src/index.ts` to use your preferred email service.

### 3. Build the Functions

```bash
npm run build
```

### 4. Test Locally (Optional)

```bash
npm run serve
```

### 5. Deploy to Firebase

```bash
npm run deploy
```

Or from the project root:
```bash
firebase deploy --only functions
```

## Functions

### `onAppointmentCreated`

A Firestore trigger that automatically sends email invites when a new appointment is created.

**Trigger**: `onCreate` event on `appointments/{appointmentId}`

**What it does**:
- Fetches coach and client details from Firestore
- Formats appointment information
- Sends email to both coach and client
- Includes calendar invite (.ics file) attachment
- Handles errors gracefully

**Email includes**:
- Appointment type
- Date and time
- Coach/Client name
- Calendar invite attachment

### `sendAppointmentEmail` (Optional)

An HTTP callable function for manually resending appointment emails.

**Usage**:
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendEmail = httpsCallable(functions, 'sendAppointmentEmail');

await sendEmail({ appointmentId: 'xyz123' });
```

## Environment Variables

The following environment variables can be set:

- `email.user`: Email address to send from
- `email.pass`: Email password or app password

Set them using:
```bash
firebase functions:config:set email.user="value" email.pass="value"
```

View current config:
```bash
firebase functions:config:get
```

## Troubleshooting

### "Invalid login" error with Gmail

Make sure you're using an App Password, not your regular Gmail password. Regular passwords won't work with 2-Step Verification enabled.

### Emails not sending

1. Check function logs:
   ```bash
   firebase functions:log
   ```

2. Verify email configuration:
   ```bash
   firebase functions:config:get
   ```

3. Ensure coach and client profiles have valid email addresses

### "Permission denied" errors

Make sure your Firestore security rules allow the Cloud Function to read coach and client profiles.

## Testing

You can test the email function locally:

1. Start the emulator:
   ```bash
   npm run serve
   ```

2. Create a test appointment in the Firestore emulator UI

3. Check the function logs in the terminal

## Production Considerations

1. **Email Service**: Consider using a professional email service like SendGrid, AWS SES, or Mailgun for production
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Email Templates**: Move email templates to a separate file or database
4. **Error Handling**: Set up error monitoring (e.g., Sentry)
5. **Logging**: Use structured logging for better debugging

## Cost Considerations

- Cloud Functions: Free tier includes 2M invocations/month
- Firestore reads: 2 reads per appointment (coach + client profiles)
- Email service: Varies by provider (Gmail has daily limits)

## Security

- Email credentials are stored in Firebase config (encrypted)
- Function requires authentication for callable functions
- No sensitive data is logged
- Email content is sanitized

## Support

For issues or questions, contact the development team.
