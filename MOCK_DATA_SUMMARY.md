# 📊 Mock Data Seeding - Complete Summary

## Overview

Complete seeding system for generating realistic mock data for your Coached fitness platform.

## Available Scripts

```bash
# Coach Seeding
npm run seed:coaches      # Create 4 coach profiles
npm run verify:coaches    # Verify coaches in database

# Client Seeding  
npm run seed:clients      # Create 50 client profiles (requires coaches)
npm run verify:clients    # Verify clients in database
```

## 🏋️ Coaches (4 Total)

### Sarah Johnson
- **Specializations**: Strength Training, Nutrition Coaching, Personal Training, Cardio & Weight Loss
- **Certifications**: CSCS, Precision Nutrition Level 1
- **Commission**: 45%
- **Metrics**: 12 clients, $24.5k revenue, 156 sessions, 4.8★

### Michael Chen
- **Specializations**: Strength Training, Sports Performance, Rehabilitation, Personal Training
- **Certifications**: CPT, FMS, Sports Performance Specialist
- **Commission**: 50%
- **Metrics**: 18 clients, $36.2k revenue, 224 sessions, 4.9★

### Emily Rodriguez
- **Specializations**: Yoga & Flexibility, Nutrition Coaching, Rehabilitation, Personal Training
- **Certifications**: RYT-500, Certified Health Coach
- **Commission**: 40%
- **Metrics**: 15 clients, $18.75k revenue, 189 sessions, 5.0★

### David Thompson
- **Specializations**: Group Fitness, Cardio & Weight Loss, Strength Training, Sports Performance
- **Certifications**: CrossFit Level 2, USA Weightlifting Level 1, CPT
- **Commission**: 48%
- **Metrics**: 20 clients, $42k revenue, 280 sessions, 4.7★

## 🏃 Clients (50 Total)

### Distribution

**By Coach:**
- Sarah Johnson: ~13 clients
- Michael Chen: ~13 clients  
- Emily Rodriguez: ~12 clients
- David Thompson: ~12 clients

**By Status:**
- Active: ~40 clients (80%)
- Paused: ~10 clients (20%)

**By Plan Type:**
- Basic ($29/mo): ~17 clients
- Standard ($79/mo): ~17 clients
- Premium ($149/mo): ~16 clients

**By Fitness Goals:**
- Weight Loss: ~10 clients
- Muscle Gain: ~10 clients
- Endurance: ~10 clients
- Flexibility: ~10 clients
- General Fitness: ~10 clients

### Client Data Includes

✅ **Personal Information**
- Full name (realistic first/last name combinations)
- Email address (based on name)
- Phone number (+1-555-XXXX format)
- Date of birth (1970-2000)
- Join date (2024-2026)

✅ **Fitness Goals**
- Primary goal (weight loss, muscle gain, etc.)
- Target weight (for weight loss)
- Target date
- Specific achievable goals (2-3 per client)
- Motivational notes

✅ **Medical History**
- Injury history
- Medical conditions
- Current medications
- Allergies
- Additional notes

✅ **Plan & Assignment**
- Subscription plan type (basic/standard/premium)
- Assigned coach ID
- Status (active/paused)
- Created by (admin)

✅ **Metrics (Active Clients)**
- Session count (5-50)
- Last session date
- Current weight
- Progress notes
- Updated timestamps

## 📁 Files Structure

```
C:\Projects\Coached\
│
├── scripts/
│   ├── seed-coaches.js           # Seed 4 coaches
│   ├── verify-coaches.js         # Verify coaches
│   ├── seed-clients.js           # Seed 50 clients
│   ├── verify-clients.js         # Verify clients
│   ├── setup.ps1                 # Windows setup
│   ├── setup.sh                  # Mac/Linux setup
│   ├── README.md                 # Detailed docs
│   └── serviceAccountKey.json    # YOUR Firebase key (download required)
│
├── QUICK_START_COACHES.md        # Coach seeding guide
├── QUICK_START_CLIENTS.md        # Client seeding guide
├── MOCK_COACHES_SUMMARY.md       # Coach data details
├── MOCK_DATA_SUMMARY.md          # This file
└── PROJECT_STRUCTURE.md          # File structure overview
```

