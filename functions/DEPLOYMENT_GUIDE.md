# 🚀 Deployment Guide - Appointment Email Invites

This guide will walk you through deploying the appointment email feature step-by-step.

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Firebase project created
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Gmail account (or alternative email service)
- [ ] Node.js 18+ installed

## Step-by-Step Deployment

### Step 1: Install Cloud Functions Dependencies

Open PowerShell/Terminal in your project root:

```powershell
cd functions
npm install
```

**Expected output:**
```
added 150+ packages in 30s
```

### Step 2: Set Up Gmail App Password

#### A. Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google," click "2-Step Verification"
3. Follow the setup wizard (you'll need your phone)

#### B. Generate App Password
1. After 2-Step is enabled, go back to Security
2. Click "App passwords" (under "Signing in to Google")
3. Select:
   - **App**: Mail
   - **Device**: Other (custom name)
4. Enter name: "Coached App"
5. Click "Generate"
6. **IMPORTANT**: Copy the 16-character password
   - Format: `xxxx xxxx xxxx xxxx`
   - You won't see it again!

### Step 3: Configure Firebase Functions

Still in the `functions` directory:

```bash
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="xxxx xxxx xxxx xxxx"
```

**Replace**:
- `your-email@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the app password you generated

**Verify configuration:**
```bash
firebase functions:config:get
```

**Expected output:**
```json
{
  "email": {
    "user": "your-email@gmail.com",
    "pass": "xxxx xxxx xxxx xxxx"
  }
}
```

### Step 4: Build TypeScript

```bash
npm run build
```

**Expected output:**
```
> tsc

Successfully compiled TypeScript files
```

**Check that `lib/` folder was created:**
```powershell
# PowerShell
Test-Path lib/index.js

# Should return: True
```

### Step 5: Deploy to Firebase

From the `functions` directory:

```bash
npm run deploy
```

Or from the project root:

```bash
firebase deploy --only functions
```

**Expected output:**
```
=== Deploying to 'your-project-id'...

i  deploying functions
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX.XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function onAppointmentCreated...
✔  functions[onAppointmentCreated]: Successful create operation.
Function URL: https://us-central1-your-project.cloudfunctions.net/onAppointmentCreated

✔  Deploy complete!
```

### Step 6: Verify Deployment

Check that the function is live:

```bash
firebase functions:list
```

**Expected output:**
```
┌──────────────────────┬────────────────────────────────────────┬─────────┐
│ Name                 │ Trigger                                │ Region  │
├──────────────────────┼────────────────────────────────────────┼─────────┤
│ onAppointmentCreated │ firestore.document('appointments/{id}')│ us-cent │
└──────────────────────┴────────────────────────────────────────┴─────────┘
```

### Step 7: Test the Feature

1. **Go to the Calendar page** in your app
2. **Click "New Appointment"**
3. **Fill in the form:**
   - Select a coach
   - Select a client
   - Choose date and time
   - Select appointment type
   - Set duration
4. **Click "Create Appointment"**
5. **Check email inboxes:**
   - Coach's inbox
   - Client's inbox
6. **Verify the emails contain:**
   - Appointment details
   - Calendar invite attachment (.ics file)
7. **Click the .ics attachment** to add to calendar

### Step 8: Monitor Function Logs

Watch logs in real-time:

```bash
firebase functions:log --stream
```

Or view recent logs:

```bash
firebase functions:log --only onAppointmentCreated
```

**Look for:**
- ✅ `Emails sent successfully for appointment {id}`
- ❌ Any error messages

## Troubleshooting During Deployment

### Issue: "Invalid credentials" when setting config

**Solution:**
```bash
# Login again
firebase login --reauth

# Then retry config
firebase functions:config:set email.user="..." email.pass="..."
```

### Issue: "Build failed" during deployment

**Solution:**
```bash
# Clear build and reinstall
rm -rf lib node_modules
npm install
npm run build
```

### Issue: "Permission denied" errors

**Solution:**
Update Firestore rules to allow Cloud Functions to read profiles:

```javascript
// firestore.rules
match /coach_profiles/{coachId} {
  allow read: if true; // Cloud Functions need read access
}

match /client_profiles/{clientId} {
  allow read: if true; // Cloud Functions need read access
}
```

Then deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Issue: Function deploys but no emails sent

**Check:**
1. View logs: `firebase functions:log`
2. Verify config: `firebase functions:config:get`
3. Check coach/client profiles have email addresses
4. Test with valid Gmail addresses first

### Issue: Emails go to spam

**Solutions:**
1. Send a test email to yourself first
2. Mark as "Not Spam" in Gmail
3. For production, use SendGrid or AWS SES
4. Set up SPF and DKIM records

## Post-Deployment Checklist

After deployment, verify:
- [ ] Function appears in `firebase functions:list`
- [ ] Test appointment created successfully
- [ ] Coach receives email
- [ ] Client receives email
- [ ] Calendar invite attachment works
- [ ] Event adds to calendar correctly
- [ ] Email formatting looks good
- [ ] No errors in function logs
- [ ] Email configuration is secure

## Rollback (If Needed)

If something goes wrong and you need to rollback:

```bash
# Delete the function
firebase functions:delete onAppointmentCreated

# Or rollback to previous deployment
firebase rollback functions
```

## Environment-Specific Configuration

### Development
```bash
firebase use development
firebase functions:config:set email.user="dev-email@gmail.com" email.pass="..."
firebase deploy --only functions
```

### Production
```bash
firebase use production
firebase functions:config:set email.user="prod-email@gmail.com" email.pass="..."
firebase deploy --only functions
```

## Cost Monitoring

After deployment, monitor costs:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to "Usage" or "Budget & Alerts"
4. Set budget alert (e.g., $10/month)

**Expected costs (Free tier):**
- Appointments per day: 0-100 = $0
- Appointments per day: 100-500 = ~$1-2/month
- Appointments per day: 500+ = Consider SendGrid

## Next Steps After Deployment

1. **Test thoroughly** with real coach and client emails
2. **Monitor logs** for the first few days
3. **Set up alerts** for function errors
4. **Document** the email addresses used
5. **Train users** on how appointments work
6. **Plan scaling** if expecting high volume

## Quick Commands Reference

```bash
# Install dependencies
cd functions && npm install

# Set email config
firebase functions:config:set email.user="..." email.pass="..."

# Build
npm run build

# Deploy
npm run deploy

# View logs
firebase functions:log

# List functions
firebase functions:list

# Delete function
firebase functions:delete onAppointmentCreated
```

## Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review `functions/SETUP_GUIDE.md`
3. Check Firebase Console for errors
4. Verify all prerequisites are met
5. Contact development team

## Success Indicators

You'll know deployment was successful when:
- ✅ Function shows in Firebase Console
- ✅ No errors in deployment logs
- ✅ Test email received by coach
- ✅ Test email received by client
- ✅ Calendar invite works
- ✅ Function logs show success messages

---

**Deployment Time**: ~10-15 minutes  
**Difficulty**: Easy  
**Status**: Ready to deploy

🎉 Once completed, appointments will automatically send email invites!
