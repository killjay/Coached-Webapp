# 🏋️ Quick Start Guide: Seeding Coach Profiles

This guide will help you quickly seed 4 realistic coach profiles into your Firestore database.

## ⚡ Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
npm install firebase-admin dotenv --save-dev
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **Coached** project
3. Click **⚙️ Project Settings** → **Service Accounts** tab
4. Click **"Generate New Private Key"** button
5. Download the JSON file
6. **Save it as:** `scripts/serviceAccountKey.json`

### Step 3: Run the Seeding Script

```bash
npm run seed:coaches
```

That's it! You should see:
```
✅ Created coach: Sarah Johnson (ID: abc123...)
✅ Created coach: Michael Chen (ID: def456...)
✅ Created coach: Emily Rodriguez (ID: ghi789...)
✅ Created coach: David Thompson (ID: jkl012...)

🎉 Successfully seeded 4 coach profiles!
```

## ✓ Verify the Upload (Optional)

```bash
npm run verify:coaches
```

This will show you all coaches in your database with their details.

## 📊 What You Get

4 verified coaches with:
- ✅ Complete profiles (name, email, phone, bio)
- ✅ Multiple certifications with dates
- ✅ Specializations from your app's constants
- ✅ Weekly availability schedules
- ✅ Commission rates
- ✅ Performance metrics (clients, revenue, ratings)
- ✅ Status: "verified" (ready to assign)

## 🎯 Coach Summary

| Name | Specializations | Clients | Revenue | Rating |
|------|----------------|---------|---------|--------|
| Sarah Johnson | Strength Training, Nutrition, Personal Training | 12 | $24.5k | 4.8★ |
| Michael Chen | Strength Training, Sports Performance, Rehab | 18 | $36.2k | 4.9★ |
| Emily Rodriguez | Yoga & Flexibility, Nutrition, Rehab | 15 | $18.75k | 5.0★ |
| David Thompson | Group Fitness, Cardio, Strength Training | 20 | $42k | 4.7★ |

## 🔧 Troubleshooting

### "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin dotenv --save-dev
```

### "ENOENT: no such file or directory, open './serviceAccountKey.json'"
- Make sure you downloaded the Firebase service account key
- It must be named exactly: `serviceAccountKey.json`
- It must be in the `scripts/` folder

### "Permission denied" or Authentication errors
- Verify your service account has Firestore permissions
- Check that your Firebase project ID is correct in `.env`

### "Collection doesn't exist"
- Don't worry! Firestore will create the collection automatically

## 🔐 Security Note

The `serviceAccountKey.json` is already in `.gitignore` and will **never** be committed to version control.

## 📚 More Information

- Detailed docs: `scripts/README.md`
- Complete summary: `MOCK_COACHES_SUMMARY.md`
- Service account instructions: `scripts/SERVICE_ACCOUNT_KEY_INSTRUCTIONS.md`

## 🎉 Next Steps

After seeding:
1. Go to your Firebase Console → Firestore Database
2. Find the `coach_profiles` collection
3. You'll see 4 new coach documents
4. In your app, go to **Enterprise → Coaches** to see them
5. Assign them to clients in **Client Onboarding**

---

**Need Help?** Check the detailed README in `scripts/README.md`