## 🚀 Quick Start (First Time)

### Step 1: Install Dependencies
```bash
npm install firebase-admin dotenv --save-dev
```

### Step 2: Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → Settings → Service Accounts
3. Click "Generate New Private Key"
4. Save as `scripts/serviceAccountKey.json`

### Step 3: Seed Coaches
```bash
npm run seed:coaches
```

### Step 4: Seed Clients
```bash
npm run seed:clients
```

### Step 5: Verify (Optional)
```bash
npm run verify:coaches
npm run verify:clients
```

## 📊 Database Collections

### `coach_profiles` Collection
- **Documents**: 4 coaches
- **Status**: All "verified" (ready to assign)
- **Features**: Complete profiles, certifications, metrics, availability

### `client_profiles` Collection
- **Documents**: 50 clients
- **Status**: Mostly "active", some "paused"
- **Features**: Complete profiles, goals, medical history, metrics

## 🎯 Use Cases

### Testing Dashboard
- View revenue by coach
- Track subscription metrics
- Monitor client distribution

### Testing Client Management
- Search and filter clients
- View client details
- Check coach assignments
- Update client status

### Testing Coach Management
- View coach performance
- Check client counts
- Monitor revenue per coach
- View specializations

### Testing Onboarding
- Assign new clients to coaches
- Check coach availability
- Select subscription plans

## 💡 Data Quality

### Realistic Data
- ✅ Proper name combinations
- ✅ Valid email formats
- ✅ Consistent phone numbers
- ✅ Age-appropriate DOBs
- ✅ Recent join dates

### Variety
- ✅ Mixed fitness goals
- ✅ Diverse medical histories
- ✅ Different plan types
- ✅ Various status types
- ✅ Range of session counts

### Relationships
- ✅ Clients assigned to coaches
- ✅ Even distribution
- ✅ Matching specializations with goals
- ✅ Appropriate metrics for status

## 🔧 Troubleshooting

### Common Issues

**"No coaches found"**
```bash
# Seed coaches first
npm run seed:coaches
```

**"Cannot find module './serviceAccountKey.json'"**
- Download from Firebase Console
- Save as `scripts/serviceAccountKey.json`

**"Permission denied"**
- Check Firebase service account permissions
- Verify project ID in `.env`

**Uneven distribution**
- Script automatically balances clients across available coaches
- If you add more coaches later, reseed clients

## 🔐 Security

✅ Service account key in `.gitignore`  
✅ Never committed to Git  
✅ Secure Firebase Admin SDK  
✅ Mock data only (safe to delete)

## 📈 Next Steps

After seeding:

1. **Check Firebase Console**
   - Verify `coach_profiles` collection (4 docs)
   - Verify `client_profiles` collection (50 docs)

2. **Test Your App**
   - Enterprise → Revenue Dashboard
   - Enterprise → Client List
   - Enterprise → Coach List
   - Enterprise → Client Onboard

3. **Customize**
   - Edit `seed-coaches.js` to change coach data
   - Edit `seed-clients.js` to change client count/data
   - Run scripts again to regenerate

## 🎉 Summary

- ✅ **4 coaches** with complete profiles and metrics
- ✅ **50 clients** evenly distributed across coaches
- ✅ **Realistic data** for thorough testing
- ✅ **Easy to regenerate** with npm scripts
- ✅ **Production-ready** structure following your types

---

**Questions?** Check the detailed guides:
- `QUICK_START_COACHES.md` - Coach seeding
- `QUICK_START_CLIENTS.md` - Client seeding  
- `scripts/README.md` - Technical details
