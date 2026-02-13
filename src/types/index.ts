import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  uid: string;
  email: string;
  plan: 'individual' | 'business' | 'enterprise';
  planSelectedAt: string;
  createdAt: Timestamp;
}

// Coach Profile
export interface CoachProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  certifications: Certification[];
  specializations: string[];
  availability: WeeklyAvailability;
  commissionRate: number;
  status: 'pending' | 'verified' | 'rejected' | 'active' | 'inactive';
  photoURL?: string;
  metrics?: CoachMetrics;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  fileURL?: string;
}

export interface WeeklyAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;
}

export interface CoachMetrics {
  clientCount: number;
  totalRevenue: number;
  sessionCount: number;
  rating?: number;
  updatedAt: Timestamp;
}

// Client Profile
export interface ClientProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  assignedCoachId?: string;
  fitnessGoals?: FitnessGoals;
  medicalHistory?: MedicalHistory;
  planType?: 'basic' | 'standard' | 'premium';
  status: 'pending' | 'form_submitted' | 'active' | 'inactive' | 'paused';
  photoURL?: string;
  metrics?: ClientMetrics;
  onboardingToken?: string;
  createdBy?: string; // Email of admin who created this client
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface FitnessGoals {
  primaryGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness';
  targetWeight?: number;
  targetDate?: string;
  specificGoals: string[];
  notes?: string;
}

export interface MedicalHistory {
  injuries: string[];
  conditions: string[];
  medications: string[];
  allergies: string[];
  notes?: string;
}

export interface ClientMetrics {
  sessionCount: number;
  lastSessionDate?: Timestamp;
  currentWeight?: number;
  progressNotes?: string[];
  updatedAt: Timestamp;
}

