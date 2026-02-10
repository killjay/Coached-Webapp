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

async function verifyClients() {
  console.log('🔍 Verifying Client Profiles in Firestore...\n');
  
  try {
    const clientProfilesRef = db.collection('client_profiles');
    const snapshot = await clientProfilesRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No client profiles found in Firestore.');
      console.log('Run: npm run seed:clients\n');
      process.exit(1);
    }
    
    console.log(`✅ Found ${snapshot.size} client profile(s)\n`);
    console.log('━'.repeat(80));
    
    // Group by coach
    const clientsByCoach = {};
    const clientsByStatus = {};
    const clientsByPlan = {};
    const clientsByGoal = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // By coach
      const coachId = data.assignedCoachId || 'Unassigned';
      if (!clientsByCoach[coachId]) {
        clientsByCoach[coachId] = [];
      }
      clientsByCoach[coachId].push(data.fullName);
      
      // By status
      const status = data.status || 'unknown';
      clientsByStatus[status] = (clientsByStatus[status] || 0) + 1;
      
      // By plan
      const plan = data.planType || 'unknown';
      clientsByPlan[plan] = (clientsByPlan[plan] || 0) + 1;
      
      // By goal
      const goal = data.fitnessGoals?.primaryGoal || 'unknown';
      clientsByGoal[goal] = (clientsByGoal[goal] || 0) + 1;
    });
    
    // Show first 10 clients as sample
    console.log('\n📋 Sample Clients (first 10):');
    snapshot.docs.slice(0, 10).forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ${data.fullName}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Plan: ${data.planType}`);
      console.log(`   Goal: ${data.fitnessGoals?.primaryGoal || 'Not set'}`);
      console.log(`   Coach: ${data.assignedCoachId ? 'Assigned' : 'Not assigned'}`);
    });
    
    console.log('\n' + '━'.repeat(80));
    console.log('\n📊 Statistics:\n');
    
    console.log('By Status:');
    Object.entries(clientsByStatus).forEach(([status, count]) => {
      const percentage = ((count / snapshot.size) * 100).toFixed(1);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    
    console.log('\nBy Plan Type:');
    Object.entries(clientsByPlan).forEach(([plan, count]) => {
      const percentage = ((count / snapshot.size) * 100).toFixed(1);
      console.log(`  ${plan}: ${count} (${percentage}%)`);
    });
    
    console.log('\nBy Fitness Goal:');
    Object.entries(clientsByGoal).forEach(([goal, count]) => {
      const percentage = ((count / snapshot.size) * 100).toFixed(1);
      console.log(`  ${goal.replace('_', ' ')}: ${count} (${percentage}%)`);
    });
    
    console.log('\nBy Coach Assignment:');
    // Get coach names
    const coachesSnapshot = await db.collection('coach_profiles').get();
    const coachNames = {};
    coachesSnapshot.forEach(doc => {
      coachNames[doc.id] = doc.data().fullName;
    });
    
    Object.entries(clientsByCoach).forEach(([coachId, clients]) => {
      const coachName = coachNames[coachId] || coachId;
      console.log(`  ${coachName}: ${clients.length} clients`);
    });
    
    console.log('\n' + '━'.repeat(80));
    console.log('\n✨ Verification complete!\n');
    
  } catch (error) {
    console.error('❌ Error verifying clients:', error.message);
    if (error.code === 'ENOENT') {
      console.log('\n⚠️  Service account key not found.');
      console.log('Please download it from Firebase Console and save as:');
      console.log('  scripts/serviceAccountKey.json\n');
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the verification
verifyClients();
