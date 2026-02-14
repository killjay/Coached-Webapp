# Appointment Email Invites - Quick Reference

## 📧 What Happens When You Schedule an Appointment?

1. **Appointment Created** - User clicks "Create Appointment" in the calendar
2. **Saved to Firestore** - Appointment data is stored in the database
3. **Trigger Activated** - Cloud Function `onAppointmentCreated` fires automatically
4. **Emails Sent** - Both coach and client receive emails with:
   - Appointment details (type, date, time)
   - Calendar invite (.ics file) attachment
   - Professional HTML formatting

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Get Gmail App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll to "App passwords"
3. Generate password for "Mail"
4. Copy the 16-character code

### 3. Configure Firebase
```bash
firebase functions:config:set email.user="your@gmail.com" email.pass="xxxx xxxx xxxx xxxx"
```

### 4. Deploy
```bash
npm run build
firebase deploy --only functions
```

### 5. Test
Create an appointment in the Calendar page!

## 📋 Email Details

### Coach Receives:
**Subject:** New Appointment: TRAINING with John Doe  
**Contains:**
- Appointment type
- Client name
- Date and time
- Status
- Calendar invite attachment

### Client Receives:
**Subject:** Appointment Confirmation: TRAINING with Sarah Smith  
**Contains:**
- Appointment type
- Coach name
- Date and time
- Status
- Calendar invite attachment

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid login" | Use App Password, not regular password |
| No emails sent | Check logs: `firebase functions:log` |
| Emails in spam | Use professional email service (SendGrid) |
| Function not deployed | Run: `firebase deploy --only functions` |

## 📊 Monitoring

```bash
# View logs
firebase functions:log

# Check function status
firebase functions:list

# View configuration
firebase functions:config:get
```

## 💡 Tips

- **Test locally**: Use Firebase emulators before deploying
- **Gmail limits**: 500 emails/day for free accounts
- **Production**: Consider SendGrid or AWS SES for scaling
- **Custom emails**: Edit HTML templates in `functions/src/index.ts`

## 📖 Full Documentation

- **Setup Guide**: `functions/SETUP_GUIDE.md`
- **README**: `functions/README.md`
- **Code**: `functions/src/index.ts`

## 🆘 Need Help?

1. Check `functions/SETUP_GUIDE.md` for detailed instructions
2. Review function logs for errors
3. Verify email configuration is set
4. Ensure coach/client profiles have valid emails
5. Contact development team

---

**Status**: ✅ Feature is production-ready once deployed
