# Client Data Seeding

This script seeds Firebase with sample client progress data including:
- Body measurements (chest, shoulders, arms, thighs, waist, hips, etc.)
- Weight tracking data (39 weeks of realistic weight loss progression)
- Nutrition plans with meal breakdowns

## Setup

1. Make sure your Firebase configuration is set up in your `.env` file:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

## Running the Script

To seed data for all existing clients in your Firebase:

```bash
npx ts-node scripts/seedClientData.ts
```

Or if you have ts-node globally installed:

```bash
ts-node scripts/seedClientData.ts
```

Alternatively, you can compile and run it:

```bash
npx tsc scripts/seedClientData.ts
node scripts/seedClientData.js
```

## What Gets Created

For each client in the `client_profiles` collection, the script creates:

### 1. Client Progress Data (`client_progress` collection)
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

### 2. Nutrition Plans (`nutrition_plans` collection)
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

## Notes

- The script will only seed data for clients that already exist in the `client_profiles` collection
- Running the script multiple times will **overwrite** existing progress and nutrition data
- Make sure you have write permissions to your Firebase project
- The generated data is realistic but simulated for demonstration purposes
