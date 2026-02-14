const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const auth = admin.auth();

/**
 * Delete a user account and all associated data from Firebase
 * @param {string} email - The email address of the user to delete
 */
async function deleteUser(email) {
  console.log(`\n🔍 Looking for user: ${email}...`);
  
  try {
    // Step 1: Find the user in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✅ Found user in Firebase Auth: ${userRecord.uid}`);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log(`⚠️  User not found in Firebase Auth`);
      } else {
        throw authError;
      }
    }

    const userId = userRecord?.uid;

    // Step 2: Delete user data from Firestore collections
    const collectionsToCheck = [
      'users',
      'coach_profiles',
      'client_profiles',
      'appointments',
      'coach_tasks',
      'templates',
      'notifications',
      'admin_notifications'
    ];

    console.log('\n🗑️  Deleting user data from Firestore...');

    for (const collectionName of collectionsToCheck) {
      // Check by email
      const emailQuery = await db.collection(collectionName)
        .where('email', '==', email)
        .get();

      if (!emailQuery.empty) {
        console.log(`   Found ${emailQuery.size} document(s) in ${collectionName} (by email)`);
        const batch = db.batch();
        emailQuery.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`   ✅ Deleted documents from ${collectionName}`);
      }

      // Check by userId if we have it
      if (userId) {
        const userIdQuery = await db.collection(collectionName)
          .where('userId', '==', userId)
          .get();

        if (!userIdQuery.empty) {
          console.log(`   Found ${userIdQuery.size} document(s) in ${collectionName} (by userId)`);
          const batch = db.batch();
          userIdQuery.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`   ✅ Deleted documents from ${collectionName}`);
        }

        // Also check for direct document with userId as ID
        const userDoc = await db.collection(collectionName).doc(userId).get();
        if (userDoc.exists) {
          await userDoc.ref.delete();
          console.log(`   ✅ Deleted document ${userId} from ${collectionName}`);
        }
      }
    }

    // Step 3: Delete from Firebase Authentication
    if (userRecord) {
      await auth.deleteUser(userId);
      console.log(`\n✅ Deleted user from Firebase Authentication`);
    }

    console.log(`\n🎉 Successfully deleted user account: ${email}`);
    console.log(`   - Removed from Firebase Authentication`);
    console.log(`   - Removed all associated Firestore data`);
    
  } catch (error) {
    console.error(`\n❌ Error deleting user:`, error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Get email from command line argument
const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.error('❌ Error: Please provide an email address');
  console.log('\nUsage: node delete-user.js <email>');
  console.log('Example: node delete-user.js user@example.com');
  process.exit(1);
}

// Run the deletion
deleteUser(emailToDelete);
