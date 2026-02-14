const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// Helper function to generate exercise data
function generateExercise(name, muscleGroups, sets, reps, restPeriod, instructions) {
  return {
    id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    muscleGroups,
    sets,
    reps,
    restPeriod,
    instructions,
    weight: 0,
    duration: 0,
    notes: ''
  };
}

// Mock workout templates (10 published)
const workoutTemplates = [
  {
    name: 'Full Body Strength Builder',
    description: 'A comprehensive full-body workout designed to build strength across all major muscle groups. Perfect for beginners looking to establish a solid foundation.',
    type: 'workout',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Strength', 'Full Body', 'Beginner'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Barbell Squat', ['Legs', 'Glutes'], 3, 10, 90, 'Keep your back straight, chest up, and lower until thighs are parallel to ground.'),
          generateExercise('Bench Press', ['Chest', 'Triceps'], 3, 10, 90, 'Lower the bar to chest level, then press up explosively.'),
          generateExercise('Bent Over Row', ['Back', 'Biceps'], 3, 10, 90, 'Keep your back straight and pull the bar to your lower chest.'),
          generateExercise('Overhead Press', ['Shoulders'], 3, 8, 90, 'Press the bar overhead while keeping core tight.'),
        ],
        'Wednesday': [
          generateExercise('Romanian Deadlift', ['Hamstrings', 'Lower Back'], 3, 10, 90, 'Hinge at hips, lower bar along shins, keep back straight.'),
          generateExercise('Dumbbell Chest Fly', ['Chest'], 3, 12, 60, 'Lower dumbbells with slight bend in elbows, bring back up with controlled motion.'),
          generateExercise('Lat Pulldown', ['Back'], 3, 12, 60, 'Pull bar down to upper chest, squeeze shoulder blades together.'),
          generateExercise('Lateral Raises', ['Shoulders'], 3, 12, 60, 'Raise dumbbells to shoulder height with slight bend in elbows.'),
        ],
        'Friday': [
          generateExercise('Leg Press', ['Legs', 'Glutes'], 3, 12, 90, 'Press through heels, extend legs without locking knees.'),
          generateExercise('Incline Dumbbell Press', ['Chest'], 3, 10, 90, 'Press dumbbells up from incline bench at 30-45 degree angle.'),
          generateExercise('Cable Row', ['Back'], 3, 12, 60, 'Pull handle to abdomen, squeeze shoulder blades at end of movement.'),
          generateExercise('Face Pulls', ['Shoulders', 'Upper Back'], 3, 15, 60, 'Pull rope to face level, externally rotate shoulders at end.'),
        ],
      },
    },
  },
  {
    name: 'Hypertrophy Mass Program',
    description: 'Advanced muscle-building program focusing on hypertrophy through high volume training. Designed for intermediate lifters looking to maximize muscle growth.',
    type: 'workout',
    difficulty: 'intermediate',
    duration: 12,
    tags: ['Hypertrophy', 'Muscle Gain', 'Advanced'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Barbell Squat', ['Legs'], 4, 8, 120, 'Heavy compound movement for leg development.'),
          generateExercise('Romanian Deadlift', ['Hamstrings'], 4, 10, 90, 'Focus on hamstring stretch and contraction.'),
          generateExercise('Leg Press', ['Legs'], 4, 12, 90, 'High volume leg work.'),
          generateExercise('Walking Lunges', ['Legs', 'Glutes'], 3, 12, 60, 'Each leg, alternating steps.'),
          generateExercise('Leg Curl', ['Hamstrings'], 3, 15, 60, 'Isolation work for hamstrings.'),
        ],
        'Tuesday': [
          generateExercise('Bench Press', ['Chest'], 4, 8, 120, 'Heavy pressing movement.'),
          generateExercise('Incline Dumbbell Press', ['Chest'], 4, 10, 90, 'Target upper chest.'),
          generateExercise('Cable Flyes', ['Chest'], 3, 12, 60, 'Stretch and squeeze chest muscles.'),
          generateExercise('Dips', ['Chest', 'Triceps'], 3, 12, 60, 'Lean forward for chest emphasis.'),
          generateExercise('Tricep Pushdown', ['Triceps'], 4, 15, 45, 'Full extension on each rep.'),
        ],
        'Thursday': [
          generateExercise('Deadlift', ['Back', 'Hamstrings'], 4, 6, 180, 'Heavy compound pull.'),
          generateExercise('Pull-ups', ['Back', 'Biceps'], 4, 10, 90, 'Wide grip for lat development.'),
          generateExercise('Barbell Row', ['Back'], 4, 10, 90, 'Keep torso stable, pull to lower chest.'),
          generateExercise('Face Pulls', ['Upper Back'], 3, 15, 60, 'High reps for rear delts.'),
          generateExercise('Barbell Curl', ['Biceps'], 4, 12, 60, 'Strict form, full range of motion.'),
        ],
        'Friday': [
          generateExercise('Overhead Press', ['Shoulders'], 4, 8, 120, 'Heavy shoulder pressing.'),
          generateExercise('Lateral Raises', ['Shoulders'], 4, 12, 60, 'Controlled raises to shoulder height.'),
          generateExercise('Front Raises', ['Shoulders'], 3, 12, 60, 'Alternate dumbbells or use plate.'),
          generateExercise('Reverse Flyes', ['Shoulders'], 3, 15, 45, 'Target rear delts.'),
          generateExercise('Shrugs', ['Traps'], 4, 12, 60, 'Heavy shrugs for trap development.'),
        ],
      },
    },
  },
  {
    name: 'Athletic Performance Training',
    description: 'Sport-specific training program focusing on explosive power, speed, and agility. Ideal for athletes looking to enhance their performance.',
    type: 'workout',
    difficulty: 'advanced',
    duration: 10,
    tags: ['Athletic', 'Power', 'Speed'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Power Clean', ['Full Body'], 5, 5, 180, 'Explosive Olympic lift for power development.'),
          generateExercise('Box Jumps', ['Legs'], 4, 8, 120, 'Explosive vertical jump onto box.'),
          generateExercise('Front Squat', ['Legs'], 4, 6, 120, 'Maintain upright torso, drive through heels.'),
          generateExercise('Single Leg Box Step-ups', ['Legs'], 3, 10, 90, 'Control descent, explosive ascent.'),
        ],
        'Wednesday': [
          generateExercise('Bench Press', ['Chest'], 4, 5, 180, 'Explosive pressing for upper body power.'),
          generateExercise('Medicine Ball Chest Pass', ['Chest', 'Core'], 4, 10, 60, 'Explosive throws against wall.'),
          generateExercise('Landmine Press', ['Shoulders', 'Core'], 3, 8, 90, 'Rotational power development.'),
          generateExercise('Battle Ropes', ['Full Body'], 4, 30, 60, '30 seconds of waves, full intensity.'),
        ],
        'Friday': [
          generateExercise('Trap Bar Deadlift', ['Legs', 'Back'], 4, 5, 180, 'Heavy pulling for posterior chain.'),
          generateExercise('Broad Jumps', ['Legs'], 4, 6, 120, 'Maximum distance horizontal jumps.'),
          generateExercise('Sled Push', ['Legs', 'Conditioning'], 4, 30, 120, '30 yards each set, moderate weight.'),
          generateExercise('Sprint Intervals', ['Full Body'], 6, 40, 180, '40 yards max effort sprints.'),
        ],
      },
    },
  },
  {
    name: 'Upper/Lower Split',
    description: 'Classic 4-day training split alternating between upper and lower body workouts. Balanced approach for strength and muscle development.',
    type: 'workout',
    difficulty: 'intermediate',
    duration: 12,
    tags: ['Split', 'Strength', 'Muscle'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Bench Press', ['Chest'], 4, 6, 180, 'Heavy compound pressing.'),
          generateExercise('Barbell Row', ['Back'], 4, 8, 120, 'Match pressing with pulling volume.'),
          generateExercise('Overhead Press', ['Shoulders'], 3, 8, 120, 'Strict form, full range.'),
          generateExercise('Pull-ups', ['Back'], 3, 10, 90, 'Add weight if needed.'),
          generateExercise('Dumbbell Curl', ['Biceps'], 3, 12, 60, 'Superset with tricep work.'),
          generateExercise('Skull Crushers', ['Triceps'], 3, 12, 60, 'Control eccentric portion.'),
        ],
        'Tuesday': [
          generateExercise('Squat', ['Legs'], 4, 6, 180, 'Heavy lower body compound.'),
          generateExercise('Romanian Deadlift', ['Hamstrings'], 4, 8, 120, 'Focus on hamstring development.'),
          generateExercise('Leg Press', ['Legs'], 3, 12, 90, 'High volume quad work.'),
          generateExercise('Leg Curl', ['Hamstrings'], 3, 12, 60, 'Isolation for hamstrings.'),
          generateExercise('Calf Raises', ['Calves'], 4, 15, 45, 'Full stretch and contraction.'),
        ],
        'Thursday': [
          generateExercise('Incline Bench Press', ['Chest'], 4, 8, 120, 'Upper chest focus.'),
          generateExercise('Cable Row', ['Back'], 4, 10, 90, 'Chest-supported if possible.'),
          generateExercise('Lateral Raises', ['Shoulders'], 4, 12, 60, 'Controlled raises, peak contraction.'),
          generateExercise('Lat Pulldown', ['Back'], 3, 12, 60, 'Wide grip variation.'),
          generateExercise('Cable Curls', ['Biceps'], 3, 15, 45, 'Constant tension from cables.'),
          generateExercise('Overhead Extension', ['Triceps'], 3, 15, 45, 'Stretch triceps fully.'),
        ],
        'Friday': [
          generateExercise('Deadlift', ['Back', 'Legs'], 4, 5, 180, 'Heavy compound pull.'),
          generateExercise('Front Squat', ['Legs'], 3, 8, 120, 'Quad dominant variation.'),
          generateExercise('Walking Lunges', ['Legs'], 3, 12, 90, 'Each leg alternating.'),
          generateExercise('Leg Extension', ['Quads'], 3, 15, 60, 'Quad isolation.'),
          generateExercise('Seated Calf Raises', ['Calves'], 4, 20, 45, 'Soleus development.'),
        ],
      },
    },
  },
  {
    name: 'Home Bodyweight Circuit',
    description: 'Effective home workout requiring no equipment. Perfect for busy professionals or those traveling without gym access.',
    type: 'workout',
    difficulty: 'beginner',
    duration: 6,
    tags: ['Home', 'Bodyweight', 'No Equipment'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Push-ups', ['Chest', 'Triceps'], 4, 15, 60, 'Keep body straight, full range of motion.'),
          generateExercise('Bodyweight Squats', ['Legs'], 4, 20, 60, 'Sit back into squat, drive through heels.'),
          generateExercise('Pike Push-ups', ['Shoulders'], 3, 12, 60, 'Elevate hips, push vertically.'),
          generateExercise('Plank', ['Core'], 3, 60, 60, 'Hold for 60 seconds, maintain straight body.'),
        ],
        'Wednesday': [
          generateExercise('Jump Squats', ['Legs'], 4, 12, 90, 'Explosive jump from squat position.'),
          generateExercise('Diamond Push-ups', ['Triceps', 'Chest'], 3, 12, 60, 'Hands close together, elbows tucked.'),
          generateExercise('Bulgarian Split Squats', ['Legs'], 3, 12, 60, 'Rear foot elevated, front leg works.'),
          generateExercise('Mountain Climbers', ['Core', 'Cardio'], 4, 30, 60, '30 seconds fast pace.'),
        ],
        'Friday': [
          generateExercise('Burpees', ['Full Body'], 4, 15, 90, 'Full range burpee with jump.'),
          generateExercise('Walking Lunges', ['Legs'], 4, 16, 60, 'Controlled movement, alternating legs.'),
          generateExercise('Decline Push-ups', ['Chest'], 3, 15, 60, 'Feet elevated for difficulty.'),
          generateExercise('Bicycle Crunches', ['Core'], 4, 30, 45, 'Alternate elbow to opposite knee.'),
        ],
      },
    },
  },
  {
    name: 'Fat Loss HIIT Program',
    description: 'High-intensity interval training designed to maximize calorie burn and boost metabolism. Combines cardio and resistance for optimal fat loss.',
    type: 'workout',
    difficulty: 'intermediate',
    duration: 8,
    tags: ['HIIT', 'Fat Loss', 'Cardio'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Kettlebell Swings', ['Full Body'], 5, 20, 60, 'Explosive hip drive, power movement.'),
          generateExercise('Box Jumps', ['Legs'], 5, 10, 60, 'Jump onto box, step down carefully.'),
          generateExercise('Battle Ropes', ['Full Body'], 5, 30, 60, '30 seconds all-out effort.'),
          generateExercise('Burpees', ['Full Body'], 5, 15, 60, 'Maximum intensity on each rep.'),
        ],
        'Wednesday': [
          generateExercise('Sprint Intervals', ['Cardio'], 8, 30, 90, '30 seconds sprint, 90 seconds walk.'),
          generateExercise('Jump Rope', ['Cardio'], 5, 60, 60, 'Fast pace for 60 seconds.'),
          generateExercise('High Knees', ['Cardio', 'Legs'], 5, 30, 60, 'Maximum intensity for 30 seconds.'),
          generateExercise('Mountain Climbers', ['Core'], 5, 45, 60, 'Fast pace, 45 seconds.'),
        ],
        'Friday': [
          generateExercise('Rowing Machine', ['Full Body'], 6, 45, 90, '45 seconds max effort, 90 seconds easy.'),
          generateExercise('Medicine Ball Slams', ['Full Body'], 5, 15, 60, 'Explosive full body movement.'),
          generateExercise('Jump Squats', ['Legs'], 5, 15, 60, 'Explosive jumps from squat.'),
          generateExercise('Plank Jacks', ['Core'], 5, 30, 60, 'Jump feet in and out while in plank.'),
        ],
      },
    },
  },
  {
    name: 'Powerlifting Focused Training',
    description: 'Specialized program for powerlifting competition preparation. Focuses on maximizing strength in squat, bench press, and deadlift.',
    type: 'workout',
    difficulty: 'advanced',
    duration: 16,
    tags: ['Powerlifting', 'Strength', 'Competition'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Competition Squat', ['Legs'], 5, 3, 300, 'Heavy singles and triples, competition form.'),
          generateExercise('Pause Squat', ['Legs'], 3, 5, 240, '2-second pause at bottom.'),
          generateExercise('Front Squat', ['Legs'], 3, 6, 180, 'Quad development and carryover.'),
        ],
        'Wednesday': [
          generateExercise('Competition Bench Press', ['Chest'], 5, 3, 300, 'Heavy triples, competition pause.'),
          generateExercise('Close Grip Bench', ['Triceps'], 4, 5, 180, 'Tricep strength for lockout.'),
          generateExercise('Overhead Press', ['Shoulders'], 3, 6, 150, 'General upper body strength.'),
        ],
        'Friday': [
          generateExercise('Competition Deadlift', ['Back', 'Legs'], 5, 3, 300, 'Heavy pulls with competition form.'),
          generateExercise('Deficit Deadlift', ['Back'], 3, 5, 240, '1-2 inch deficit for starting strength.'),
          generateExercise('Romanian Deadlift', ['Hamstrings'], 3, 8, 180, 'Hamstring and lockout strength.'),
        ],
      },
    },
  },
  {
    name: 'Functional Fitness',
    description: 'Real-world movement patterns and functional exercises. Improves everyday strength, mobility, and movement quality.',
    type: 'workout',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Functional', 'Mobility', 'Movement'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Goblet Squat', ['Legs'], 3, 12, 90, 'Hold kettlebell at chest, deep squat.'),
          generateExercise('Turkish Get-up', ['Full Body'], 3, 5, 120, 'Each side, controlled movement.'),
          generateExercise('Farmer Carries', ['Full Body'], 3, 40, 90, '40 yards with heavy weight.'),
          generateExercise('Dead Bug', ['Core'], 3, 12, 60, 'Opposite arm and leg, maintain contact with floor.'),
        ],
        'Wednesday': [
          generateExercise('Single Leg Deadlift', ['Hamstrings', 'Balance'], 3, 10, 90, 'Each leg, focus on balance.'),
          generateExercise('Landmine Press', ['Shoulders', 'Core'], 3, 10, 90, 'Standing, anti-rotation.'),
          generateExercise('Pallof Press', ['Core'], 3, 12, 60, 'Resist rotation from cable.'),
          generateExercise('Bird Dog', ['Core', 'Back'], 3, 12, 60, 'Opposite arm and leg extension.'),
        ],
        'Friday': [
          generateExercise('Trap Bar Deadlift', ['Full Body'], 3, 8, 120, 'More upright than conventional deadlift.'),
          generateExercise('Sled Push', ['Legs'], 4, 30, 120, '30 yards moderate weight.'),
          generateExercise('Cable Chop', ['Core'], 3, 12, 60, 'High to low rotational movement.'),
          generateExercise('Plank Variations', ['Core'], 3, 45, 60, 'Mix of side planks and regular.'),
        ],
      },
    },
  },
  {
    name: 'Senior Strength & Mobility',
    description: 'Safe and effective program designed for older adults. Focuses on maintaining strength, balance, and functional mobility.',
    type: 'workout',
    difficulty: 'beginner',
    duration: 12,
    tags: ['Senior', 'Safety', 'Balance'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Chair Squats', ['Legs'], 3, 12, 90, 'Sit and stand from chair with control.'),
          generateExercise('Wall Push-ups', ['Chest'], 3, 10, 60, 'Push-ups against wall, easier variation.'),
          generateExercise('Resistance Band Rows', ['Back'], 3, 12, 60, 'Pull band to chest, squeeze shoulder blades.'),
          generateExercise('Standing Calf Raises', ['Calves'], 3, 15, 60, 'Hold wall for balance if needed.'),
        ],
        'Wednesday': [
          generateExercise('Step-ups', ['Legs', 'Balance'], 3, 10, 90, 'Use low step, each leg.'),
          generateExercise('Shoulder Press with Bands', ['Shoulders'], 3, 12, 60, 'Overhead press with resistance band.'),
          generateExercise('Bicep Curls', ['Biceps'], 3, 12, 60, 'Light dumbbells or bands.'),
          generateExercise('Balance on One Leg', ['Balance'], 3, 30, 60, '30 seconds each leg, use wall for support.'),
        ],
        'Friday': [
          generateExercise('Modified Lunges', ['Legs'], 3, 10, 90, 'Shorter range, hold wall for balance.'),
          generateExercise('Chest Press with Bands', ['Chest'], 3, 12, 60, 'Press bands away from chest.'),
          generateExercise('Seated Row', ['Back'], 3, 12, 60, 'Pull band to torso while seated.'),
          generateExercise('Tai Chi Movements', ['Balance', 'Mobility'], 3, 60, 60, 'Slow controlled movements for balance.'),
        ],
      },
    },
  },
  {
    name: 'CrossFit Style WODs',
    description: 'Intense CrossFit-inspired workouts of the day. High-intensity functional movements combining cardio, gymnastics, and weightlifting.',
    type: 'workout',
    difficulty: 'advanced',
    duration: 10,
    tags: ['CrossFit', 'Conditioning', 'Intense'],
    status: 'published',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Thrusters', ['Full Body'], 5, 21, 120, '21-15-9 rep scheme with pull-ups (Fran WOD).'),
          generateExercise('Pull-ups', ['Back'], 5, 21, 120, 'Kipping allowed for speed.'),
        ],
        'Wednesday': [
          generateExercise('Deadlift', ['Back', 'Legs'], 5, 21, 120, '21-15-9 with handstand push-ups (Diane WOD).'),
          generateExercise('Handstand Push-ups', ['Shoulders'], 5, 21, 120, 'Scale to pike push-ups if needed.'),
        ],
        'Friday': [
          generateExercise('Power Cleans', ['Full Body'], 7, 15, 180, 'Every 2 minutes for 20 minutes (EMOM).'),
          generateExercise('Box Jumps', ['Legs'], 7, 15, 180, 'Alternate with power cleans each minute.'),
          generateExercise('Rowing', ['Cardio'], 7, 250, 180, '250 meters each round.'),
        ],
      },
    },
  },
];

