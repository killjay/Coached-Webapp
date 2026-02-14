# Quick Start Guide - Seeding Templates

Follow these steps to seed your Firestore database with test templates.

## Step 1: Prerequisites Check

Make sure you have these files:
- ✅ `scripts/serviceAccountKey.json` (Firebase service account)
- ✅ `.env.local` (Firebase configuration)

If you don't have `serviceAccountKey.json`:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate New Private Key"
5. Save the file as `serviceAccountKey.json` in the `scripts/` folder

## Step 2: Install Dependencies (if needed)

```powershell
npm install firebase-admin dotenv
```

## Step 3: Get a Coach ID (Optional but Recommended)

Option A: Use an existing coach from your database
```powershell
node scripts/get-coach-id.js
```
This will show you the first coach in your database and their ID.

Option B: Use the mock coach ID (default)
The script will automatically create a mock coach ID like `coach_seed_1707854321000`

## Step 4: Run the Seeding Script

```powershell
node scripts/seed-templates.js
```

## Expected Output

You should see something like:

```
🌱 Starting template seeding...

Using Coach ID: coach_seed_1707854321000

📝 Seeding 10 published workout templates...
  ✓ Created: Full Body Strength Builder (KpX7mG4nR9aF2qT8vL3w)
  ✓ Created: Hypertrophy Mass Program (MnY8pH5oS0bG3rU9wM4x)
  ✓ Created: Athletic Performance Training (NqZ9qJ6pT1cH4sV0xN5y)
  ... (7 more)

📝 Seeding 10 published nutrition templates...
  ✓ Created: Weight Loss Meal Plan (PrA0rK7qU2dI5tW1yO6z)
  ✓ Created: Muscle Building High Protein (QsB1sL8rV3eJ6uX2zP7a)
  ... (8 more)

📝 Seeding 5 workout draft templates...
  ✓ Created: Push Pull Legs (In Progress) (RtC2tM9sW4fK7vY3aQ8b)
  ... (4 more)

📝 Seeding 5 nutrition draft templates...
  ✓ Created: Paleo Diet Plan (Draft) (SuD3uN0tX5gL8wZ4bR9c)
  ... (4 more)

✅ Template seeding completed successfully!

Summary:
  • 10 Published Workout Templates
  • 10 Published Nutrition Templates  
  • 5 Draft Workout Templates
  • 5 Draft Nutrition Templates
  • Total: 30 Templates

🎉 Seeding complete! You can now view these templates in your app.
```

## Step 5: Verify in Your App

1. Open your application: `http://localhost:5000` (or your dev server URL)
2. Navigate to the Templates page
3. You should see:
   - 10 workout templates and 10 nutrition templates in "View Published"
   - 5 workout drafts and 5 nutrition drafts in "View Drafts"

## Troubleshooting

### Issue: "Cannot find module 'firebase-admin'"
**Solution:**
```powershell
npm install firebase-admin
```

### Issue: "Cannot find module './serviceAccountKey.json'"
**Solution:** Download your service account key from Firebase Console and save it as `scripts/serviceAccountKey.json`

### Issue: "Error: Could not load the default credentials"
**Solution:** Make sure your `serviceAccountKey.json` file is valid and in the correct location

### Issue: Templates not showing in app
**Possible causes:**
1. Coach ID doesn't match any authenticated user - Use `get-coach-id.js` to get a real coach ID
2. Firestore security rules blocking read access - Check your `firestore.rules` file
3. Wrong Firebase project - Verify your `.env.local` has the correct project ID

### Issue: "PERMISSION_DENIED: Missing or insufficient permissions"
**Solution:** Your service account needs Firestore permissions. Check Firebase Console → IAM & Admin

## What Gets Created

### Published Workout Templates (10):
1. Full Body Strength Builder (Beginner, 8 weeks)
2. Hypertrophy Mass Program (Intermediate, 12 weeks)
3. Athletic Performance Training (Advanced, 10 weeks)
4. Upper/Lower Split (Intermediate, 12 weeks)
5. Home Bodyweight Circuit (Beginner, 6 weeks)
6. Fat Loss HIIT Program (Intermediate, 8 weeks)
7. Powerlifting Focused Training (Advanced, 16 weeks)
8. Functional Fitness (Beginner, 8 weeks)
9. Senior Strength & Mobility (Beginner, 12 weeks)
10. CrossFit Style WODs (Advanced, 10 weeks)

### Published Nutrition Templates (10):
1. Weight Loss Meal Plan (Beginner, 1800 cal)
2. Muscle Building High Protein (Intermediate, 2800 cal)
3. Keto Fat Loss Plan (Advanced, 1800 cal)
4. Vegetarian Meal Plan (Beginner, 2000 cal)
5. Intermittent Fasting 16:8 (Intermediate, 2000 cal)
6. Clean Eating Whole Foods (Beginner, 2000 cal)
7. High Carb Performance Diet (Intermediate, 2600 cal)
8. Anti-Inflammatory Mediterranean (Beginner, 2000 cal)
9. Flexible Dieting IIFYM (Intermediate, 2200 cal)
10. Budget-Friendly Meal Prep (Beginner, 2100 cal)

### Draft Templates (10):
- 5 Workout drafts (PPL, Olympic Lifting, Calisthenics, Strongman, Yoga)
- 5 Nutrition drafts (Paleo, Carnivore, Vegan Athlete, Family Meal Prep, Contest Prep)

## Advanced: Using a Real Coach ID

If you want templates assigned to a real coach:

1. Get the coach ID:
```powershell
node scripts/get-coach-id.js
```

2. Edit `seed-templates.js` and replace line 21:
```javascript
// Change this:
const mockCoachId = 'coach_seed_' + Date.now();

// To this (use the ID from step 1):
const mockCoachId = 'YOUR_ACTUAL_COACH_ID_HERE';
```

3. Run the script again:
```powershell
node scripts/seed-templates.js
```

## Cleaning Up

If you want to remove the seeded templates:

Option 1: Delete manually from Firebase Console
- Go to Firestore → `templates` collection
- Delete templates by their IDs

Option 2: Filter by coach ID
- If you used a mock coach ID like `coach_seed_*`, you can filter and delete all templates by that coach

## Next Steps

After seeding:
1. ✅ Test viewing templates in both Published and Draft modes
2. ✅ Test filtering by workout vs nutrition
3. ✅ Test editing a template
4. ✅ Test deleting a template
5. ✅ Test creating a new template from scratch
6. ✅ Test assigning templates to clients (if that feature exists)

## Need More Help?

Check the detailed documentation in `SEED_TEMPLATES_README.md`
