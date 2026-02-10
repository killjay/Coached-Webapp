# Seed Coach and Client Profiles Script

This directory contains scripts to seed your Firestore database with realistic mock data.

## Available Scripts

### Coach Profiles
- **seed-coaches.js** - Creates 4 mock coach profiles
- **verify-coaches.js** - Verifies coaches in database

### Client Profiles  
- **seed-clients.js** - Creates 50 mock client profiles (requires coaches)
- **verify-clients.js** - Verifies clients in database

## Mock Data Created

### Coaches (4 total)

1. **Sarah Johnson** - Strength Training & Nutrition Specialist
   - 8+ years experience
   - CSCS certified, Precision Nutrition Level 1
   - 12 clients, $24.5k revenue, 4.8★ rating

2. **Michael Chen** - Functional Training & Sports Performance
   - Former competitive athlete
   - CPT, FMS, Sports Performance Specialist
   - 18 clients, $36.2k revenue, 4.9★ rating

3. **Emily Rodriguez** - Yoga & Wellness Coach
   - Mind-body connection specialist
   - RYT-500, Certified Health Coach
   - 15 clients, $18.75k revenue, 5.0★ rating

4. **David Thompson** - CrossFit & Endurance Specialist
   - CrossFit Level 2, USA Weightlifting Level 1
   - HIIT and Olympic lifting expert
   - 20 clients, $42k revenue, 4.7★ rating

### Clients (50 total)

- **Distribution**: 12-13 clients per coach (evenly distributed)
- **Status**: ~40 active (80%), ~10 paused (20%)
- **Plans**: Mix of basic ($29), standard ($79), premium ($149)
- **Goals**: Weight loss, muscle gain, endurance, flexibility, general fitness
- **Features**: Complete profiles with personal info, fitness goals, medical history, and metrics

## Setup Instructions

### 1. Install Dependencies

```bash
npm install firebase-admin dotenv --save-dev
```

### 2. Get Firebase Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings (gear icon) > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file as `scripts/serviceAccountKey.json`

### 3. Create .env File (if not exists)

Make sure you have a `.env` file in the root directory with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 4. Run the Seeding Scripts

**Step 1: Seed Coaches (do this first)**
```bash
npm run seed:coaches
```

**Step 2: Seed Clients (requires coaches)**
```bash
npm run seed:clients
```

### 5. Verify the Upload (Optional)

Verify coaches:
```bash
npm run verify:coaches
```

Verify clients:
```bash
npm run verify:clients
```

These commands will display all profiles in your Firestore database with details and statistics.

## What Gets Created

Each coach profile includes:
- ✅ Personal information (name, email, phone, bio)
- ✅ Certifications with issue/expiry dates
- ✅ Specializations
- ✅ Weekly availability schedule
- ✅ Commission rate
- ✅ Status set to "verified" (ready to be assigned)
- ✅ Metrics (client count, revenue, sessions, rating)
- ✅ Timestamps (createdAt, updatedAt)

## Important Notes

- All coaches are created with status "verified" so they can be immediately assigned to clients
- Each coach has unique availability schedules
- Realistic metrics are included for dashboard testing
- The service account key should NEVER be committed to version control
- Add `serviceAccountKey.json` to your `.gitignore` file

## Firestore Collection

The coaches are added to: `coach_profiles`

## Security

⚠️ **IMPORTANT**: Add this to your `.gitignore`:

```
scripts/serviceAccountKey.json
```

## Troubleshooting

### "Cannot find module 'firebase-admin'"
Run: `npm install firebase-admin --save-dev`

### "ENOENT: no such file or directory, open './serviceAccountKey.json'"
Make sure you downloaded the service account key and placed it in the `scripts/` folder

### "Permission denied" or "403 Forbidden"
Check that your service account has the necessary permissions in Firebase Console

### "Collection doesn't exist"
The collection will be created automatically when the first document is added
