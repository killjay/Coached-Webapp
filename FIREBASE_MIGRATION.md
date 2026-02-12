# Firebase Integration - Client Dashboard

## Overview

The Client Dashboard has been migrated from hardcoded data to Firebase Firestore. Each client now has their own unique measurement data, weight tracking, and nutrition plans stored in Firebase.

## Changes Made

### 1. Type Definitions (`src/types/index.ts`)

Updated the `Measurement` interface to include all body measurements:
```typescript
export interface Measurement {
  date: string;
  week?: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    shoulders?: number;
    leftArm?: number;
    rightArm?: number;
    leftArmFlexed?: number;
    rightArmFlexed?: number;
    leftForearm?: number;
    rightForearm?: number;
    neck?: number;
    leftThigh?: number;
    rightThigh?: number;
    waistMiddle?: number;
    hips?: number;
    glutes?: number;
    leftCalf?: number;
    rightCalf?: number;
  };
  notes?: string;
}
```

Added new `WeightEntry` interface for weight tracking:
```typescript
export interface WeightEntry {
  day: number;
  date: string;
  weight: string; // kg
  change: string; // change from start
  progress: number; // percentage
  weekLabel: string;
}
```

Updated `ClientProgress` to include weight entries:
```typescript
export interface ClientProgress {
  clientId: string;
  measurements: Measurement[];
  weightEntries: WeightEntry[];
  milestones: Milestone[];
  lastUpdated: Timestamp;
  createdAt: Timestamp;
}
```

### 2. Client Dashboard Component (`src/pages/enterprise/ClientDashboard.tsx`)

**Data Fetching:**
- Removed all hardcoded data generation functions
- Added Firebase queries to fetch:
  - `client_progress` collection for measurements and weight data
  - `nutrition_plans` collection for meal plans
- Added state management for fetched data

**Key Changes:**
- `bodyMeasurements`: Now loaded from Firebase instead of hardcoded array
- `weightEntries`: Now loaded from Firebase instead of generated data
- `mealPlan`: Now loaded from Firebase with fallback to default structure
- Added empty state handling for when no data exists

**Chart Updates:**
- All 4 mini-charts (Chest & Shoulders, Arms, Waist & Hips, Thighs) now use Firebase data
- Weight progress chart uses Firebase weight entries
- Added `|| 0` fallbacks for undefined measurements

### 3. Firestore Collections Structure

Three main collections are used:

#### `client_profiles` (existing)
- Contains basic client information
- Document ID: client ID

#### `client_progress` (new)
- Document ID: matches client ID
- Contains:
  - `measurements`: Array of body measurements over time
  - `weightEntries`: Array of weight tracking data
  - `milestones`: Array of achievement milestones
  - `lastUpdated`: Timestamp
  - `createdAt`: Timestamp

#### `nutrition_plans` (new)
- Document ID: matches client ID
- Contains:
  - `clientId`: Reference to client
  - `currentPlan`: ID of active plan
  - `plans`: Array of nutrition plan objects
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### 4. Data Seeding Script

Created `scripts/seed-client-data.js` to populate Firebase with sample data:

**Features:**
- Generates 39 weeks of realistic weight tracking data
- Creates 4 milestone body measurements (Week 1, 13, 26, 39)
- Generates complete nutrition plan with 6 meals per day
- Automatically seeds data for all existing clients

**Usage:**
```bash
npm run seed:client-data
```

## How to Use

### Step 1: Seed Initial Data

Run the seeding script to populate Firebase with sample data for all clients:

```bash
npm run seed:client-data
```

This will:
- Find all clients in `client_profiles` collection
- Create `client_progress` document for each client
- Create `nutrition_plans` document for each client

### Step 2: View Client Dashboard

Navigate to any client dashboard to see their personalized data:
- Weight Progress chart shows their weight tracking
- Mini-charts display body measurements over time
- Meal Plan tab shows their nutrition plan

### Step 3: Customize Data (Optional)

Each client can have unique data by:
1. Modifying the seed script to generate different values per client
2. Manually editing documents in Firebase Console
3. Building admin UI to update measurements and plans

## Data Customization

### Different Data Per Client

To generate different data for each client, modify `seed-client-data.js`:

```javascript
// Example: Different starting/target weights per client
const clientProfiles = {
  'client_id_1': { startWeight: 95, targetWeight: 80 },
  'client_id_2': { startWeight: 110, targetWeight: 95 },
  // ... more clients
};

// In seedClientData function:
const profile = clientProfiles[clientId] || { startWeight: 95, targetWeight: 80 };
const weightEntries = generateWeightData(profile.startWeight, profile.targetWeight, 39);
```

### Manual Updates via Firebase Console

1. Go to Firebase Console > Firestore Database
2. Navigate to `client_progress` or `nutrition_plans` collection
3. Select a client's document
4. Edit fields directly

## Testing

1. Verify data was seeded:
   ```bash
   # Check Firebase Console or run:
   firebase firestore:get client_progress/{clientId}
   ```

2. Test the dashboard:
   - Navigate to any client dashboard
   - Check Overview tab for charts
   - Check Weight Tracker tab for weight table
   - Check Body Measurements tab for measurements grid
   - Check Meal Plan tab for nutrition data

3. Handle edge cases:
   - Client with no data should show "No data available" messages
   - Empty weight entries should show appropriate empty state
   - Missing nutrition plan should show "Not set" placeholders

## Future Enhancements

1. **Admin UI for Data Entry**: Build forms to add/edit measurements and nutrition plans
2. **Real-time Updates**: Add Firestore listeners for live data updates
3. **Data Validation**: Add input validation for measurements
4. **Historical Tracking**: Add date-based filtering and historical views
5. **Goal Setting**: Implement target setting and progress tracking
6. **Export Data**: Add CSV/PDF export functionality
7. **Mobile Responsiveness**: Optimize charts for mobile devices

## Troubleshooting

**No data showing:**
- Verify seed script ran successfully
- Check Firebase Console for documents in collections
- Check browser console for errors

**Charts not rendering:**
- Ensure Chart.js is installed: `npm install chart.js react-chartjs-2`
- Verify data structure matches expected format
- Check for undefined/null values in data

**Firebase permission errors:**
- Update Firestore security rules to allow read/write
- Example rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /client_progress/{clientId} {
      allow read, write: if request.auth != null;
    }
    match /nutrition_plans/{clientId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Files Modified

1. `src/types/index.ts` - Updated type definitions
2. `src/pages/enterprise/ClientDashboard.tsx` - Migrated to Firebase
3. `scripts/seed-client-data.js` - New seeding script
4. `scripts/seedClientData.ts` - TypeScript version (optional)
5. `scripts/README.md` - Seed script documentation
6. `package.json` - Added seed script command

## Summary

The client dashboard now fully integrates with Firebase Firestore, allowing each client to have their own unique measurement data, weight tracking, and nutrition plans. The seeding script provides an easy way to populate sample data, and the system gracefully handles clients with no data through appropriate empty states.