// Client Database Collections
export interface ClientSettings {
  clientId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  preferences: {
    units: 'metric' | 'imperial';
    language: string;
    theme: 'light' | 'dark';
  };
  privacy: {
    profileVisible: boolean;
    progressVisible: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClientProgress {
  clientId: string;
  measurements: Measurement[];
  weightEntries: WeightEntry[];
  milestones: Milestone[];
  lastUpdated: Timestamp;
  createdAt: Timestamp;
}

export interface Measurement {
  date: string;
  week?: string; // e.g., "Week 1", "Week 13"
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    shoulders?: number;
    leftArm?: number;
    rightArm?: number;
    leftArmFlexed?: number;
    rightArmFlexed?: number;
    leftForearm?: number;
    rightForearm?: number;
    neck?: number;
    leftThigh?: number;
    rightThigh?: number;
    waistMiddle?: number;
    hips?: number;
    glutes?: number;
    leftCalf?: number;
    rightCalf?: number;
  };
  notes?: string;
}

export interface WeightEntry {
  day: number;
  date: string;
  weight: string; // kg
  change: string; // change from start
  progress: number; // percentage
  weekLabel: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  achievedDate?: string;
  status: 'pending' | 'achieved' | 'missed';
  createdAt: Timestamp;
}

export interface WorkoutPlan {
  clientId: string;
  plans: WorkoutPlanItem[];
  currentPlan: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkoutPlanItem {
  id: string;
  name: string;
  description: string;
  duration: number; // weeks
  workouts: Workout[];
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  createdBy: string; // coach ID
  createdAt: Timestamp;
}

export interface Workout {
  id: string;
  day: string;
  exercises: Exercise[];
  notes?: string;
}

export interface NutritionPlan {
  clientId: string;
  plans: NutritionPlanItem[];
  currentPlan: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NutritionPlanItem {
  id: string;
  name: string;
  description: string;
  dailyCalories: number;
  macros: {
    protein: number; // grams
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  createdBy: string; // coach ID
  createdAt: Timestamp;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: Food[];
  notes?: string;
}

export interface Food {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface ClientAssessment {
  clientId: string;
  assessments: Assessment[];
  lastAssessment: Timestamp | null;
  createdAt: Timestamp;
}

export interface Assessment {
  id: string;
  date: string;
  type: 'initial' | 'progress' | 'final';
  performedBy: string; // coach ID
  fitness: {
    strength?: number;
    endurance?: number;
    flexibility?: number;
    balance?: number;
  };
  notes: string;
  recommendations: string[];
  createdAt: Timestamp;
}

export interface ClientActivity {
  clientId: string;
  activities: Activity[];
  totalWorkouts: number;
  totalDuration: number; // minutes
  lastActivity: Timestamp | null;
  createdAt: Timestamp;
}

export interface Activity {
  id: string;
  date: string;
  type: 'workout' | 'cardio' | 'assessment' | 'appointment';
  workoutId?: string;
  duration: number; // minutes
  completed: boolean;
  notes?: string;
  createdAt: Timestamp;
}

export interface ClientNotes {
  clientId: string;
  notes: CoachNote[];
  createdAt: Timestamp;
}

export interface CoachNote {
  id: string;
  coachId: string;
  coachName: string;
  date: string;
  content: string;
  category?: 'progress' | 'concern' | 'achievement' | 'general';
  private: boolean; // visible only to coaches
  createdAt: Timestamp;
}


// Subscription
export interface Subscription {
  id: string;
  clientId: string;
  coachId?: string;
  planType: 'basic' | 'standard' | 'premium';
  amount: number;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: Timestamp;
  nextBillingDate: Timestamp;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Template
export interface Template {
  id: string;
  coachId: string;
  name: string;
  description: string;
  type: 'workout' | 'nutrition' | 'combined';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in weeks
  content: WorkoutPlan | NutritionPlan | CombinedPlan;
  status: 'draft' | 'published';
  tags: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface WorkoutPlan {
  schedule: {
    [day: string]: Exercise[];
  };
}

export interface Exercise {
  id: string;
  name: string;
  // Muscle groups / body parts targeted (e.g., Chest, Back, Legs)
  muscleGroups?: string[];
  sets: number;
  reps: number;
  restPeriod: number; // in seconds
  instructions: string;
  videoURL?: string;
  imageURL?: string;
  weight?: number;
  duration?: number; // minutes
  notes?: string;
}

export interface NutritionPlan {
  meals: {
    [day: string]: DayMeals;
  };
  macroTargets: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

export interface DayMeals {
  breakfast: TemplateMeal[];
  'morning-snack': TemplateMeal[];
  lunch: TemplateMeal[];
  'evening-snack': TemplateMeal[];
  dinner: TemplateMeal[];
}

export interface TemplateMeal {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

export interface CombinedPlan {
  workout: WorkoutPlan;
  nutrition: NutritionPlan;
}

// Template Assignment
export interface TemplateAssignment {
  id: string;
  templateId: string;
  clientId: string;
  coachId: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  status: 'active' | 'completed' | 'cancelled';
  progress: number; // 0-100
  notes?: string;
  createdAt: Timestamp;
}

// Appointment
export interface Appointment {
  id: string;
  coachId: string;
  clientId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  type: 'training' | 'consultation' | 'assessment' | 'follow_up';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  location?: string;
  recurring?: RecurringConfig;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: Timestamp;
  occurrences?: number;
}

// Coach Tasks (Todo / Follow-ups)
export interface CoachTask {
  id: string;
  coachId: string;
  title: string;
  dueDate: Timestamp;
  status: 'open' | 'done';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Role
export interface Role {
  id: string;
  userId: string;
  name: string;
  permissions: Permission[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type Permission =
  | 'dashboard:view_revenue'
  | 'dashboard:view_analytics'
  | 'clients:view'
  | 'clients:create'
  | 'clients:edit'
  | 'clients:delete'
  | 'clients:assign_coach'
  | 'coaches:view'
  | 'coaches:create'
  | 'coaches:edit'
  | 'coaches:delete'
  | 'coaches:manage_availability'
  | 'templates:view'
  | 'templates:create'
  | 'templates:edit'
  | 'templates:delete'
  | 'templates:assign'
  | 'calendar:view_all'
  | 'calendar:create'
  | 'calendar:edit'
  | 'calendar:delete'
  | 'calendar:manage_own'
  | 'roles:view'
  | 'roles:create'
  | 'roles:edit'
  | 'roles:delete'
  | 'roles:assign';

// Revenue Metrics
export interface RevenueMetrics {
  id: string;
  month: string; // YYYY-MM format
  totalRevenue: number;
  subscriptionCount: number;
  revenueByCoach: { [coachId: string]: number };
  revenueByPlan: { [planType: string]: number };
  lastSyncedAt: Timestamp;
  createdAt: Timestamp;
}

// Email Log
export interface EmailLog {
  id: string;
  type: 'welcome' | 'coach_verification' | 'appointment_reminder' | 'notification' | 'onboarding_form' | 'admin_notification';
  recipient: string | string[];
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  appointmentId?: string;
  clientId?: string;
  coachId?: string;
  sentAt: Timestamp;
  error?: string;
}

// Admin Notification
export interface AdminNotification {
  id: string;
  type: 'client_form_submitted' | 'coach_verification' | 'appointment_scheduled' | 'general';
  clientId?: string;
  clientName?: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
}

// Client Form Submission (from email form)
export interface ClientFormSubmission {
  clientId: string;
  token: string;
  fitnessGoals: {
    primaryGoal: 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_fitness';
    targetWeight?: number;
    targetDate?: string;
    specificGoals?: string;
  };
  medicalHistory: {
    injuries?: string;
    conditions?: string;
    medications?: string;
    allergies?: string;
  };
  planType: 'basic' | 'standard' | 'premium';
}

// Form Data Types (for UI state management)
export interface ClientFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  fitnessGoals: Partial<FitnessGoals>;
  medicalHistory: Partial<MedicalHistory>;
  assignedCoachId: string;
  planType: string;
}

export interface CoachFormData {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  certifications: Certification[];
  specializations: string[];
  availability: WeeklyAvailability;
  commissionRate: number;
}