// Mock nutrition templates (10 published)
const nutritionTemplates = [
  {
    name: 'Weight Loss Meal Plan',
    description: 'Balanced calorie-deficit meal plan designed for sustainable weight loss. Includes high protein, moderate carbs, and healthy fats.',
    type: 'nutrition',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Weight Loss', 'Balanced', 'Sustainable'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 150,
        carbs: 180,
        fats: 50,
        calories: 1800,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Protein Oatmeal Bowl',
            ingredients: ['1 cup oats', '1 scoop whey protein', '1 banana', '1 tbsp almond butter'],
            instructions: 'Cook oats, stir in protein powder, top with sliced banana and almond butter.',
            macros: { protein: 35, carbs: 60, fats: 12, calories: 480 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Greek Yogurt',
            ingredients: ['1 cup Greek yogurt', '1/2 cup berries'],
            instructions: 'Mix yogurt with fresh berries.',
            macros: { protein: 20, carbs: 20, fats: 3, calories: 190 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Grilled Chicken Salad',
            ingredients: ['6oz chicken breast', '2 cups mixed greens', '1/4 cup quinoa', 'balsamic vinegar'],
            instructions: 'Grill chicken, serve over greens with quinoa and vinegar.',
            macros: { protein: 50, carbs: 35, fats: 8, calories: 410 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Protein Shake',
            ingredients: ['1 scoop protein', '1 cup almond milk', '1 tbsp peanut butter'],
            instructions: 'Blend all ingredients.',
            macros: { protein: 30, carbs: 10, fats: 10, calories: 250 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Baked Salmon with Vegetables',
            ingredients: ['6oz salmon', '2 cups broccoli', '1 cup sweet potato'],
            instructions: 'Bake salmon at 400F for 15 minutes, steam broccoli, roast sweet potato.',
            macros: { protein: 45, carbs: 40, fats: 15, calories: 470 }
          }],
        },
      },
    },
  },
  {
    name: 'Muscle Building High Protein',
    description: 'High-calorie meal plan designed for muscle gain. Emphasizes protein intake and strategic carb timing around workouts.',
    type: 'nutrition',
    difficulty: 'intermediate',
    duration: 12,
    tags: ['Muscle Gain', 'High Protein', 'Bulking'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 200,
        carbs: 350,
        fats: 70,
        calories: 2800,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Mass Gainer Breakfast',
            ingredients: ['4 whole eggs', '2 cups oatmeal', '2 tbsp peanut butter', '1 banana'],
            instructions: 'Scramble eggs, cook oatmeal, mix peanut butter into oats, serve with banana.',
            macros: { protein: 40, carbs: 80, fats: 25, calories: 680 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Protein Shake with Oats',
            ingredients: ['2 scoops protein', '1/2 cup oats', '2 cups whole milk'],
            instructions: 'Blend all ingredients until smooth.',
            macros: { protein: 60, carbs: 50, fats: 12, calories: 540 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Chicken and Rice Bowl',
            ingredients: ['8oz chicken breast', '2 cups white rice', '1 cup mixed vegetables', 'teriyaki sauce'],
            instructions: 'Grill chicken, cook rice, stir-fry vegetables, combine with sauce.',
            macros: { protein: 60, carbs: 90, fats: 10, calories: 670 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Post-Workout Shake',
            ingredients: ['2 scoops protein', '1 banana', '2 tbsp honey', '2 cups almond milk'],
            instructions: 'Blend all ingredients, consume within 30 minutes of training.',
            macros: { protein: 50, carbs: 60, fats: 8, calories: 500 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Steak with Potatoes',
            ingredients: ['8oz ribeye steak', '2 large baked potatoes', '2 cups asparagus'],
            instructions: 'Grill steak to desired doneness, bake potatoes, roast asparagus.',
            macros: { protein: 55, carbs: 70, fats: 20, calories: 670 }
          }],
        },
      },
    },
  },
  {
    name: 'Keto Fat Loss Plan',
    description: 'Low-carb, high-fat ketogenic diet for rapid fat loss. Focuses on keeping body in ketosis while maintaining muscle mass.',
    type: 'nutrition',
    difficulty: 'advanced',
    duration: 8,
    tags: ['Keto', 'Low Carb', 'Fat Loss'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 130,
        carbs: 30,
        fats: 140,
        calories: 1800,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Keto Breakfast Bowl',
            ingredients: ['3 whole eggs', '2oz bacon', '1/2 avocado', '1 cup spinach'],
            instructions: 'Fry eggs and bacon, sauté spinach, serve with sliced avocado.',
            macros: { protein: 30, carbs: 8, fats: 45, calories: 530 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Keto Coffee',
            ingredients: ['1 cup black coffee', '1 tbsp MCT oil', '1 tbsp grass-fed butter'],
            instructions: 'Blend hot coffee with MCT oil and butter until frothy.',
            macros: { protein: 0, carbs: 0, fats: 25, calories: 225 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Bunless Burger Bowl',
            ingredients: ['6oz grass-fed beef', '2 cups mixed greens', '1/4 avocado', '2 tbsp olive oil'],
            instructions: 'Grill burger, serve over greens with avocado and olive oil dressing.',
            macros: { protein: 45, carbs: 10, fats: 35, calories: 530 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Cheese and Nuts',
            ingredients: ['2oz cheddar cheese', '1oz macadamia nuts'],
            instructions: 'Slice cheese, serve with nuts.',
            macros: { protein: 15, carbs: 5, fats: 25, calories: 295 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Salmon with Butter Sauce',
            ingredients: ['6oz salmon', '3 cups broccoli', '2 tbsp butter'],
            instructions: 'Bake salmon, steam broccoli, melt butter over both.',
            macros: { protein: 40, carbs: 12, fats: 28, calories: 460 }
          }],
        },
      },
    },
  },
  {
    name: 'Vegetarian Meal Plan',
    description: 'Complete vegetarian nutrition plan with adequate protein from plant-based sources. Balanced and nutrient-dense.',
    type: 'nutrition',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Vegetarian', 'Plant Based', 'Healthy'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 120,
        carbs: 250,
        fats: 55,
        calories: 2000,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Protein Smoothie Bowl',
            ingredients: ['1 cup Greek yogurt', '1 scoop plant protein', '1 cup berries', '1/4 cup granola'],
            instructions: 'Blend yogurt, protein, and berries. Top with granola.',
            macros: { protein: 35, carbs: 50, fats: 8, calories: 410 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Hummus and Veggies',
            ingredients: ['1/2 cup hummus', '2 cups raw vegetables'],
            instructions: 'Serve hummus with sliced vegetables.',
            macros: { protein: 10, carbs: 30, fats: 12, calories: 260 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Quinoa Buddha Bowl',
            ingredients: ['1 cup quinoa', '1 cup chickpeas', '2 cups mixed vegetables', 'tahini dressing'],
            instructions: 'Cook quinoa, roast chickpeas and vegetables, drizzle with tahini.',
            macros: { protein: 25, carbs: 70, fats: 15, calories: 500 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Protein Shake',
            ingredients: ['1 scoop plant protein', '1 banana', '2 tbsp almond butter', '1 cup almond milk'],
            instructions: 'Blend all ingredients.',
            macros: { protein: 30, carbs: 35, fats: 15, calories: 390 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Lentil Curry',
            ingredients: ['1.5 cups cooked lentils', '1 cup brown rice', 'curry sauce', 'mixed vegetables'],
            instructions: 'Cook lentils in curry sauce, serve over brown rice with vegetables.',
            macros: { protein: 25, carbs: 65, fats: 8, calories: 440 }
          }],
        },
      },
    },
  },
  {
    name: 'Intermittent Fasting 16:8',
    description: 'Time-restricted eating plan with 16-hour fasting window and 8-hour eating window. All meals planned for optimal nutrient timing.',
    type: 'nutrition',
    difficulty: 'intermediate',
    duration: 10,
    tags: ['Intermittent Fasting', 'Fat Loss', 'Time Restricted'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 160,
        carbs: 200,
        fats: 60,
        calories: 2000,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Skip (Fasting)',
            ingredients: ['Black coffee or tea only'],
            instructions: 'Continue fasting until 12pm. Stay hydrated.',
            macros: { protein: 0, carbs: 0, fats: 0, calories: 0 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Skip (Fasting)',
            ingredients: ['Water, black coffee, or green tea'],
            instructions: 'Continue fasting period.',
            macros: { protein: 0, carbs: 0, fats: 0, calories: 0 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Breaking Fast - Large Meal',
            ingredients: ['8oz chicken breast', '1.5 cups rice', '2 cups vegetables', '1 tbsp olive oil'],
            instructions: 'First meal at 12pm. Grill chicken, cook rice, sauté vegetables in olive oil.',
            macros: { protein: 60, carbs: 80, fats: 18, calories: 710 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Afternoon Meal',
            ingredients: ['2 scoops protein powder', '2 cups berries', '2 tbsp peanut butter'],
            instructions: 'Blend protein with berries, eat peanut butter on the side.',
            macros: { protein: 55, carbs: 50, fats: 20, calories: 590 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Final Meal (Before 8pm)',
            ingredients: ['6oz salmon', '1 cup quinoa', '2 cups broccoli', '1/2 avocado'],
            instructions: 'Bake salmon, cook quinoa, steam broccoli, slice avocado. Finish eating by 8pm.',
            macros: { protein: 50, carbs: 70, fats: 22, calories: 670 }
          }],
        },
      },
    },
  },
  {
    name: 'Clean Eating Whole Foods',
    description: 'Nutrient-dense meal plan focusing on whole, unprocessed foods. Emphasizes food quality and micronutrient density.',
    type: 'nutrition',
    difficulty: 'beginner',
    duration: 12,
    tags: ['Clean Eating', 'Whole Foods', 'Healthy'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 140,
        carbs: 220,
        fats: 60,
        calories: 2000,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Veggie Egg White Scramble',
            ingredients: ['6 egg whites', '2 whole eggs', '1 cup spinach', '1/2 cup mushrooms', '2 slices whole grain toast'],
            instructions: 'Scramble eggs with vegetables, serve with toast.',
            macros: { protein: 35, carbs: 35, fats: 12, calories: 390 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Apple with Almond Butter',
            ingredients: ['1 large apple', '2 tbsp almond butter'],
            instructions: 'Slice apple, serve with almond butter.',
            macros: { protein: 5, carbs: 35, fats: 16, calories: 300 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Turkey and Sweet Potato',
            ingredients: ['6oz ground turkey', '1 large sweet potato', '2 cups green beans'],
            instructions: 'Cook turkey with seasonings, bake sweet potato, steam green beans.',
            macros: { protein: 50, carbs: 50, fats: 10, calories: 480 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Cottage Cheese Bowl',
            ingredients: ['1 cup cottage cheese', '1/2 cup pineapple', '1/4 cup almonds'],
            instructions: 'Mix cottage cheese with pineapple, top with almonds.',
            macros: { protein: 30, carbs: 25, fats: 15, calories: 350 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Grass-Fed Beef with Vegetables',
            ingredients: ['6oz lean beef', '1 cup brown rice', '2 cups mixed vegetables'],
            instructions: 'Grill or pan-sear beef, cook rice, roast vegetables.',
            macros: { protein: 45, carbs: 65, fats: 12, calories: 540 }
          }],
        },
      },
    },
  },
  {
    name: 'High Carb Performance Diet',
    description: 'Carb-heavy meal plan designed for endurance athletes and high-volume training. Optimizes glycogen stores and recovery.',
    type: 'nutrition',
    difficulty: 'intermediate',
    duration: 10,
    tags: ['Performance', 'High Carb', 'Endurance'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 150,
        carbs: 400,
        fats: 50,
        calories: 2600,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Oatmeal Power Bowl',
            ingredients: ['2 cups oatmeal', '1 scoop protein', '2 bananas', '2 tbsp honey'],
            instructions: 'Cook oatmeal, stir in protein, top with sliced bananas and honey.',
            macros: { protein: 35, carbs: 120, fats: 8, calories: 670 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Rice Cakes with Jam',
            ingredients: ['4 rice cakes', '4 tbsp jam', '1 scoop protein shake'],
            instructions: 'Spread jam on rice cakes, drink protein shake.',
            macros: { protein: 30, carbs: 80, fats: 2, calories: 450 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Pasta with Chicken',
            ingredients: ['2 cups pasta', '6oz chicken breast', 'marinara sauce', '1 cup vegetables'],
            instructions: 'Cook pasta, grill chicken, combine with sauce and vegetables.',
            macros: { protein: 50, carbs: 100, fats: 10, calories: 670 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Recovery Shake',
            ingredients: ['2 scoops protein', '2 cups fruit', '1 cup fruit juice'],
            instructions: 'Blend protein with fruit and juice.',
            macros: { protein: 50, carbs: 80, fats: 5, calories: 565 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Chicken Stir Fry with Rice',
            ingredients: ['6oz chicken', '2 cups white rice', '2 cups stir-fry vegetables', 'teriyaki sauce'],
            instructions: 'Stir-fry chicken and vegetables, serve over rice with sauce.',
            macros: { protein: 45, carbs: 90, fats: 12, calories: 650 }
          }],
        },
      },
    },
  },
  {
    name: 'Anti-Inflammatory Mediterranean',
    description: 'Mediterranean-style diet focused on reducing inflammation. Rich in omega-3s, antioxidants, and whole foods.',
    type: 'nutrition',
    difficulty: 'beginner',
    duration: 12,
    tags: ['Mediterranean', 'Anti-Inflammatory', 'Heart Healthy'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 120,
        carbs: 200,
        fats: 75,
        calories: 2000,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Greek Yogurt Parfait',
            ingredients: ['1.5 cups Greek yogurt', '1 cup berries', '1/4 cup walnuts', '2 tbsp honey'],
            instructions: 'Layer yogurt with berries, top with walnuts and honey.',
            macros: { protein: 30, carbs: 45, fats: 18, calories: 460 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Hummus and Olives',
            ingredients: ['1/2 cup hummus', '1/4 cup olives', '1 whole grain pita'],
            instructions: 'Serve hummus and olives with pita bread.',
            macros: { protein: 12, carbs: 35, fats: 20, calories: 360 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Mediterranean Salmon Bowl',
            ingredients: ['6oz salmon', '1 cup quinoa', '2 cups mixed greens', 'olive oil dressing'],
            instructions: 'Bake salmon, cook quinoa, combine with greens and dressing.',
            macros: { protein: 45, carbs: 50, fats: 22, calories: 590 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Fresh Fruit with Nuts',
            ingredients: ['1 apple', '1 orange', '1/4 cup almonds'],
            instructions: 'Slice fruit, serve with almonds.',
            macros: { protein: 8, carbs: 40, fats: 14, calories: 310 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Grilled Chicken with Vegetables',
            ingredients: ['6oz chicken', '1 cup farro', '2 cups roasted vegetables', '2 tbsp olive oil'],
            instructions: 'Grill chicken, cook farro, roast vegetables with olive oil.',
            macros: { protein: 50, carbs: 55, fats: 18, calories: 590 }
          }],
        },
      },
    },
  },
  {
    name: 'Flexible Dieting IIFYM',
    description: 'If It Fits Your Macros approach allowing food flexibility while hitting macro targets. Teaches sustainable nutrition habits.',
    type: 'nutrition',
    difficulty: 'intermediate',
    duration: 12,
    tags: ['IIFYM', 'Flexible', 'Balanced'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 175,
        carbs: 225,
        fats: 65,
        calories: 2200,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Protein Pancakes',
            ingredients: ['1 cup pancake mix', '1 scoop protein', '2 eggs', '1/4 cup sugar-free syrup'],
            instructions: 'Mix ingredients, cook pancakes, top with syrup.',
            macros: { protein: 45, carbs: 60, fats: 12, calories: 530 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Protein Bar',
            ingredients: ['1 protein bar (20g protein)'],
            instructions: 'Choose any bar that fits macros.',
            macros: { protein: 20, carbs: 25, fats: 8, calories: 250 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Build Your Own Meal',
            ingredients: ['6oz lean protein', '1.5 cups rice or pasta', 'vegetables', 'sauce of choice'],
            instructions: 'Cook protein and carb source, add vegetables and sauce to taste.',
            macros: { protein: 50, carbs: 75, fats: 15, calories: 630 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Protein Ice Cream',
            ingredients: ['2 scoops protein', '1 cup frozen fruit', '1/2 cup almond milk', '1 tbsp PB2'],
            instructions: 'Blend into ice cream consistency.',
            macros: { protein: 50, carbs: 30, fats: 8, calories: 380 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Flexible Dinner Choice',
            ingredients: ['6oz protein source', 'carb source to hit remaining macros', 'fat source to hit remaining macros'],
            instructions: 'Choose any foods that fit remaining daily macros.',
            macros: { protein: 45, carbs: 55, fats: 20, calories: 560 }
          }],
        },
      },
    },
  },
  {
    name: 'Budget-Friendly Meal Prep',
    description: 'Cost-effective meal plan using affordable ingredients. Perfect for students or anyone on a tight budget.',
    type: 'nutrition',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Budget', 'Meal Prep', 'Affordable'],
    status: 'published',
    content: {
      macroTargets: {
        protein: 150,
        carbs: 250,
        fats: 50,
        calories: 2100,
      },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Eggs and Toast',
            ingredients: ['4 whole eggs', '3 slices whole wheat bread', '1 banana'],
            instructions: 'Scramble eggs, toast bread, serve with banana.',
            macros: { protein: 30, carbs: 60, fats: 18, calories: 510 }
          }],
          'morning-snack': [{
            id: 'meal_2',
            name: 'Peanut Butter Sandwich',
            ingredients: ['2 slices bread', '3 tbsp peanut butter'],
            instructions: 'Make sandwich with peanut butter.',
            macros: { protein: 15, carbs: 40, fats: 24, calories: 430 }
          }],
          lunch: [{
            id: 'meal_3',
            name: 'Chicken Rice and Beans',
            ingredients: ['5oz chicken thighs', '1 cup rice', '1 cup black beans'],
            instructions: 'Bake chicken, cook rice and beans together.',
            macros: { protein: 50, carbs: 80, fats: 12, calories: 610 }
          }],
          'evening-snack': [{
            id: 'meal_4',
            name: 'Tuna and Crackers',
            ingredients: ['1 can tuna', '10 whole grain crackers'],
            instructions: 'Drain tuna, serve with crackers.',
            macros: { protein: 30, carbs: 30, fats: 5, calories: 285 }
          }],
          dinner: [{
            id: 'meal_5',
            name: 'Ground Beef Pasta',
            ingredients: ['5oz ground beef', '2 cups pasta', '1 cup frozen vegetables', 'tomato sauce'],
            instructions: 'Cook beef and pasta, add vegetables and sauce.',
            macros: { protein: 40, carbs: 90, fats: 15, calories: 665 }
          }],
        },
      },
    },
  },
];

