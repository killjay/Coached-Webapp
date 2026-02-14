# Template Seeding Script

This script seeds your Firestore database with diverse workout and nutrition templates for testing and demonstration purposes.

## What Gets Created

### Published Templates (20 total)

#### Workout Templates (10)
1. **Full Body Strength Builder** (Beginner, 8 weeks) - Comprehensive full-body workout for building foundational strength
2. **Hypertrophy Mass Program** (Intermediate, 12 weeks) - Advanced muscle-building program with high volume
3. **Athletic Performance Training** (Advanced, 10 weeks) - Sport-specific explosive power and speed training
4. **Upper/Lower Split** (Intermediate, 12 weeks) - Classic 4-day training split
5. **Home Bodyweight Circuit** (Beginner, 6 weeks) - No equipment required home workouts
6. **Fat Loss HIIT Program** (Intermediate, 8 weeks) - High-intensity interval training for fat loss
7. **Powerlifting Focused Training** (Advanced, 16 weeks) - Competition preparation for squat, bench, deadlift
8. **Functional Fitness** (Beginner, 8 weeks) - Real-world movement patterns and mobility
9. **Senior Strength & Mobility** (Beginner, 12 weeks) - Safe program for older adults
10. **CrossFit Style WODs** (Advanced, 10 weeks) - Intense CrossFit-inspired workouts

#### Nutrition Templates (10)
1. **Weight Loss Meal Plan** (Beginner, 8 weeks) - 1800 calories, balanced macros
2. **Muscle Building High Protein** (Intermediate, 12 weeks) - 2800 calories, high protein for gains
3. **Keto Fat Loss Plan** (Advanced, 8 weeks) - 1800 calories, ketogenic diet
4. **Vegetarian Meal Plan** (Beginner, 8 weeks) - 2000 calories, plant-based protein
5. **Intermittent Fasting 16:8** (Intermediate, 10 weeks) - 2000 calories, time-restricted eating
6. **Clean Eating Whole Foods** (Beginner, 12 weeks) - 2000 calories, unprocessed foods
7. **High Carb Performance Diet** (Intermediate, 10 weeks) - 2600 calories for endurance athletes
8. **Anti-Inflammatory Mediterranean** (Beginner, 12 weeks) - 2000 calories, Mediterranean style
9. **Flexible Dieting IIFYM** (Intermediate, 12 weeks) - 2200 calories, macro-based approach
10. **Budget-Friendly Meal Prep** (Beginner, 8 weeks) - 2100 calories, cost-effective meals

### Draft Templates (10 total)

#### Workout Drafts (5)
1. **Push Pull Legs (In Progress)** - Classic PPL split in development
2. **Olympic Lifting Program (Draft)** - Olympic weightlifting focused
3. **Calisthenics Mastery (WIP)** - Progressive bodyweight program
4. **Strongman Training (Draft)** - Event-based strongman training
5. **Yoga & Mobility Flow (Coming Soon)** - Mobility and yoga focused

#### Nutrition Drafts (5)
1. **Paleo Diet Plan (Draft)** - Paleo-based meal planning
2. **Carnivore Diet (WIP)** - All-meat diet template
3. **Vegan Athlete Plan (Coming Soon)** - High-performance vegan meals
4. **Meal Prep for Families (Draft)** - Family-friendly batch cooking
5. **Contest Prep Final Weeks (WIP)** - Bodybuilding contest preparation

## Prerequisites

1. **Service Account Key**: Make sure you have `serviceAccountKey.json` in the scripts folder
   - Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

2. **Environment Variables**: Your `.env` file should contain:
   ```
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   ```

3. **Node.js and Dependencies**: Make sure you have:
   ```bash
   npm install firebase-admin dotenv
   ```

## Running the Script

### Option 1: Direct Node Execution
```bash
node scripts/seed-templates.js
```

### Option 2: Using NPM Script (if configured)
```bash
npm run seed:templates
```

## What Happens When You Run It

The script will:
1. Initialize Firebase Admin SDK with your service account
2. Create a mock coach ID (you can replace this with a real coach ID from your database)
3. Seed 10 published workout templates
4. Seed 10 published nutrition templates
5. Seed 5 draft workout templates
6. Seed 5 draft nutrition templates
7. Display progress for each template created
8. Show a summary of what was created

## Output Example

