const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK (reuse existing app if already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

// Generate realistic weight data for a client
function generateWeightData(startWeight, targetWeight, weeks = 39) {
  const startDate = new Date('2025-03-07');
  const totalWeightLoss = startWeight - targetWeight;
  const weeklyData = [];

  for (let week = 0; week < weeks; week++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (week * 7));
    
    const progressFactor = week / weeks;
    const expectedLoss = totalWeightLoss * (progressFactor * 0.9 + Math.pow(progressFactor, 0.7) * 0.1);
    
    const fluctuation = (Math.sin(week * 0.5) * 0.3) + (Math.random() * 0.4 - 0.2);
    const currentWeight = startWeight - expectedLoss + fluctuation;
    
    const changeFromStart = currentWeight - startWeight;
    const progressPercentage = Math.min(100, Math.max(0, (Math.abs(changeFromStart) / totalWeightLoss) * 100));
    
    weeklyData.push({
      day: week * 7 + 1,
      date: currentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      weight: currentWeight.toFixed(2),
      change: changeFromStart.toFixed(2),
      progress: Math.round(progressPercentage),
      weekLabel: `Week ${week + 1}`,
    });
  }

  return weeklyData;
}

// Generate body measurements data
function generateBodyMeasurements() {
  return [
    { 
      week: 'Week 1', 
      date: '3/6/2025',
      measurements: {
        chest: 42,
        shoulders: 48,
        leftArm: 13, 
        rightArm: 13,
        leftArmFlexed: 14.5,
        rightArmFlexed: 14.5,
        leftForearm: 11,
        rightForearm: 11,
        neck: 16,
        leftThigh: 24, 
        rightThigh: 24,
        waistMiddle: 38,
        hips: 40,
        glutes: 42,
        leftCalf: 15,
        rightCalf: 15,
      }
    },
    { 
      week: 'Week 13', 
      date: '6/5/2025',
      measurements: {
        chest: 41,
        shoulders: 49,
        leftArm: 13.5, 
        rightArm: 13.5,
        leftArmFlexed: 15,
        rightArmFlexed: 15,
        leftForearm: 11.5,
        rightForearm: 11.5,
        neck: 15.5,
        leftThigh: 23, 
        rightThigh: 23,
        waistMiddle: 35,
        hips: 38,
        glutes: 40,
        leftCalf: 15.5,
        rightCalf: 15.5,
      }
    },
    { 
      week: 'Week 26', 
      date: '9/4/2025',
      measurements: {
        chest: 40,
        shoulders: 50,
        leftArm: 14, 
        rightArm: 14,
        leftArmFlexed: 15.5,
        rightArmFlexed: 15.5,
        leftForearm: 12,
        rightForearm: 12,
        neck: 15,
        leftThigh: 22, 
        rightThigh: 22,
        waistMiddle: 33,
        hips: 36,
        glutes: 38,
        leftCalf: 16,
        rightCalf: 16,
      }
    },
    { 
      week: 'Week 39', 
      date: '12/4/2025',
      measurements: {
        chest: 39.5,
        shoulders: 51,
        leftArm: 14.5, 
        rightArm: 14.5,
        leftArmFlexed: 16,
        rightArmFlexed: 16,
        leftForearm: 12.5,
        rightForearm: 12.5,
        neck: 14.5,
        leftThigh: 21.5, 
        rightThigh: 21.5,
        waistMiddle: 31,
        hips: 35,
        glutes: 37,
        leftCalf: 16.5,
        rightCalf: 16.5,
      }
    },
  ];
}