// Mock draft templates (5 workout, 5 nutrition)
const workoutDrafts = [
  {
    name: 'Push Pull Legs (In Progress)',
    description: 'Classic 6-day PPL split - still finalizing exercise selection and volume.',
    type: 'workout',
    difficulty: 'intermediate',
    duration: 12,
    tags: ['PPL', 'Split', 'Volume'],
    status: 'draft',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Bench Press', ['Chest'], 4, 8, 120, 'Heavy chest pressing.'),
          generateExercise('Overhead Press', ['Shoulders'], 3, 10, 90, 'Shoulder development.'),
        ],
      },
    },
  },
  {
    name: 'Olympic Lifting Program (Draft)',
    description: 'Work in progress - Olympic weightlifting focused template.',
    type: 'workout',
    difficulty: 'advanced',
    duration: 16,
    tags: ['Olympic', 'Weightlifting', 'Technical'],
    status: 'draft',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Snatch', ['Full Body'], 5, 3, 180, 'Technical Olympic lift.'),
          generateExercise('Clean and Jerk', ['Full Body'], 5, 3, 180, 'Complex Olympic movement.'),
        ],
      },
    },
  },
  {
    name: 'Calisthenics Mastery (WIP)',
    description: 'Progressive bodyweight program - needs more progressions added.',
    type: 'workout',
    difficulty: 'intermediate',
    duration: 10,
    tags: ['Calisthenics', 'Bodyweight', 'Skills'],
    status: 'draft',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Pull-up Progressions', ['Back'], 4, 8, 120, 'Various pull-up variations.'),
          generateExercise('Dip Progressions', ['Chest'], 4, 10, 90, 'Progressive dip work.'),
        ],
      },
    },
  },
  {
    name: 'Strongman Training (Draft)',
    description: 'Strongman event-based training - still adding events and progressions.',
    type: 'workout',
    difficulty: 'advanced',
    duration: 12,
    tags: ['Strongman', 'Events', 'Strength'],
    status: 'draft',
    content: {
      schedule: {
        'Saturday': [
          generateExercise('Atlas Stone Loads', ['Full Body'], 5, 3, 180, 'Stone to platform loading.'),
          generateExercise('Farmers Walk', ['Full Body'], 4, 50, 120, '50 yards per set.'),
        ],
      },
    },
  },
  {
    name: 'Yoga & Mobility Flow (Coming Soon)',
    description: 'Mobility-focused program combining yoga and dynamic stretching.',
    type: 'workout',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Yoga', 'Mobility', 'Flexibility'],
    status: 'draft',
    content: {
      schedule: {
        'Monday': [
          generateExercise('Sun Salutations', ['Full Body'], 3, 5, 60, 'Flow through sun salutation sequence.'),
          generateExercise('Hip Mobility Routine', ['Hips'], 3, 10, 60, 'Various hip opening movements.'),
        ],
      },
    },
  },
];

