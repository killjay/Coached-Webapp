const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function verifyCoaches() {
  console.log('🔍 Verifying Coach Profiles in Firestore...\n');
  
  try {
    const coachProfilesRef = db.collection('coach_profiles');
    const snapshot = await coachProfilesRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No coach profiles found in Firestore.');
      console.log('Run: npm run seed:coaches\n');
      process.exit(1);
    }
    
    console.log(`✅ Found ${snapshot.size} coach profile(s)\n`);
    console.log('━'.repeat(80));
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ${data.fullName} (ID: ${doc.id})`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Phone: ${data.phone}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Specializations: ${data.specializations?.join(', ') || 'None'}`);
      console.log(`   Certifications: ${data.certifications?.length || 0}`);
      console.log(`   Commission Rate: ${data.commissionRate}%`);
      
      if (data.metrics) {
        console.log(`   Metrics:`);
        console.log(`     - Clients: ${data.metrics.clientCount}`);
        console.log(`     - Revenue: $${data.metrics.totalRevenue.toLocaleString()}`);
        console.log(`     - Sessions: ${data.metrics.sessionCount}`);
        console.log(`     - Rating: ${data.metrics.rating}★`);
      }
      
      // Check availability
      const hasAvailability = data.availability && Object.keys(data.availability).length > 0;
      console.log(`   Availability: ${hasAvailability ? '✓ Set' : '✗ Not set'}`);
      
      // Validation checks
      const issues = [];
      if (!data.fullName) issues.push('Missing fullName');
      if (!data.email) issues.push('Missing email');
      if (!data.phone) issues.push('Missing phone');
      if (!data.specializations || data.specializations.length === 0) {
        issues.push('No specializations');
      }
      if (!data.certifications || data.certifications.length === 0) {
        issues.push('No certifications');
      }
      if (!data.status) issues.push('Missing status');
      if (!data.commissionRate) issues.push('Missing commission rate');
      
      if (issues.length > 0) {
        console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
      } else {
        console.log(`   ✅ All fields validated`);
      }
    });
    
    console.log('\n' + '━'.repeat(80));
    console.log('\n✨ Verification complete!\n');
    
    // Summary
    const verifiedCount = snapshot.docs.filter(doc => doc.data().status === 'verified').length;
    const pendingCount = snapshot.docs.filter(doc => doc.data().status === 'pending').length;
    
    console.log('Summary:');
    console.log(`  Total Coaches: ${snapshot.size}`);
    console.log(`  Verified: ${verifiedCount}`);
    console.log(`  Pending: ${pendingCount}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error verifying coaches:', error.message);
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
verifyCoaches();
