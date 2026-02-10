# 🏃 Quick Start Guide: Seeding Client Profiles

This guide will help you seed 50 realistic client profiles distributed across your coaches into Firestore.

## ⚡ Quick Setup

### Prerequisites

1. ✅ **Coaches must be seeded first**
   ```bash
   npm run seed:coaches
   ```

2. ✅ **Service account key in place**
   - File location: `scripts/serviceAccountKey.json`
   - See `QUICK_START_COACHES.md` if you don't have it yet

### Seed the Clients

```bash
npm run seed:clients
```

That's it! You should see:
```
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

## ✓ Verify the Upload (Optional)

```bash
npm run verify:clients
```

This will show you statistics and sample clients from your database.

## 📊 What You Get

50 diverse client profiles with:
- ✅ Complete personal info (name, email, phone, DOB)
- ✅ Fitness goals (weight loss, muscle gain, endurance, etc.)
- ✅ Medical history
- ✅ Assigned to coaches (evenly distributed)
- ✅ Plan types (basic, standard, premium)
- ✅ Status (mostly active, some paused)
- ✅ Metrics for active clients (sessions, weight, progress notes)
- ✅ Join dates ranging from 2024-2026

## 📈 Distribution

### By Coach
Each of your 4 coaches gets **12-13 clients** evenly distributed

### By Status
- ~40 **Active** clients (80%)
- ~10 **Paused** clients (20%)

### By Plan Type
- ~17 **Basic** plan clients
- ~17 **Standard** plan clients
- ~16 **Premium** plan clients

### By Fitness Goals
- Weight Loss
- Muscle Gain
- Endurance
- Flexibility
- General Fitness

## 🎯 Client Features

### Personal Information
- Realistic first and last names
- Unique email addresses
- Phone numbers
- Dates of birth (1970-2000)
- Join dates (2024-2026)

### Fitness Goals
- Primary goal from 5 categories
- Target weight (for weight loss goals)
- Target dates
- Specific achievable goals
- Motivational notes

### Medical History
- Injury history
- Medical conditions
- Current medications
- Allergies
- Additional notes

### Metrics (Active Clients Only)
- Session count (5-50 sessions)
- Last session date
- Current weight
- Progress notes
- Updated timestamps

## 🔧 Troubleshooting

### "No coaches found! Please run seed:coaches first."
```bash
# First seed the coaches
npm run seed:coaches

# Then seed the clients
npm run seed:clients
```

### "Cannot find module './serviceAccountKey.json'"
- Make sure you downloaded the Firebase service account key
- It must be named: `serviceAccountKey.json`
- It must be in the `scripts/` folder

### Clients not evenly distributed
The script automatically distributes clients evenly across all existing coaches in your database.

## 🎉 Next Steps

After seeding:

1. **View in Firebase Console**
   - Go to Firestore Database
   - Find the `client_profiles` collection
   - You'll see 50 new client documents

2. **View in Your App**
   - Go to **Enterprise → Client List**
   - See all your clients
   - Filter by coach, status, or plan

3. **Test Features**
   - View client details
   - Check coach assignments
   - Test search and filters
   - View metrics and progress

## 📚 Additional Commands

```bash
# Seed coaches first
npm run seed:coaches

# Verify coaches
npm run verify:coaches

# Seed clients (requires coaches)
npm run seed:clients

# Verify clients
npm run verify:clients
```

## 🔐 Security Note

The `serviceAccountKey.json` is protected in `.gitignore` and will never be committed to Git.

---

**Need more help?** Check the detailed documentation in `scripts/README.md`
