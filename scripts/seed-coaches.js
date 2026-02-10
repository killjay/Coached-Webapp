const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// and place it in the scripts folder as 'serviceAccountKey.json'
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// Mock coach data
const mockCoaches = [
  {
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@coached.com',
    phone: '+1-555-0101',
    bio: 'Certified personal trainer with 8+ years of experience specializing in strength training and nutrition coaching. Passionate about helping clients achieve sustainable results through evidence-based training methods.',
    certifications: [
      {
        name: 'Certified Strength and Conditioning Specialist (CSCS)',
        issuer: 'National Strength and Conditioning Association',
        issueDate: '2016-03-15',
        expiryDate: '2026-03-15',
      },
      {
        name: 'Precision Nutrition Level 1',
        issuer: 'Precision Nutrition',
        issueDate: '2018-06-20',
        expiryDate: '2028-06-20',
      },
    ],
    specializations: [
      'Strength Training',
      'Nutrition Coaching',
      'Personal Training',
      'Cardio & Weight Loss',
    ],
    availability: {
      monday: [{ startTime: '06:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }],
      tuesday: [{ startTime: '06:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }],
      wednesday: [{ startTime: '06:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }],
      thursday: [{ startTime: '06:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }],
      friday: [{ startTime: '06:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }],
      saturday: [{ startTime: '08:00', endTime: '14:00' }],
      sunday: [],
    },
    commissionRate: 45,
    status: 'verified',
    userId: 'mock_user_sarah_' + Date.now(),
    metrics: {
      clientCount: 12,
      totalRevenue: 24500,
      sessionCount: 156,
      rating: 4.8,
      updatedAt: admin.firestore.Timestamp.now(),
    },
  },
  {
    fullName: 'Michael Chen',
    email: 'michael.chen@coached.com',
    phone: '+1-555-0102',
    bio: 'Former competitive athlete turned coach with expertise in functional training and sports performance. Specialized in helping athletes maximize their potential through personalized training programs.',
    certifications: [
      {
        name: 'Certified Personal Trainer (CPT)',
        issuer: 'American Council on Exercise',
        issueDate: '2015-09-10',
        expiryDate: '2025-09-10',
      },
      {
        name: 'Functional Movement Screen (FMS)',
        issuer: 'Functional Movement Systems',
        issueDate: '2017-04-12',
        expiryDate: '2027-04-12',
      },
      {
        name: 'Sports Performance Specialist',
        issuer: 'National Academy of Sports Medicine',
        issueDate: '2019-01-20',
        expiryDate: '2029-01-20',
      },
    ],
    specializations: [
      'Strength Training',
      'Sports Performance',
      'Rehabilitation',
      'Personal Training',
    ],
    availability: {
      monday: [{ startTime: '07:00', endTime: '13:00' }, { startTime: '17:00', endTime: '21:00' }],
      tuesday: [{ startTime: '07:00', endTime: '13:00' }, { startTime: '17:00', endTime: '21:00' }],
      wednesday: [{ startTime: '07:00', endTime: '13:00' }, { startTime: '17:00', endTime: '21:00' }],
      thursday: [{ startTime: '07:00', endTime: '13:00' }, { startTime: '17:00', endTime: '21:00' }],
      friday: [{ startTime: '07:00', endTime: '13:00' }],
      saturday: [{ startTime: '09:00', endTime: '15:00' }],
      sunday: [{ startTime: '09:00', endTime: '13:00' }],
    },
    commissionRate: 50,
    status: 'verified',
    userId: 'mock_user_michael_' + Date.now(),
    metrics: {
      clientCount: 18,
      totalRevenue: 36200,
      sessionCount: 224,
      rating: 4.9,
      updatedAt: admin.firestore.Timestamp.now(),
    },
  },
  {
    fullName: 'Emily Rodriguez',
    email: 'emily.rodriguez@coached.com',
    phone: '+1-555-0103',
    bio: 'Yoga instructor and wellness coach dedicated to mind-body connection. Specializing in flexibility training, stress management, and holistic fitness approaches for balanced wellness.',
    certifications: [
      {
        name: 'Registered Yoga Teacher (RYT-500)',
        issuer: 'Yoga Alliance',
        issueDate: '2014-08-05',
        expiryDate: '2025-08-05',
      },
      {
        name: 'Certified Health Coach',
        issuer: 'Institute for Integrative Nutrition',
        issueDate: '2016-11-15',
        expiryDate: '2026-11-15',
      },
    ],
    specializations: [
      'Yoga & Flexibility',
      'Nutrition Coaching',
      'Rehabilitation',
      'Personal Training',
    ],
    availability: {
      monday: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '18:00', endTime: '20:00' }],
      tuesday: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '18:00', endTime: '20:00' }],
      wednesday: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '18:00', endTime: '20:00' }],
      thursday: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '18:00', endTime: '20:00' }],
      friday: [{ startTime: '08:00', endTime: '12:00' }],
      saturday: [{ startTime: '10:00', endTime: '16:00' }],
      sunday: [{ startTime: '10:00', endTime: '14:00' }],
    },
    commissionRate: 40,
    status: 'verified',
    userId: 'mock_user_emily_' + Date.now(),
    metrics: {
      clientCount: 15,
      totalRevenue: 18750,
      sessionCount: 189,
      rating: 5.0,
      updatedAt: admin.firestore.Timestamp.now(),
    },
  },
  {
    fullName: 'David Thompson',
    email: 'david.thompson@coached.com',
    phone: '+1-555-0104',
    bio: 'CrossFit Level 2 trainer and endurance specialist. Expert in high-intensity interval training, Olympic lifting, and cardiovascular conditioning for all fitness levels.',
    certifications: [
      {
        name: 'CrossFit Level 2 Trainer',
        issuer: 'CrossFit Inc.',
        issueDate: '2017-05-22',
        expiryDate: '2027-05-22',
      },
      {
        name: 'USA Weightlifting Level 1',
        issuer: 'USA Weightlifting',
        issueDate: '2018-02-10',
        expiryDate: '2028-02-10',
      },
      {
        name: 'Certified Personal Trainer',
        issuer: 'National Academy of Sports Medicine',
        issueDate: '2016-07-18',
        expiryDate: '2026-07-18',
      },
    ],
    specializations: [
      'Group Fitness',
      'Cardio & Weight Loss',
      'Strength Training',
      'Sports Performance',
    ],
    availability: {
      monday: [{ startTime: '05:00', endTime: '10:00' }, { startTime: '15:00', endTime: '19:00' }],
      tuesday: [{ startTime: '05:00', endTime: '10:00' }, { startTime: '15:00', endTime: '19:00' }],
      wednesday: [{ startTime: '05:00', endTime: '10:00' }, { startTime: '15:00', endTime: '19:00' }],
      thursday: [{ startTime: '05:00', endTime: '10:00' }, { startTime: '15:00', endTime: '19:00' }],
      friday: [{ startTime: '05:00', endTime: '10:00' }, { startTime: '15:00', endTime: '19:00' }],
      saturday: [{ startTime: '07:00', endTime: '12:00' }],
      sunday: [],
    },
    commissionRate: 48,
    status: 'verified',
    userId: 'mock_user_david_' + Date.now(),
    metrics: {
      clientCount: 20,
      totalRevenue: 42000,
      sessionCount: 280,
      rating: 4.7,
      updatedAt: admin.firestore.Timestamp.now(),
    },
  },
];

async function seedCoaches() {
  console.log('Starting coach profile seeding...');
  
  try {
    const coachProfilesRef = db.collection('coach_profiles');
    
    for (const coach of mockCoaches) {
      // Add timestamps
      const coachData = {
        ...coach,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      // Create the document
      const docRef = await coachProfilesRef.add(coachData);
      
      // Update the document with its own ID
      await docRef.update({ id: docRef.id });
      
      console.log(`✅ Created coach: ${coach.fullName} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Successfully seeded 4 coach profiles!');
    console.log('\nCoach Summary:');
    mockCoaches.forEach((coach, index) => {
      console.log(`${index + 1}. ${coach.fullName} - ${coach.specializations.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding coaches:', error);
    throw error;
  } finally {
    // Clean up
    process.exit(0);
  }
}

// Run the seeding function
seedCoaches();