// Sample nutrition plan
function createSampleNutritionPlan(clientId, coachId) {
  return {
    clientId,
    currentPlan: 'plan_001',
    plans: [
      {
        id: 'plan_001',
        name: 'Weight Loss Plan',
        description: 'Balanced nutrition plan for healthy weight loss',
        dailyCalories: 1800,
        macros: {
          protein: 110,
          carbs: 230,
          fats: 50,
        },
        meals: [
          {
            id: 'pre_workout',
            name: 'Pre Workout',
            time: '6:00 AM',
            foods: [
              { name: 'Green Tea/Black Coffee', quantity: '1 cup', calories: 0, protein: 0, carbs: 0, fats: 0 },
              { name: 'Orange / Watermelon', quantity: '150g / 300g', calories: 70, protein: 1, carbs: 17, fats: 0 },
            ],
          },
          {
            id: 'post_workout',
            name: 'Post Workout',
            time: '8:00 AM',
            foods: [
              { name: 'Greek Yogurt', quantity: '200g', calories: 130, protein: 20, carbs: 8, fats: 3 },
              { name: 'Egg Whites', quantity: '5', calories: 85, protein: 17, carbs: 1, fats: 0 },
            ],
          },
          {
            id: 'breakfast',
            name: 'Breakfast - Bread Omelette',
            time: '9:00 AM',
            foods: [
              { name: 'Wheat Bread', quantity: '2 slices', calories: 160, protein: 6, carbs: 30, fats: 2 },
              { name: 'Egg Whites', quantity: '6', calories: 102, protein: 20, carbs: 1, fats: 0 },
              { name: 'Vegetables', quantity: '150g', calories: 50, protein: 2, carbs: 10, fats: 0 },
            ],
          },
          {
            id: 'snacks',
            name: 'Snacks',
            time: '12:00 PM',
            foods: [
              { name: 'Protein Bar', quantity: '1 bar (20g protein)', calories: 200, protein: 20, carbs: 24, fats: 6 },
              { name: 'Greek Yogurt', quantity: '200g', calories: 130, protein: 20, carbs: 8, fats: 3 },
            ],
          },
          {
            id: 'lunch',
            name: 'Lunch - Chicken / Paneer',
            time: '2:00 PM',
            foods: [
              { name: 'Cooked Chapati / Rice', quantity: '60g / 150g', calories: 220, protein: 5, carbs: 48, fats: 1 },
              { name: 'Chicken / Tofu', quantity: '200g', calories: 330, protein: 60, carbs: 0, fats: 8 },
              { name: 'Salad', quantity: '200g', calories: 60, protein: 2, carbs: 12, fats: 0 },
            ],
          },
          {
            id: 'dinner',
            name: 'Dinner - Soya Pulav',
            time: '7:00 PM',
            foods: [
              { name: 'Cooked Rice', quantity: '150g', calories: 195, protein: 4, carbs: 43, fats: 0 },
              { name: 'Chicken / Soya', quantity: '150g / 50g', calories: 248, protein: 45, carbs: 0, fats: 6 },
              { name: 'Salad/Mix Vegetables', quantity: '150g', calories: 50, protein: 2, carbs: 10, fats: 0 },
            ],
          },
        ],
        startDate: '2025-03-01',
        status: 'active',
        createdBy: coachId,
        createdAt: admin.firestore.Timestamp.now(),
      },
    ],
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };
}

async function seedClientData() {
  try {
    console.log('🏃 Starting client data seeding...\n');
    
    // Get all clients
    const clientsSnapshot = await db.collection('client_profiles').get();
    console.log(`✅ Found ${clientsSnapshot.size} clients\n`);
    
    if (clientsSnapshot.size === 0) {
      console.log('⚠️  No clients found! Please run seed:clients first.');
      console.log('   npm run seed:clients\n');
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      const clientData = clientDoc.data();
      
      try {
        console.log(`📊 Seeding data for: ${clientData.fullName} (${clientId})`);
        
        // Generate and save progress data (measurements and weight)
        const weightEntries = generateWeightData(95, 80, 39);
        const measurements = generateBodyMeasurements();
        
        const progressData = {
          clientId,
          measurements,
          weightEntries,
          milestones: [],
          lastUpdated: admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now(),
        };
        
        await db.collection('client_progress').doc(clientId).set(progressData);
        console.log('   ✓ Progress data saved');
        
        // Generate and save nutrition plan
        const coachId = clientData.assignedCoachId || 'default_coach';
        const nutritionPlan = createSampleNutritionPlan(clientId, coachId);
        
        await db.collection('nutrition_plans').doc(clientId).set(nutritionPlan);
        console.log('   ✓ Nutrition plan saved\n');
        
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error for ${clientData.fullName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('━'.repeat(80));
    console.log('\n✅ Data seeding completed!');
    console.log(`   Success: ${successCount} clients`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} clients`);
    }
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedClientData();
