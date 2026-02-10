# Mock Coach Profiles - Summary

## Overview

Created a complete seeding system to generate and upload 4 realistic mock coach profiles directly to Firestore.

## Files Created

1. **`scripts/seed-coaches.js`** - Main seeding script
2. **`scripts/README.md`** - Detailed documentation and instructions
3. **`scripts/setup.ps1`** - PowerShell setup script for Windows
4. **`scripts/setup.sh`** - Bash setup script for Mac/Linux

## Files Modified

1. **`.gitignore`** - Added service account key protection
2. **`package.json`** - Added `seed:coaches` npm script

## Mock Coaches Created

### 1. Sarah Johnson
- **Email**: sarah.johnson@coached.com
- **Phone**: +1-555-0101
- **Specializations**: Strength Training, Nutrition Coaching, Personal Training, Cardio & Weight Loss
- **Certifications**: 
  - CSCS (National Strength and Conditioning Association)
  - Precision Nutrition Level 1
- **Commission Rate**: 45%
- **Status**: Verified
- **Metrics**: 12 clients, $24,500 revenue, 156 sessions, 4.8★ rating
- **Availability**: Mon-Fri (6am-12pm, 4pm-8pm), Sat (8am-2pm)

### 2. Michael Chen
- **Email**: michael.chen@coached.com
- **Phone**: +1-555-0102
- **Specializations**: Strength Training, Sports Performance, Rehabilitation, Personal Training
- **Certifications**: 
  - CPT (American Council on Exercise)
  - Functional Movement Screen (FMS)
  - Sports Performance Specialist (NASM)
- **Commission Rate**: 50%
- **Status**: Verified
- **Metrics**: 18 clients, $36,200 revenue, 224 sessions, 4.9★ rating
- **Availability**: Mon-Thu (7am-1pm, 5pm-9pm), Fri (7am-1pm), Sat (9am-3pm), Sun (9am-1pm)

### 3. Emily Rodriguez
- **Email**: emily.rodriguez@coached.com
- **Phone**: +1-555-0103
- **Specializations**: Yoga & Flexibility, Nutrition Coaching, Rehabilitation, Personal Training
- **Certifications**: 
  - RYT-500 (Yoga Alliance)
  - Certified Health Coach (Institute for Integrative Nutrition)
- **Commission Rate**: 40%
- **Status**: Verified
- **Metrics**: 15 clients, $18,750 revenue, 189 sessions, 5.0★ rating
- **Availability**: Mon-Thu (8am-12pm, 6pm-8pm), Fri (8am-12pm), Sat-Sun (10am-2pm/4pm)

### 4. David Thompson
- **Email**: david.thompson@coached.com
- **Phone**: +1-555-0104
- **Specializations**: Group Fitness, Cardio & Weight Loss, Strength Training, Sports Performance
- **Certifications**: 
  - CrossFit Level 2 Trainer
  - USA Weightlifting Level 1
  - CPT (NASM)
- **Commission Rate**: 48%
- **Status**: Verified
- **Metrics**: 20 clients, $42,000 revenue, 280 sessions, 4.7★ rating
- **Availability**: Mon-Fri (5am-10am, 3pm-7pm), Sat (7am-12pm)

## Data Structure

Each coach profile includes:

```javascript
{
  id: string,                    // Auto-generated Firestore document ID
  userId: string,                // Mock user ID
  fullName: string,
  email: string,
  phone: string,
  bio: string,                   // Detailed professional background
  certifications: [              // Array of certification objects
    {
      name: string,
      issuer: string,
      issueDate: string,         // YYYY-MM-DD format
      expiryDate: string,        // YYYY-MM-DD format
    }
  ],
  specializations: string[],     // Array of specialization areas
  availability: {                // Weekly availability schedule
    monday: [{ startTime: 'HH:mm', endTime: 'HH:mm' }],
    tuesday: [...],
    // ... all days of the week
  },
  commissionRate: number,        // Percentage (0-100)
  status: 'verified',            // Ready to be assigned
  metrics: {                     // Performance metrics
    clientCount: number,
    totalRevenue: number,
    sessionCount: number,
    rating: number,
    updatedAt: Timestamp,
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\setup.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Option 2: Manual Setup

1. Install dependencies:
```bash
npm install firebase-admin dotenv --save-dev
```

2. Download Firebase service account key:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project Settings → Service Accounts
   - Generate New Private Key
   - Save as `scripts/serviceAccountKey.json`

3. Run the seeding script:
```bash
npm run seed:coaches
```

## Security Notes

- ✅ Service account key is added to `.gitignore`
- ✅ Never commit `serviceAccountKey.json` to version control
- ✅ Uses Firebase Admin SDK for secure server-side operations
- ✅ All data is uploaded directly to Firestore with proper timestamps

## Testing

After running the script, verify in Firebase Console:

1. Go to Firestore Database
2. Navigate to `coach_profiles` collection
3. You should see 4 new documents
4. Each document should have all fields populated with realistic data

## Benefits

✅ **Realistic Data**: Detailed bios, multiple certifications, varied specializations
✅ **Complete Profiles**: All required fields populated for immediate use
✅ **Verified Status**: Coaches can be immediately assigned to clients
✅ **Performance Metrics**: Includes client counts, revenue, and ratings for dashboard testing
✅ **Diverse Schedules**: Different availability patterns for scheduling testing
✅ **Production Ready**: Follows exact TypeScript interface structure

## Troubleshooting

See `scripts/README.md` for detailed troubleshooting steps.
