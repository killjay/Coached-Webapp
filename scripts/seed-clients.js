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

// First, we need to get the coach IDs from Firestore
async function getCoachIds() {
  const coachesSnapshot = await db.collection('coach_profiles').get();
  if (coachesSnapshot.empty) {
    throw new Error('No coaches found! Please run seed:coaches first.');
  }
  return coachesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().fullName }));
}

// Generate realistic client data
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Emily', 'Andrew', 'Kimberly', 'Paul', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah',
  'Timothy', 'Stephanie', 'Ronald', 'Dorothy', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
];

const fitnessGoals = ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'];
const planTypes = ['basic', 'standard', 'premium'];
const statuses = ['active', 'active', 'active', 'active', 'paused']; // More active clients

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  return `+1-555-${String(randomInt(1000, 9999)).padStart(4, '0')}`;
}

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
}

function generateDateOfBirth() {
  const year = randomInt(1970, 2000);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateJoinDate() {
  const year = randomInt(2024, 2026);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateSpecificGoals(primaryGoal) {
  const goalTemplates = {
    weight_loss: ['Lose 20 pounds', 'Fit into old clothes', 'Improve cardiovascular health'],
    muscle_gain: ['Build upper body strength', 'Increase lean muscle mass', 'Improve overall physique'],
    endurance: ['Run a 10K', 'Improve stamina', 'Complete a triathlon'],
    flexibility: ['Touch toes', 'Improve mobility', 'Reduce stiffness'],
    general_fitness: ['Stay active', 'Feel healthier', 'Maintain wellness']
  };
  
  const goals = goalTemplates[primaryGoal] || goalTemplates.general_fitness;
  return goals.slice(0, randomInt(1, 3));
}

function generateMedicalHistory() {
  const possibleInjuries = ['None', 'Knee injury (2020)', 'Lower back strain', 'Shoulder impingement', 'Ankle sprain'];
  const possibleConditions = ['None', 'Hypertension', 'Asthma', 'Diabetes Type 2'];
  const possibleMedications = ['None', 'Blood pressure medication', 'Allergy medication'];
  const possibleAllergies = ['None', 'Peanuts', 'Shellfish', 'Latex'];
  
  return {
    injuries: [randomElement(possibleInjuries)],
    conditions: [randomElement(possibleConditions)],
    medications: [randomElement(possibleMedications)],
    allergies: [randomElement(possibleAllergies)],
    notes: randomInt(0, 1) === 1 ? 'Regular check-ups, cleared for exercise' : ''
  };
}

function generateClientProfile(index, coachId, coachName, createdBy) {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const fullName = `${firstName} ${lastName}`;
  const email = generateEmail(firstName, lastName);
  const primaryGoal = randomElement(fitnessGoals);
  const status = randomElement(statuses);
  const planType = randomElement(planTypes);
  const joinDate = generateJoinDate();
  
  // Build fitness goals object dynamically to avoid undefined values
  const fitnessGoalsObj = {
    primaryGoal,
    specificGoals: generateSpecificGoals(primaryGoal),
    notes: `Motivated and committed to achieving ${primaryGoal.replace('_', ' ')} goals`
  };
  
  // Only add targetWeight if it's for weight loss
  if (primaryGoal === 'weight_loss') {
    fitnessGoalsObj.targetWeight = randomInt(140, 180);
  }
  
  // Only add targetDate if not general fitness
  if (primaryGoal !== 'general_fitness') {
    fitnessGoalsObj.targetDate = generateJoinDate();
  }
  
  const profile = {
    fullName,
    email,
    phone: generatePhoneNumber(),
    dateOfBirth: generateDateOfBirth(),
    assignedCoachId: coachId,
    fitnessGoals: fitnessGoalsObj,
    medicalHistory: generateMedicalHistory(),
    planType,
    status,
    createdBy,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(joinDate)),
    updatedAt: admin.firestore.Timestamp.now()
  };
  
  // Only add metrics if status is active
  if (status === 'active') {
    profile.metrics = {
      sessionCount: randomInt(5, 50),
      lastSessionDate: admin.firestore.Timestamp.fromDate(new Date(2026, 1, randomInt(1, 9))),
      currentWeight: randomInt(120, 220),
      progressNotes: [`Making good progress`, `Consistent attendance`],
      updatedAt: admin.firestore.Timestamp.now()
    };
  }
  
  return profile;
}

async function seedClients() {
  console.log('🏃 Starting client profile seeding...\n');
  
  try {
    // Get existing coaches
    const coaches = await getCoachIds();
    console.log(`✅ Found ${coaches.length} coaches to assign clients to\n`);
    
    coaches.forEach(coach => {
      console.log(`   - ${coach.name} (${coach.id})`);
    });
    console.log('');
    
    const clientProfilesRef = db.collection('client_profiles');
    
    // Generate 50 clients, distribute among coaches
    const clientsPerCoach = Math.ceil(50 / coaches.length);
    let clientCount = 0;
    let coachIndex = 0;
    
    const batch = db.batch();
    const clientsByCoach = {};
    
    for (let i = 0; i < 50; i++) {
      // Rotate through coaches
      const coach = coaches[coachIndex];
      if (!clientsByCoach[coach.id]) {
        clientsByCoach[coach.id] = { name: coach.name, count: 0 };
      }
      
      // Generate client profile
      const clientData = generateClientProfile(
        i,
        coach.id,
        coach.name,
        'admin@coached.com'
      );
      
      // Create document reference
      const docRef = clientProfilesRef.doc();
      clientData.id = docRef.id;
      clientData.userId = `mock_user_client_${Date.now()}_${i}`;
      
      batch.set(docRef, clientData);
      
      clientsByCoach[coach.id].count++;
      clientCount++;
      
      // Move to next coach
      coachIndex = (coachIndex + 1) % coaches.length;
      
      // Commit in batches of 500 (Firestore limit)
      if ((i + 1) % 500 === 0) {
        await batch.commit();
        console.log(`✅ Committed ${i + 1} clients...`);
      }
    }
    
    // Commit remaining
    await batch.commit();
    
    console.log(`\n🎉 Successfully seeded ${clientCount} client profiles!\n`);
    console.log('━'.repeat(80));
    console.log('\nDistribution by Coach:');
    
    Object.entries(clientsByCoach).forEach(([coachId, data]) => {
      console.log(`  ${data.name}: ${data.count} clients`);
    });
    
    console.log('\n' + '━'.repeat(80));
    console.log('\n✨ Client Summary by Status:');
    console.log(`  Active: ~${Math.floor(clientCount * 0.8)} clients`);
    console.log(`  Paused: ~${Math.floor(clientCount * 0.2)} clients`);
    console.log('\n✨ Client Summary by Plan:');
    console.log(`  Basic: ~${Math.floor(clientCount / 3)} clients`);
    console.log(`  Standard: ~${Math.floor(clientCount / 3)} clients`);
    console.log(`  Premium: ~${Math.floor(clientCount / 3)} clients`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error seeding clients:', error.message);
    if (error.message.includes('No coaches found')) {
      console.log('\n⚠️  Please run the coach seeding script first:');
      console.log('   npm run seed:coaches\n');
    }
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedClients();
