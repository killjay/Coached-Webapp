const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function getFirstCoach() {
  try {
    console.log('🔍 Searching for coaches in your database...\n');
    
    const coachesSnapshot = await db.collection('coach_profiles').limit(1).get();
    
    if (coachesSnapshot.empty) {
      console.log('❌ No coaches found in the database.');
      console.log('\nOptions:');
      console.log('1. Create a coach first using your app');
      console.log('2. Run the seed-coaches.js script to create test coaches');
      console.log('3. Use a mock coach ID in the seed-templates.js script\n');
      return null;
    }
    
    const coach = coachesSnapshot.docs[0];
    const coachData = coach.data();
    
    console.log('✅ Found coach:');
    console.log(`   ID: ${coach.id}`);
    console.log(`   Name: ${coachData.fullName}`);
    console.log(`   Email: ${coachData.email}`);
    console.log(`   Status: ${coachData.status}`);
    console.log(`\n📋 Copy this coach ID to use in seed-templates.js:`);
    console.log(`   "${coach.id}"\n`);
    
    // Also update the seed-templates.js file with this ID
    console.log('💡 To use this coach ID automatically, replace this line in seed-templates.js:');
    console.log('   const mockCoachId = \'coach_seed_\' + Date.now();');
    console.log('   with:');
    console.log(`   const mockCoachId = '${coach.id}';\n`);
    
    return coach.id;
  } catch (error) {
    console.error('❌ Error fetching coach:', error);
    return null;
  }
}

getFirstCoach()
  .then((coachId) => {
    if (coachId) {
      console.log('🎉 Coach ID retrieved successfully!');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