```
🌱 Starting template seeding...

Using Coach ID: coach_seed_1707854321000

📝 Seeding 10 published workout templates...
  ✓ Created: Full Body Strength Builder (abc123)
  ✓ Created: Hypertrophy Mass Program (def456)
  ...

📝 Seeding 10 published nutrition templates...
  ✓ Created: Weight Loss Meal Plan (ghi789)
  ...

📝 Seeding 5 workout draft templates...
  ✓ Created: Push Pull Legs (In Progress) (jkl012)
  ...

📝 Seeding 5 nutrition draft templates...
  ✓ Created: Paleo Diet Plan (Draft) (mno345)
  ...

✅ Template seeding completed successfully!

Summary:
  • 10 Published Workout Templates
  • 10 Published Nutrition Templates
  • 5 Draft Workout Templates
  • 5 Draft Nutrition Templates
  • Total: 30 Templates

🎉 Seeding complete! You can now view these templates in your app.
```

## Customization

### Using a Real Coach ID

To assign templates to a real coach in your database:

1. Get a coach's user ID from Firestore
2. Replace this line in the script:
   ```javascript
   const mockCoachId = 'coach_seed_' + Date.now();
   ```
   With:
   ```javascript
   const mockCoachId = 'YOUR_ACTUAL_COACH_UID_HERE';
   ```

### Modifying Templates

You can customize any template by editing the arrays in `seed-templates.js`:
- `workoutTemplates` - Published workout templates
- `nutritionTemplates` - Published nutrition templates
- `workoutDrafts` - Draft workout templates
- `nutritionDrafts` - Draft nutrition templates

Each template object has the following structure:

```javascript
{
  name: 'Template Name',
  description: 'Template description',
  type: 'workout' | 'nutrition',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  duration: 8, // weeks
  tags: ['Tag1', 'Tag2'],
  status: 'published' | 'draft',
  content: {
    // For workout templates
    schedule: {
      'Monday': [/* exercises */],
      'Wednesday': [/* exercises */],
      // ...
    },
    
    // For nutrition templates
    macroTargets: { protein, carbs, fats, calories },
    meals: {
      'Day 1': {
        breakfast: [/* meals */],
        'morning-snack': [/* meals */],
        lunch: [/* meals */],
        'evening-snack': [/* meals */],
        dinner: [/* meals */],
      }
    }
  }
}
```

## Important Notes

- Running this script multiple times will create duplicate templates (it doesn't check for existing templates)
- All templates are assigned to the same coach ID specified in the script
- The script uses Firebase Admin SDK, so it bypasses security rules
- Make sure you have write permissions to your Firestore database
- Templates include realistic data suitable for demonstration and testing

## Viewing Your Templates

After seeding, you can view the templates in:
1. **Firebase Console**: Go to Firestore → `templates` collection
2. **Your App**: Navigate to the Templates page in your application

## Troubleshooting

### Error: "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin
```

### Error: "Cannot find module './serviceAccountKey.json'"
- Download your service account key from Firebase Console
- Place it in the `scripts/` folder as `serviceAccountKey.json`

### Error: "PERMISSION_DENIED"
- Make sure your service account has proper permissions
- Check that the project ID in `.env` matches your Firebase project

### Templates Not Showing in App
- Check that the `coachId` in the templates matches a real coach in your system
- Verify that your app's authentication is working correctly
- Check the Firestore security rules allow reading templates

## Firebase Collection Structure

```
Firestore
└── templates/
    ├── {templateId}/
    │   ├── name: string
    │   ├── description: string
    │   ├── type: 'workout' | 'nutrition'
    │   ├── difficulty: 'beginner' | 'intermediate' | 'advanced'
    │   ├── duration: number (weeks)
    │   ├── coachId: string
    │   ├── tags: string[]
    │   ├── status: 'published' | 'draft'
    │   ├── content: object
    │   ├── createdAt: Timestamp
    │   └── updatedAt: Timestamp
```

## Next Steps

After seeding templates, you may want to:
1. Verify templates appear in your app's template management page
2. Test filtering by type (workout/nutrition) and status (published/draft)
3. Test editing and deleting templates
4. Assign templates to test clients
5. Create additional templates using your app's template creation feature

## Need Help?

If you encounter any issues:
1. Check the console output for error messages
2. Verify your Firebase configuration
3. Ensure all prerequisites are met
4. Check Firebase Console for any quota or billing issues
