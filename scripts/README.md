# Firebase Data Seeding Scripts

This directory contains scripts to seed your Firebase database with test data for development and testing purposes.

## Available Seeding Scripts

### 1. Template Seeding (NEW! ⭐)

Seed workout and nutrition templates with diverse content.

**Quick Start:**
```powershell
# Windows PowerShell
.\scripts\seed-all-templates.ps1

# Or run individual steps:
node scripts/seed-templates.js
node scripts/verify-templates.js
```

**What gets created:**
- 10 Published Workout Templates (beginner to advanced)
- 10 Published Nutrition Templates (various diets and goals)
- 5 Draft Workout Templates
- 5 Draft Nutrition Templates

**Documentation:** See `QUICKSTART.md` or `SEED_TEMPLATES_README.md` for detailed instructions.

---

### 2. Client Data Seeding

This script seeds Firebase with sample client progress data including:
- Body measurements (chest, shoulders, arms, thighs, waist, hips, etc.)
- Weight tracking data (39 weeks of realistic weight loss progression)
- Nutrition plans with meal breakdowns

## Setup

1. Make sure your Firebase configuration is set up in your `.env.local` file:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

2. Download your Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the `scripts/` folder

3. Install dependencies (if not already installed):
   ```bash
   npm install firebase-admin dotenv
   ```

## Running the Scripts

### Seed Templates (Recommended First)
```powershell
# All-in-one command (Windows)
.\scripts\seed-all-templates.ps1

# Or individual commands
node scripts/get-coach-id.js       # Get existing coach ID
node scripts/seed-templates.js     # Seed templates
node scripts/verify-templates.js   # Verify creation
```

### Seed Client Data
```bash
npx ts-node scripts/seedClientData.ts
```

Or if you have ts-node globally installed:
```bash
ts-node scripts/seedClientData.ts
```

Alternatively, compile and run:
```bash
npx tsc scripts/seedClientData.ts
node scripts/seedClientData.js
```

## What Gets Created

### Templates Collection (`templates`)
- **10 Published Workout Templates**: Full body, hypertrophy, athletic, upper/lower, home bodyweight, HIIT, powerlifting, functional, senior, CrossFit
- **10 Published Nutrition Templates**: Weight loss, muscle gain, keto, vegetarian, intermittent fasting, clean eating, high carb, Mediterranean, IIFYM, budget meal prep
- **5 Workout Drafts**: PPL, Olympic lifting, calisthenics, strongman, yoga
- **5 Nutrition Drafts**: Paleo, carnivore, vegan athlete, family meal prep, contest prep

Each template includes:
- Name, description, type (workout/nutrition)
- Difficulty level (beginner/intermediate/advanced)
- Duration in weeks
- Tags for filtering
- Status (published/draft)
- Detailed content (exercises or meal plans)
- Coach ID, timestamps

### Client Progress Data (`client_progress` collection)
For each client in the `client_profiles` collection:

- **Document ID**: matches client ID
- **Weight Entries**: 39 weeks of weight tracking data with:
  - Weekly weight measurements
  - Change from starting weight
  - Progress percentage
  - Date stamps

- **Body Measurements**: 4 milestone measurements (Week 1, 13, 26, 39) including:
  - Chest, shoulders
  - Arms (flexed and unflexed)
  - Forearms
  - Neck
  - Thighs (left and right)
  - Waist, hips, glutes
  - Calves (left and right)

### Nutrition Plans (`nutrition_plans` collection)
- **Document ID**: matches client ID
- **Current Plan**: Active nutrition plan reference
- **Meal Plans**: Complete daily meal breakdown with:
  - Pre-workout meal
  - Post-workout meal
  - Breakfast
  - Snacks
  - Lunch
  - Dinner
- **Macros**: Daily calorie and macro targets (protein, carbs, fats)

## Customizing the Data

### Templates
You can modify `seed-templates.js`:
- Edit `workoutTemplates` array for published workout templates
- Edit `nutritionTemplates` array for published nutrition templates
- Edit `workoutDrafts` and `nutritionDrafts` for draft templates
- Change coach ID to use real coach from your database

### Client Data
You can modify the seed data in `seedClientData.ts`:

- **Weight Data**: Adjust `generateWeightData()` parameters:
  - Starting weight (default: 95 kg)
  - Target weight (default: 80 kg)
  - Number of weeks (default: 39)

- **Body Measurements**: Edit the `generateBodyMeasurements()` function to change measurement values

- **Nutrition Plan**: Modify `createSampleNutritionPlan()` to adjust:
  - Daily calorie targets
  - Macro ratios
  - Meal items and portions

## Firebase Collections Structure

```
Firestore
├── templates/
│   └── {templateId}/
│       ├── name
│       ├── description
│       ├── type (workout/nutrition)
│       ├── difficulty
│       ├── duration
│       ├── coachId
│       ├── tags[]
│       ├── status (published/draft)
│       ├── content {}
│       ├── createdAt
│       └── updatedAt
├── client_profiles/
│   └── {clientId}/
├── client_progress/
│   └── {clientId}/
│       ├── measurements[]
│       ├── weightEntries[]
│       ├── milestones[]
│       ├── lastUpdated
│       └── createdAt
└── nutrition_plans/
    └── {clientId}/
        ├── currentPlan
        ├── plans[]
        ├── createdAt
        └── updatedAt
```

## Helper Scripts

- `get-coach-id.js` - Retrieves the first coach from your database
- `verify-templates.js` - Verifies templates were created and shows statistics
- `seed-all-templates.ps1` - All-in-one PowerShell script for Windows
- `seed-all-templates.sh` - All-in-one Bash script for Mac/Linux

## Notes

- **Templates**: Running the script multiple times will create duplicate templates (it doesn't check for existing ones)
- **Client Data**: The script will only seed data for clients that already exist in the `client_profiles` collection
- Running client data seeding multiple times will **overwrite** existing progress and nutrition data
- Make sure you have write permissions to your Firebase project
- The generated data is realistic but simulated for demonstration purposes

## Troubleshooting

### "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin dotenv
```

### "Cannot find module './serviceAccountKey.json'"
Download your service account key from Firebase Console and save it as `scripts/serviceAccountKey.json`

### Templates not showing in app
- Verify the coach ID matches an authenticated user
- Check Firestore security rules allow reading templates
- Confirm correct Firebase project in `.env.local`

### "PERMISSION_DENIED"
- Service account needs Firestore permissions
- Check Firebase Console → IAM & Admin

## Files in This Directory

- `seed-templates.js` - Main template seeding script
- `seed-all-templates.ps1` - PowerShell runner script
- `seed-all-templates.sh` - Bash runner script
- `get-coach-id.js` - Helper to find coach IDs
- `verify-templates.js` - Verification script
- `QUICKSTART.md` - Quick start guide for templates
- `SEED_TEMPLATES_README.md` - Detailed template documentation
- `seedClientData.ts` - TypeScript client data seeding
- `seed-clients.js` - Create test clients
- `seed-coaches.js` - Create test coaches
- `verify-clients.js` - Verify client creation
- `verify-coaches.js` - Verify coach creation
- `serviceAccountKey.json` - Your Firebase service account key (not in git)
