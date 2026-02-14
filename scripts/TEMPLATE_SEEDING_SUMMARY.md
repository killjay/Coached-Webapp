# Template Seeding - Complete Summary

## 🎉 What Was Created

I've created a comprehensive template seeding system for your Firestore database. Here's everything that's ready to use:

## 📁 New Files Created

### Main Scripts
1. **`seed-templates.js`** - Main seeding script that creates 30 diverse templates
2. **`get-coach-id.js`** - Helper to retrieve coach IDs from your database
3. **`verify-templates.js`** - Verification script to confirm templates were created

### Automation Scripts
4. **`seed-all-templates.ps1`** - PowerShell script to run everything automatically (Windows)
5. **`seed-all-templates.sh`** - Bash script to run everything automatically (Mac/Linux)

### Documentation
6. **`QUICKSTART.md`** - Quick start guide with step-by-step instructions
7. **`SEED_TEMPLATES_README.md`** - Comprehensive documentation
8. **`README.md`** - Updated main README with template seeding info

## 📊 Templates That Will Be Created

### ✅ Published Workout Templates (10)

1. **Full Body Strength Builder** (Beginner, 8 weeks)
   - Tags: Strength, Full Body, Beginner
   - 3 workout days with compound movements

2. **Hypertrophy Mass Program** (Intermediate, 12 weeks)
   - Tags: Hypertrophy, Muscle Gain, Advanced
   - 4 workout days with high volume training

3. **Athletic Performance Training** (Advanced, 10 weeks)
   - Tags: Athletic, Power, Speed
   - Olympic lifts and explosive movements

4. **Upper/Lower Split** (Intermediate, 12 weeks)
   - Tags: Split, Strength, Muscle
   - Classic 4-day training split

5. **Home Bodyweight Circuit** (Beginner, 6 weeks)
   - Tags: Home, Bodyweight, No Equipment
   - No equipment required

6. **Fat Loss HIIT Program** (Intermediate, 8 weeks)
   - Tags: HIIT, Fat Loss, Cardio
   - High-intensity interval training

7. **Powerlifting Focused Training** (Advanced, 16 weeks)
   - Tags: Powerlifting, Strength, Competition
   - Squat, bench, deadlift focused

8. **Functional Fitness** (Beginner, 8 weeks)
   - Tags: Functional, Mobility, Movement
   - Real-world movement patterns

9. **Senior Strength & Mobility** (Beginner, 12 weeks)
   - Tags: Senior, Safety, Balance
   - Safe for older adults

10. **CrossFit Style WODs** (Advanced, 10 weeks)
    - Tags: CrossFit, Conditioning, Intense
    - CrossFit-inspired workouts

### ✅ Published Nutrition Templates (10)

1. **Weight Loss Meal Plan** (Beginner, 8 weeks)
   - 1800 calories: 150g protein, 180g carbs, 50g fats
   - Tags: Weight Loss, Balanced, Sustainable

2. **Muscle Building High Protein** (Intermediate, 12 weeks)
   - 2800 calories: 200g protein, 350g carbs, 70g fats
   - Tags: Muscle Gain, High Protein, Bulking

3. **Keto Fat Loss Plan** (Advanced, 8 weeks)
   - 1800 calories: 130g protein, 30g carbs, 140g fats
   - Tags: Keto, Low Carb, Fat Loss

4. **Vegetarian Meal Plan** (Beginner, 8 weeks)
   - 2000 calories: 120g protein, 250g carbs, 55g fats
   - Tags: Vegetarian, Plant Based, Healthy

5. **Intermittent Fasting 16:8** (Intermediate, 10 weeks)
   - 2000 calories: 160g protein, 200g carbs, 60g fats
   - Tags: Intermittent Fasting, Fat Loss, Time Restricted

6. **Clean Eating Whole Foods** (Beginner, 12 weeks)
   - 2000 calories: 140g protein, 220g carbs, 60g fats
   - Tags: Clean Eating, Whole Foods, Healthy

7. **High Carb Performance Diet** (Intermediate, 10 weeks)
   - 2600 calories: 150g protein, 400g carbs, 50g fats
   - Tags: Performance, High Carb, Endurance

8. **Anti-Inflammatory Mediterranean** (Beginner, 12 weeks)
   - 2000 calories: 120g protein, 200g carbs, 75g fats
   - Tags: Mediterranean, Anti-Inflammatory, Heart Healthy

