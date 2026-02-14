# Appointment Email Invites - Setup Guide

This guide will help you set up automatic email invites for appointments in the Coached app.

## Overview

When a new appointment is created, the system automatically:
1. Sends an email to the coach with appointment details
2. Sends an email to the client with appointment details
3. Includes a calendar invite (.ics file) that can be added to any calendar app
4. Formats the emails with professional HTML templates

## Quick Start

### Step 1: Install Dependencies

```bash
cd functions
npm install
```

### Step 2: Configure Gmail for Sending Emails

#### A. Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google," select "2-Step Verification"
3. Follow the prompts to set it up

#### B. Generate App Password
1. After enabling 2-Step Verification, go back to Security settings
2. Under "Signing in to Google," select "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Enter "Coached App" as the device name
5. Click "Generate"
6. Copy the 16-character password (you won't see it again!)

#### C. Configure Firebase
```bash
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.pass="xxxx xxxx xxxx xxxx"
```

Replace `your-gmail@gmail.com` with your Gmail address and `xxxx xxxx xxxx xxxx` with the app password you generated.

### Step 3: Build and Deploy

```bash
# Build the TypeScript code
npm run build

# Deploy to Firebase (from project root or functions folder)
firebase deploy --only functions
```

### Step 4: Test

1. Go to the Calendar page in your app
2. Create a new appointment
3. Check both the coach and client email inboxes
4. Verify that the calendar invite can be added to their calendars

## How It Works

### Automatic Trigger

The Cloud Function `onAppointmentCreated` is triggered automatically whenever a new document is created in the `appointments` collection in Firestore.

**Flow:**
```
User creates appointment → Firestore onCreate trigger → Cloud Function runs → Emails sent
```

### What Gets Sent

**Coach Email:**
- Subject: "New Appointment: [TYPE] with [Client Name]"
- Contains: Type, Client name, Date, Time, Status
- Attachment: Calendar invite (.ics file)

**Client Email:**
- Subject: "Appointment Confirmation: [TYPE] with [Coach Name]"
- Contains: Type, Coach name, Date, Time, Status
- Attachment: Calendar invite (.ics file)

### Calendar Invite (.ics)

The .ics file includes:
- Event title
- Description
- Start and end times
- Organizer (coach's email)
- Attendee (client's email)
- 15-minute reminder before the appointment

## Alternative Email Services

If you don't want to use Gmail, you can modify the email configuration in `functions/src/index.ts`:

### SendGrid Example:

```typescript
const emailConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: functions.config().sendgrid?.apikey,
  },
};
```

### AWS SES Example:

```typescript
const emailConfig = {
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  auth: {
    user: functions.config().ses?.user,
    pass: functions.config().ses?.pass,
  },
};
```

## Troubleshooting

### Problem: "Invalid login" error

**Solution:** Make sure you're using an App Password, not your regular Gmail password. App Passwords are required when 2-Step Verification is enabled.

### Problem: Emails not being sent

**Check these:**
1. View function logs: `firebase functions:log`
2. Verify config: `firebase functions:config:get`
3. Check that coach and client profiles have valid email addresses
4. Ensure the function was deployed successfully

### Problem: "Permission denied" in logs

**Solution:** Update your Firestore security rules to allow Cloud Functions to read coach and client profiles:

```javascript
// In firestore.rules
match /coach_profiles/{coachId} {
  allow read: if request.auth != null || request.auth.token.admin == true;
}

match /client_profiles/{clientId} {
  allow read: if request.auth != null || request.auth.token.admin == true;
}
```

### Problem: Emails going to spam

**Solutions:**
1. Use a professional email service (SendGrid, AWS SES, etc.)
2. Set up SPF and DKIM records for your domain
3. Use a verified sender email address
4. Avoid spam trigger words in subject lines

## Monitoring

### View Logs

```bash
# View recent logs
firebase functions:log

# View logs for specific function
firebase functions:log --only onAppointmentCreated

# Stream logs in real-time
firebase functions:log --stream
```

### Check Function Status

```bash
firebase functions:list
```

## Cost Estimates

### Free Tier (Firebase)
- 2M function invocations/month
- 400,000 GB-seconds compute time
- 200,000 CPU-seconds compute time
- 5GB outbound networking

### Per Appointment Cost (Estimated)
- ~0.0001 USD per appointment email
- 2 Firestore reads (coach + client profiles)
- Negligible for most use cases

### Gmail Limits
- 500 emails/day for free Gmail accounts
- 2,000 emails/day for Google Workspace accounts

For higher volumes, consider:
- SendGrid: 100 emails/day free, $19.95/month for 50,000 emails
- AWS SES: $0.10 per 1,000 emails
- Mailgun: 5,000 emails/month free

## Security Best Practices

1. **Never commit credentials** - Use Firebase config or environment variables
2. **Use app passwords** - Don't use your main Gmail password
3. **Validate input** - The function validates coach/client existence
4. **Rate limiting** - Consider implementing rate limits for production
5. **Authentication** - Callable functions require authentication

## Customization

### Modify Email Templates

Edit the HTML content in `functions/src/index.ts`:

```typescript
// Coach email
html: `
  <div style="font-family: Arial, sans-serif;">
    <!-- Your custom HTML here -->
  </div>
`
```

### Add Email Attachments

```typescript
attachments: [
  {
    filename: 'brochure.pdf',
    path: '/path/to/brochure.pdf'
  }
]
```

### Add CC/BCC

```typescript
cc: 'admin@coached.com',
bcc: 'archive@coached.com'
```

## Testing in Development

### Local Testing with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, trigger the function
npm run serve
```

### Send Test Email

Use the callable function to manually send emails:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendEmail = httpsCallable(functions, 'sendAppointmentEmail');

// Send test email
await sendEmail({ appointmentId: 'test-appointment-id' });
```

## Production Checklist

- [ ] Email configuration set up
- [ ] Functions built and deployed
- [ ] Test email sent successfully
- [ ] Calendar invite works
- [ ] Emails not going to spam
- [ ] Logs being monitored
- [ ] Error handling tested
- [ ] Email templates reviewed
- [ ] Rate limiting considered
- [ ] Backup email method ready

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase Functions logs
3. Test with the callable function
4. Check Firestore data integrity
5. Contact the development team

## Next Steps

After email invites are working:
1. Consider adding SMS notifications (Twilio)
2. Add appointment reminders (24 hours before)
3. Implement appointment cancellation emails
4. Add rescheduling notification emails
5. Create email templates for different appointment types
