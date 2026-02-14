const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

async function verifyTemplates() {
  try {
    console.log('🔍 Verifying templates in Firestore...\n');
    
    // Get all templates
    const templatesSnapshot = await db.collection('templates').get();
    
    if (templatesSnapshot.empty) {
      console.log('❌ No templates found in the database.');
      console.log('\nRun the seeding script first:');
      console.log('  node scripts/seed-templates.js\n');
      return;
    }
    
    console.log(`✅ Found ${templatesSnapshot.size} templates total\n`);
    
    // Count by type and status
    const stats = {
      workout: { published: 0, draft: 0 },
      nutrition: { published: 0, draft: 0 },
    };
    
    const templates = [];
    
    templatesSnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({ id: doc.id, ...data });
      
      if (data.type === 'workout') {
        if (data.status === 'published') stats.workout.published++;
        else if (data.status === 'draft') stats.workout.draft++;
      } else if (data.type === 'nutrition') {
        if (data.status === 'published') stats.nutrition.published++;
        else if (data.status === 'draft') stats.nutrition.draft++;
      }
    });
    
    // Display statistics
    console.log('📊 Template Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Workout Templates:`);
    console.log(`     • Published: ${stats.workout.published}`);
    console.log(`     • Drafts: ${stats.workout.draft}`);
    console.log(`     • Total: ${stats.workout.published + stats.workout.draft}`);
    console.log('');
    console.log(`   Nutrition Templates:`);
    console.log(`     • Published: ${stats.nutrition.published}`);
    console.log(`     • Drafts: ${stats.nutrition.draft}`);
    console.log(`     • Total: ${stats.nutrition.published + stats.nutrition.draft}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Display published workout templates
    console.log('🏋️  Published Workout Templates:');
    templates
      .filter(t => t.type === 'workout' && t.status === 'published')
      .forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name}`);
        console.log(`      Difficulty: ${t.difficulty} | Duration: ${t.duration} weeks`);
        console.log(`      Tags: ${t.tags.join(', ')}`);
      });
    
    console.log('');
    
    // Display published nutrition templates
    console.log('🥗 Published Nutrition Templates:');
    templates
      .filter(t => t.type === 'nutrition' && t.status === 'published')
      .forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name}`);
        console.log(`      Difficulty: ${t.difficulty} | Duration: ${t.duration} weeks`);
        console.log(`      Macros: ${t.content.macroTargets.calories} cal (P:${t.content.macroTargets.protein}g C:${t.content.macroTargets.carbs}g F:${t.content.macroTargets.fats}g)`);
      });
    
    console.log('');
    
    // Display draft templates
    console.log('📝 Draft Templates:');
    const drafts = templates.filter(t => t.status === 'draft');
    if (drafts.length > 0) {
      drafts.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.type})`);
      });
    } else {
      console.log('   No drafts found');
    }
    
    console.log('');
    
    // Check for unique coach IDs
    const coachIds = [...new Set(templates.map(t => t.coachId))];
    console.log(`👨‍🏫 Coach IDs used: ${coachIds.length}`);
    coachIds.forEach((id, i) => {
      const count = templates.filter(t => t.coachId === id).length;
      console.log(`   ${i + 1}. ${id} (${count} templates)`);
    });
    
    console.log('\n✅ Verification complete!\n');
    
  } catch (error) {
    console.error('❌ Error verifying templates:', error);
  }
}

verifyTemplates()
  .then(() => {
    console.log('🎉 You can now view these templates in your app!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