const nutritionDrafts = [
  {
    name: 'Paleo Diet Plan (Draft)',
    description: 'Paleo-based meal plan - still finalizing meal options.',
    type: 'nutrition',
    difficulty: 'intermediate',
    duration: 8,
    tags: ['Paleo', 'Whole Foods', 'Natural'],
    status: 'draft',
    content: {
      macroTargets: { protein: 150, carbs: 150, fats: 80, calories: 2000 },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Paleo Breakfast Bowl',
            ingredients: ['3 eggs', '1 sweet potato', '1/2 avocado'],
            instructions: 'Scramble eggs, roast sweet potato, serve with avocado.',
            macros: { protein: 25, carbs: 35, fats: 20, calories: 420 }
          }],
          'morning-snack': [],
          lunch: [],
          'evening-snack': [],
          dinner: [],
        },
      },
    },
  },
  {
    name: 'Carnivore Diet (WIP)',
    description: 'All-meat diet template - researching optimal implementation.',
    type: 'nutrition',
    difficulty: 'advanced',
    duration: 4,
    tags: ['Carnivore', 'Zero Carb', 'Meat'],
    status: 'draft',
    content: {
      macroTargets: { protein: 200, carbs: 5, fats: 150, calories: 2200 },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Steak and Eggs',
            ingredients: ['8oz ribeye', '3 whole eggs'],
            instructions: 'Grill steak, fry eggs in beef tallow.',
            macros: { protein: 70, carbs: 2, fats: 50, calories: 730 }
          }],
          'morning-snack': [],
          lunch: [],
          'evening-snack': [],
          dinner: [],
        },
      },
    },
  },
  {
    name: 'Vegan Athlete Plan (Coming Soon)',
    description: 'High-performance vegan meal plan - optimizing protein sources.',
    type: 'nutrition',
    difficulty: 'intermediate',
    duration: 10,
    tags: ['Vegan', 'Plant Based', 'Athletic'],
    status: 'draft',
    content: {
      macroTargets: { protein: 150, carbs: 300, fats: 60, calories: 2400 },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Tofu Scramble',
            ingredients: ['8oz tofu', '1 cup vegetables', 'nutritional yeast'],
            instructions: 'Scramble tofu with vegetables and yeast.',
            macros: { protein: 30, carbs: 20, fats: 15, calories: 330 }
          }],
          'morning-snack': [],
          lunch: [],
          'evening-snack': [],
          dinner: [],
        },
      },
    },
  },
  {
    name: 'Meal Prep for Families (Draft)',
    description: 'Family-friendly batch cooking plan - needs more variety.',
    type: 'nutrition',
    difficulty: 'beginner',
    duration: 8,
    tags: ['Family', 'Meal Prep', 'Batch Cooking'],
    status: 'draft',
    content: {
      macroTargets: { protein: 130, carbs: 220, fats: 55, calories: 1900 },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Egg Muffins',
            ingredients: ['6 eggs', '1 cup vegetables', 'cheese'],
            instructions: 'Bake egg muffins in muffin tin.',
            macros: { protein: 30, carbs: 15, fats: 18, calories: 350 }
          }],
          'morning-snack': [],
          lunch: [],
          'evening-snack': [],
          dinner: [],
        },
      },
    },
  },
  {
    name: 'Contest Prep Final Weeks (WIP)',
    description: 'Bodybuilding contest prep for final 4 weeks - fine-tuning details.',
    type: 'nutrition',
    difficulty: 'advanced',
    duration: 4,
    tags: ['Contest Prep', 'Bodybuilding', 'Extreme'],
    status: 'draft',
    content: {
      macroTargets: { protein: 220, carbs: 100, fats: 40, calories: 1600 },
      meals: {
        'Day 1': {
          breakfast: [{
            id: 'meal_1',
            name: 'Egg Whites and Oats',
            ingredients: ['10 egg whites', '1/2 cup oats'],
            instructions: 'Cook egg whites, prepare oats.',
            macros: { protein: 35, carbs: 30, fats: 2, calories: 280 }
          }],
          'morning-snack': [],
          lunch: [],
          'evening-snack': [],
          dinner: [],
        },
      },
    },
  },
];