9. **Flexible Dieting IIFYM** (Intermediate, 12 weeks)
   - 2200 calories: 175g protein, 225g carbs, 65g fats
   - Tags: IIFYM, Flexible, Balanced

10. **Budget-Friendly Meal Prep** (Beginner, 8 weeks)
    - 2100 calories: 150g protein, 250g carbs, 50g fats
    - Tags: Budget, Meal Prep, Affordable

### ✅ Draft Templates (10)

**Workout Drafts (5):**
1. Push Pull Legs (In Progress)
2. Olympic Lifting Program (Draft)
3. Calisthenics Mastery (WIP)
4. Strongman Training (Draft)
5. Yoga & Mobility Flow (Coming Soon)

**Nutrition Drafts (5):**
1. Paleo Diet Plan (Draft)
2. Carnivore Diet (WIP)
3. Vegan Athlete Plan (Coming Soon)
4. Meal Prep for Families (Draft)
5. Contest Prep Final Weeks (WIP)

## 🚀 How to Use

### Option 1: Quick Start (Recommended)

**Windows (PowerShell):**
```powershell
.\scripts\seed-all-templates.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x scripts/seed-all-templates.sh
./scripts/seed-all-templates.sh
```

This will:
1. Check prerequisites
2. Get your coach ID (if available)
3. Seed all 30 templates
4. Verify they were created correctly

### Option 2: Manual Step-by-Step

```powershell
# Step 1: Get a coach ID (optional, informational)
node scripts/get-coach-id.js

# Step 2: Seed the templates
node scripts/seed-templates.js

# Step 3: Verify they were created
node scripts/verify-templates.js
```

## ⚙️ Configuration

### Using a Real Coach ID (Recommended)

1. Get your coach ID:
   ```powershell
   node scripts/get-coach-id.js
   ```

2. Edit `seed-templates.js` line 21:
   ```javascript
   // Change from:
   const mockCoachId = 'coach_seed_' + Date.now();
   
   // To:
   const mockCoachId = 'YOUR_COACH_ID_HERE';
   ```

### Prerequisites

- ✅ `scripts/serviceAccountKey.json` (Firebase service account key)
- ✅ `.env.local` (Firebase configuration)
- ✅ Node.js and npm installed

## 📱 Viewing Templates in Your App

After seeding:

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to: `http://localhost:5000`

3. Go to the Templates page

4. You should see:
   - **"View Published" mode**: 10 workout + 10 nutrition templates
   - **"View Drafts" mode**: 5 workout + 5 nutrition draft templates

## 🎯 What You Can Test

After seeding, test these features:

1. ✅ View templates by type (Workout/Nutrition tabs)
2. ✅ Toggle between Published and Drafts
3. ✅ Filter templates by difficulty
4. ✅ Search templates by name
5. ✅ View template details
6. ✅ Edit a template
7. ✅ Delete a template
8. ✅ Create a new template
9. ✅ Publish a draft template
10. ✅ Assign templates to clients (if feature exists)

## 📖 Documentation

For detailed information, see:

- **`QUICKSTART.md`** - Quick start guide with troubleshooting
- **`SEED_TEMPLATES_README.md`** - Complete documentation
- **`scripts/README.md`** - Overview of all seeding scripts

## 🔧 Troubleshooting

### Templates not showing?
- Verify coach ID matches authenticated user
- Check Firestore security rules
- Confirm correct Firebase project

### Permission errors?
- Ensure service account has Firestore permissions
- Check Firebase Console → IAM & Admin

### Want to customize?
- Edit arrays in `seed-templates.js`:
  - `workoutTemplates` - published workout templates
  - `nutritionTemplates` - published nutrition templates
  - `workoutDrafts` - draft workout templates
  - `nutritionDrafts` - draft nutrition templates

## 🎉 You're All Set!

You now have:
- ✅ 30 diverse templates ready to test
- ✅ Automated seeding scripts
- ✅ Verification tools
- ✅ Comprehensive documentation

Run the seeding script and start testing your template management features!

## 📝 Next Steps

1. Run the seeding script
2. Open your app and verify templates appear
3. Test template CRUD operations
4. Customize templates as needed
5. Add more templates through your app's UI

---

**Questions or Issues?** Check the documentation files or review the inline comments in the scripts.
