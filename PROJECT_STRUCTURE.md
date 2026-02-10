# 📁 Project Structure - Coach Seeding Files

## Created Files

```
C:\Projects\Coached\
│
├── scripts/
│   ├── seed-coaches.js              # Main seeding script (creates 4 coaches)
│   ├── verify-coaches.js            # Verification script (checks uploaded data)
│   ├── setup.ps1                    # Windows setup script
│   ├── setup.sh                     # Mac/Linux setup script
│   ├── README.md                    # Detailed documentation
│   └── SERVICE_ACCOUNT_KEY_INSTRUCTIONS.md  # How to get Firebase key
│
├── QUICK_START_COACHES.md           # Quick start guide (START HERE!)
├── MOCK_COACHES_SUMMARY.md          # Complete coach data summary
│
└── .gitignore                       # Updated (service account key protected)
```

## Firebase Service Account Key (You Need to Download)

```
C:\Projects\Coached\
└── scripts/
    └── serviceAccountKey.json       # ⚠️ DOWNLOAD THIS FROM FIREBASE!
```

**How to get it:**
1. Firebase Console → Your Project
2. Settings (⚙️) → Service Accounts
3. Generate New Private Key
4. Save as `scripts/serviceAccountKey.json`

## Modified Files

```
C:\Projects\Coached\
├── package.json                     # Added npm scripts:
│                                    #   - npm run seed:coaches
│                                    #   - npm run verify:coaches
│
└── .gitignore                       # Added serviceAccountKey.json protection
```

## NPM Scripts Available

```bash
# Seed coach profiles to Firestore
npm run seed:coaches

# Verify coaches in Firestore
npm run verify:coaches
```

## 📋 Getting Started Checklist

- [ ] Install dependencies: `npm install firebase-admin dotenv --save-dev`
- [ ] Download Firebase service account key
- [ ] Save it as `scripts/serviceAccountKey.json`
- [ ] Run: `npm run seed:coaches`
- [ ] Verify: `npm run verify:coaches` (optional)
- [ ] Check Firebase Console → Firestore → `coach_profiles` collection

## 🎯 What This Does

The seeding script will:
1. Connect to your Firestore database using admin SDK
2. Create 4 coach profile documents in the `coach_profiles` collection
3. Each coach has complete data (profile, certifications, metrics, availability)
4. All coaches are set to "verified" status (ready to assign)

## 📊 Data Created

| Collection | Documents Created | Status |
|------------|------------------|---------|
| `coach_profiles` | 4 coaches | All "verified" |

**Coach Names:**
1. Sarah Johnson - Strength & Nutrition specialist
2. Michael Chen - Sports Performance expert
3. Emily Rodriguez - Yoga & Wellness coach
4. David Thompson - Group Fitness trainer

## 🔐 Security

✅ Service account key is in `.gitignore`
✅ Will never be committed to Git
✅ Uses secure Firebase Admin SDK

## 📖 Documentation Files

1. **QUICK_START_COACHES.md** - Start here! Quick 3-step guide
2. **scripts/README.md** - Detailed setup and troubleshooting
3. **MOCK_COACHES_SUMMARY.md** - Complete data summary
4. **scripts/SERVICE_ACCOUNT_KEY_INSTRUCTIONS.md** - Firebase key guide

---

**Ready?** Start with: `QUICK_START_COACHES.md`