async function seedTemplates() {
  try {
    console.log('🌱 Starting template seeding...\n');

    // You need to replace this with an actual coach ID from your database
    // For now, we'll create a mock coach ID
    const mockCoachId = 'coach_seed_' + Date.now();
    console.log(`Using Coach ID: ${mockCoachId}\n`);

    // Seed published workout templates
    console.log('📝 Seeding 10 published workout templates...');
    for (const template of workoutTemplates) {
      const templateData = {
        ...template,
        coachId: mockCoachId,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      const docRef = await db.collection('templates').add(templateData);
      console.log(`  ✓ Created: ${template.name} (${docRef.id})`);
    }

    // Seed published nutrition templates
    console.log('\n📝 Seeding 10 published nutrition templates...');
    for (const template of nutritionTemplates) {
      const templateData = {
        ...template,
        coachId: mockCoachId,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      const docRef = await db.collection('templates').add(templateData);
      console.log(`  ✓ Created: ${template.name} (${docRef.id})`);
    }

    // Seed workout drafts
    console.log('\n📝 Seeding 5 workout draft templates...');
    for (const template of workoutDrafts) {
      const templateData = {
        ...template,
        coachId: mockCoachId,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      const docRef = await db.collection('templates').add(templateData);
      console.log(`  ✓ Created: ${template.name} (${docRef.id})`);
    }

    // Seed nutrition drafts
    console.log('\n📝 Seeding 5 nutrition draft templates...');
    for (const template of nutritionDrafts) {
      const templateData = {
        ...template,
        coachId: mockCoachId,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      const docRef = await db.collection('templates').add(templateData);
      console.log(`  ✓ Created: ${template.name} (${docRef.id})`);
    }

    console.log('\n✅ Template seeding completed successfully!');
    console.log('\nSummary:');
    console.log('  • 10 Published Workout Templates');
    console.log('  • 10 Published Nutrition Templates');
    console.log('  • 5 Draft Workout Templates');
    console.log('  • 5 Draft Nutrition Templates');
    console.log('  • Total: 30 Templates\n');

  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTemplates()
  .then(() => {
    console.log('🎉 Seeding complete! You can now view these templates in your app.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
