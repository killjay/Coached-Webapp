# 🚀 Complete Seeding Guide - Coaches & Clients

## Quick Command Reference

```bash
# Install dependencies (one time)
npm install firebase-admin dotenv --save-dev

# Seed data
npm run seed:coaches      # Create 4 coaches (do this first!)
npm run seed:clients      # Create 50 clients (requires coaches)

# Verify data (optional)
npm run verify:coaches    # Check coaches in database
npm run verify:clients    # Check clients in database
```

## 📋 Step-by-Step Instructions

### Step 1: Prerequisites ✅

**a) Install dependencies**
```bash
npm install firebase-admin dotenv --save-dev
```

**b) Get Firebase Service Account Key**

1. Visit: https://console.firebase.google.com
2. Select your **Coached** project
3. Click **⚙️ Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. **Save as**: `C:\Projects\Coached\scripts\serviceAccountKey.json`

**c) Ensure `.env` file exists**

Your `.env` file should have Firebase config (already set up):
```
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
```

### Step 2: Seed Coaches 🏋️

```bash
npm run seed:coaches
```

**Expected output:**
```
Starting coach profile seeding...

✅ Created coach: Sarah Johnson (ID: abc123...)
✅ Created coach: Michael Chen (ID: def456...)
✅ Created coach: Emily Rodriguez (ID: ghi789...)
✅ Created coach: David Thompson (ID: jkl012...)

🎉 Successfully seeded 4 coach profiles!
```

### Step 3: Seed Clients 🏃

```bash
npm run seed:clients
```

**Expected output:**
```
🏃 Starting client profile seeding...

✅ Found 4 coaches to assign clients to
   - Sarah Johnson (abc123...)
   - Michael Chen (def456...)
   - Emily Rodriguez (ghi789...)
   - David Thompson (jkl012...)

🎉 Successfully seeded 50 client profiles!

Distribution by Coach:
  Sarah Johnson: 13 clients
  Michael Chen: 13 clients
  Emily Rodriguez: 12 clients
  David Thompson: 12 clients
```

### Step 4: Verify (Optional) ✓

**Check coaches:**
```bash
npm run verify:coaches
```

**Check clients:**
```bash
npm run verify:clients
```

## 📊 What Gets Created

### 🏋️ Coaches Collection: `coach_profiles`

**4 coaches** with:
- Complete profiles (name, email, phone, bio)
- Multiple certifications
- Specializations from app constants
- Weekly availability schedules
- Commission rates (40-50%)
- Performance metrics
- Status: "verified" (ready to assign)

### 🏃 Clients Collection: `client_profiles`

**50 clients** with:
- Complete personal information
- Fitness goals (5 types)
- Medical history
- Assigned to coaches (evenly distributed)
- Plan types (basic/standard/premium)
- Status (80% active, 20% paused)
- Metrics for active clients

## 🎯 Data Distribution

### Coaches (4)
| Coach | Specializations | Clients | Revenue | Rating |
|-------|----------------|---------|---------|--------|
| Sarah Johnson | Strength, Nutrition | 12 | $24.5k | 4.8★ |
| Michael Chen | Sports Performance | 18 | $36.2k | 4.9★ |
| Emily Rodriguez | Yoga, Wellness | 15 | $18.75k | 5.0★ |
| David Thompson | Group Fitness, HIIT | 20 | $42k | 4.7★ |

### Clients (50)
- **Per Coach**: 12-13 clients each
- **Active**: ~40 clients (80%)
- **Paused**: ~10 clients (20%)
- **Plans**: 
  - Basic ($29): ~17 clients
  - Standard ($79): ~17 clients
  - Premium ($149): ~16 clients

## 🔧 Troubleshooting

### Issue: "Cannot find module './serviceAccountKey.json'"

**Solution:**
```bash
# Make sure the file exists
ls scripts/serviceAccountKey.json

# If not, download from Firebase Console (see Step 1b above)
```

### Issue: "No coaches found! Please run seed:coaches first."

**Solution:**
```bash
# Seed coaches before clients
npm run seed:coaches
npm run seed:clients
```

### Issue: "Permission denied" or "403 Forbidden"

**Solution:**
- Check that your service account has Firestore permissions in Firebase Console
- Verify your project ID in `.env` matches Firebase

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Kill existing process
# Then run seeding scripts (they don't need the dev server)
npm run seed:coaches
npm run seed:clients
```

## 📍 Firestore Collections

After seeding, check Firebase Console:

1. **Firestore Database** → **Data**
2. You should see:
   - `coach_profiles` collection (4 documents)
   - `client_profiles` collection (50 documents)

## 🎉 View in Your App

After seeding, view the data:

1. **Start dev server** (if not running)
   ```bash
   npm start
   ```

2. **Navigate to:**
   - http://localhost:5000/enterprise/coaches (view coaches)
   - http://localhost:5000/enterprise/clients (view clients)
   - http://localhost:5000/enterprise/revenue (view metrics)

## 🔄 Re-seeding

To regenerate data:

```bash
# Option 1: Add more data (keeps existing)
npm run seed:coaches
npm run seed:clients

# Option 2: Clear and reseed (manual in Firebase Console)
# - Delete collections
# - Run scripts again
```

## 🔐 Security Reminders

- ✅ `serviceAccountKey.json` is in `.gitignore`
- ✅ Never commit service account keys
- ✅ Never share keys publicly
- ✅ Mock data is safe to regenerate

## 📚 Documentation Files

- **QUICK_START_COACHES.md** - Coach seeding details
- **QUICK_START_CLIENTS.md** - Client seeding details
- **MOCK_DATA_SUMMARY.md** - Complete data overview
- **scripts/README.md** - Technical documentation

## ✨ Success Checklist

- [ ] Dependencies installed
- [ ] Service account key downloaded and placed
- [ ] `.env` file configured
- [ ] Coaches seeded (4 profiles)
- [ ] Clients seeded (50 profiles)
- [ ] Verified in Firebase Console
- [ ] Viewed in application

---

**All done!** You now have 4 coaches and 50 clients in your database ready for testing! 🎉
