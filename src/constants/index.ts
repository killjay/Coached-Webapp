// Plan Types and Pricing
export const SUBSCRIPTION_PLANS = [
  { id: 'basic', name: 'Basic', price: 29, description: 'Essential features for getting started' },
  { id: 'standard', name: 'Standard', price: 79, description: 'Full access with personalized coaching' },
  { id: 'premium', name: 'Premium', price: 149, description: 'Elite coaching with nutrition planning' },
] as const;

export type PlanType = typeof SUBSCRIPTION_PLANS[number]['id'];

// Plan Selection Plans (Different from subscription plans above - these are account types)
export const ACCOUNT_PLANS = [
  {
    id: 'individual',
    name: 'Individual Plan',
    description: 'Perfect for personal fitness goals',
    price: 29,
    period: 'per month',
    features: [
      'Personalized workout plans',
      'Track your progress',
      'Nutrition guidance',
      'Mobile app access',
      'Email support',
    ],
    popular: false,
  },
  {
    id: 'business',
    name: 'Business Plan',
    description: 'For small teams and studios',
    price: 79,
    period: 'per month',
    features: [
      'Everything in Individual',
      'Up to 10 team members',
      'Team analytics & reporting',
      'Priority support',
      'Custom branding',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'For large organizations',
    price: 149,
    period: 'per month',
    features: [
      'Everything in Business',
      'Unlimited team members',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom integrations',
      'SLA & premium support',
    ],
    popular: false,
  },
] as const;

// Client Status Types
export const CLIENT_STATUS = {
  PENDING: 'pending',
  FORM_SUBMITTED: 'form_submitted',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
} as const;

// Coach Status Types
export const COACH_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Fitness Goals
export const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'general_fitness', label: 'General Fitness' },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  CLIENT_FORM_SUBMITTED: 'client_form_submitted',
  COACH_VERIFICATION: 'coach_verification',
  APPOINTMENT_SCHEDULED: 'appointment_scheduled',
  GENERAL: 'general',
} as const;

// Email Types
export const EMAIL_TYPES = {
  WELCOME: 'welcome',
  COACH_VERIFICATION: 'coach_verification',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  NOTIFICATION: 'notification',
  ONBOARDING_FORM: 'onboarding_form',
  ADMIN_NOTIFICATION: 'admin_notification',
} as const;

// Helper function to get plan label with price
export const getPlanLabel = (planId: string): string => {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  return plan ? `${plan.name} ($${plan.price}/month)` : planId;
};

// Helper function to format fitness goal
export const formatFitnessGoal = (goal: string): string => {
  return goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// UI Messages
export const UI_MESSAGES = {
  // Client Onboarding
  CLIENT_ONBOARDING: {
    TITLE: 'Client Onboarding',
    DESCRIPTION: 'Complete client information and assign a coach',
    VALIDATION_ERROR: 'Please fill in all required fields',
    SUCCESS: (name: string) => `Client ${name} has been successfully onboarded and assigned to a coach!`,
    ERROR_TIMEOUT: 'Failed to create client: Connection timeout. Please check your internet connection and try again.\n\nNote: The client may still be created in the background once connection is restored.',
    ERROR_GENERIC: 'Failed to create client. Please try again.',
    NO_COACHES_WARNING: '⚠️ No active coaches available. Please add coaches first.',
    COACHES_LOADING: 'Loading coaches...',
  },
  
  // Pending Clients
  PENDING_CLIENTS: {
    SELECT_COACH_ERROR: 'Please select a coach',
    ASSIGN_SUCCESS: (name: string) => `Coach successfully assigned to ${name}!`,
    ASSIGN_ERROR: 'Failed to assign coach. Please try again.',
    LOADING: 'Loading...',
  },
  
  // Coach Onboarding
  COACH_ONBOARDING: {
    SUCCESS: 'Coach successfully onboarded! Available for assignment.',
    ERROR: 'Failed to create coach. Please try again.',
  },
  
  // Templates
  TEMPLATE: {
    SUCCESS: 'Template saved successfully!',
  },
  
  // Appointments
  APPOINTMENT: {
    SUCCESS: 'Appointment created!',
  },
} as const;

// Validation Error Messages
export const VALIDATION_ERRORS = {
  FULL_NAME_REQUIRED: 'Full name is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email address',
  PHONE_REQUIRED: 'Phone is required',
  PHONE_INVALID: 'Invalid phone number',
  PRIMARY_GOAL_REQUIRED: 'Primary goal is required',
  PLAN_TYPE_REQUIRED: 'Plan type is required',
  COACH_ASSIGNMENT_REQUIRED: 'Coach assignment is required',
  CERTIFICATION_REQUIRED: 'At least one certification is required',
  SPECIALIZATION_REQUIRED: 'At least one specialization is required',
  COMMISSION_RATE_REQUIRED: 'Commission rate is required',
} as const;

// Form Placeholders
export const FORM_PLACEHOLDERS = {
  PERSONAL_INFO: {
    FULL_NAME: 'John Doe',
    EMAIL: 'john@example.com',
    PHONE: '(555) 123-4567',
  },
  COACH_INFO: {
    FULL_NAME: 'Sarah Williams',
    EMAIL: 'sarah@example.com',
    PHONE: '(555) 123-4567',
    BIO: 'Tell us about your coaching experience...',
    COMMISSION_RATE: '15',
  },
  CERTIFICATION: {
    NAME: 'ACE Personal Trainer',
    ISSUER: 'American Council on Exercise',
  },
  FITNESS_GOALS: {
    TARGET_WEIGHT: '150',
    SPECIFIC_GOALS: 'E.g., Run a 5K, improve mobility, build upper body strength...',
  },
  MEDICAL_HISTORY: {
    INJURIES: 'Separate with commas (e.g., knee injury, lower back)',
    CONDITIONS: 'Separate with commas (e.g., asthma, diabetes)',
    MEDICATIONS: 'Separate with commas',
    ALLERGIES: 'Separate with commas',
    NOTES: 'Any other relevant medical information...',
  },
} as const;

// Form Labels
export const FORM_LABELS = {
  PERSONAL_INFO: {
    FULL_NAME: 'Full Name',
    EMAIL: 'Email',
    PHONE: 'Phone',
    DATE_OF_BIRTH: 'Date of Birth',
  },
  FITNESS_GOALS: {
    PRIMARY_GOAL: 'Primary Goal',
    TARGET_WEIGHT: 'Target Weight (lbs)',
    TARGET_DATE: 'Target Date',
    SPECIFIC_GOALS: 'Specific Goals / Notes',
  },
  MEDICAL_HISTORY: {
    INJURIES: 'Injuries',
    CONDITIONS: 'Medical Conditions',
    MEDICATIONS: 'Medications',
    ALLERGIES: 'Allergies',
    NOTES: 'Additional Medical Notes',
  },
  PLAN_ASSIGNMENT: {
    PLAN_TYPE: 'Subscription Plan',
    ASSIGN_COACH: 'Assign Coach',
  },
} as const;

// Section Headings
export const SECTION_HEADINGS = {
  PERSONAL_INFO: 'Personal Information',
  FITNESS_GOALS: 'Fitness Goals',
  MEDICAL_HISTORY: 'Medical History',
  PLAN_ASSIGNMENT: 'Plan & Coach Assignment',
} as const;

// Coach Specializations
export const COACH_SPECIALIZATIONS = [
  'Strength Training',
  'Cardio & Weight Loss',
  'Yoga & Flexibility',
  'Nutrition Coaching',
  'Sports Performance',
  'Rehabilitation',
  'Personal Training',
  'Group Fitness',
] as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  SELECT_PLAN: '/select-plan',
  ENTERPRISE: {
    REVENUE: '/enterprise/revenue',
    CLIENTS: '/enterprise/clients',
    CLIENT_ONBOARD: '/enterprise/client-onboard',
    COACHES: '/enterprise/coaches',
    COACH_ONBOARD: '/enterprise/coach-onboard',
    CALENDAR: '/enterprise/calendar',
    TEMPLATES: '/enterprise/templates',
    PENDING_CLIENTS: '/enterprise/pending-clients',
  },
} as const;

// ============================================
// MOCK/DEMO DATA (Replace with real Firestore data in production)
// ============================================

// Revenue Dashboard Mock Data
export const MOCK_REVENUE_METRICS = {
  totalRevenue: 125430,
  monthlyRevenue: 32500,
  activeSubscriptions: 156,
  churnRate: 3.2,
} as const;

export const MOCK_CHART_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  revenue: [18000, 22000, 25000, 28000, 30000, 32500],
} as const;

export const MOCK_REVENUE_BY_PLAN = [
  { plan: 'Premium Plan', amount: 89400, color: '#4f7cff' },
  { plan: 'Standard Plan', amount: 28530, color: '#10b981' },
  { plan: 'Basic Plan', amount: 7500, color: '#f59e0b' },
] as const;

export const MOCK_PAYMENTS = [
  {
    id: '1',
    clientName: 'John Smith',
    amount: 149,
    dueDate: '2026-02-15',
    status: 'paid' as const,
    plan: 'Premium',
  },
  {
    id: '2',
    clientName: 'Sarah Johnson',
    amount: 79,
    dueDate: '2026-02-18',
    status: 'pending' as const,
    plan: 'Standard',
  },
  {
    id: '3',
    clientName: 'Mike Davis',
    amount: 149,
    dueDate: '2026-02-05',
    status: 'overdue' as const,
    plan: 'Premium',
  },
  {
    id: '4',
    clientName: 'Emily Wilson',
    amount: 29,
    dueDate: '2026-02-20',
    status: 'paid' as const,
    plan: 'Basic',
  },
  {
    id: '5',
    clientName: 'David Brown',
    amount: 79,
    dueDate: '2026-02-22',
    status: 'pending' as const,
    plan: 'Standard',
  },
] as const;

// Client List Mock Data
export const MOCK_CLIENTS = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    assignedCoach: 'Sarah Williams',
    status: 'active' as const,
    planType: 'Premium',
    joinDate: '2026-01-15',
    lastSession: '2026-02-08',
  },
  {
    id: '2',
    fullName: 'Emily Johnson',
    email: 'emily@example.com',
    phone: '(555) 234-5678',
    assignedCoach: 'Mike Davis',
    status: 'active' as const,
    planType: 'Standard',
    joinDate: '2026-01-20',
    lastSession: '2026-02-07',
  },
  {
    id: '3',
    fullName: 'Michael Brown',
    email: 'michael@example.com',
    phone: '(555) 345-6789',
    assignedCoach: 'Sarah Williams',
    status: 'paused' as const,
    planType: 'Basic',
    joinDate: '2025-12-10',
    lastSession: '2026-01-25',
  },
] as const;

// Coach List Mock Data
export const MOCK_COACHES = [
  {
    id: '1',
    fullName: 'Sarah Williams',
    email: 'sarah@coached.com',
    specializations: ['Strength Training', 'Personal Training'],
    status: 'verified' as const,
    clientCount: 24,
    revenue: 89400,
    joinDate: '2025-08-15',
  },
  {
    id: '2',
    fullName: 'Mike Davis',
    email: 'mike@coached.com',
    specializations: ['Cardio & Weight Loss', 'Nutrition Coaching'],
    status: 'verified' as const,
    clientCount: 18,
    revenue: 45200,
    joinDate: '2025-09-20',
  },
  {
    id: '3',
    fullName: 'Emily Johnson',
    email: 'emily@coached.com',
    specializations: ['Yoga & Flexibility'],
    status: 'pending' as const,
    clientCount: 0,
    revenue: 0,
    joinDate: '2026-02-01',
  },
] as const;

// Dashboard Text/Labels
export const DASHBOARD_LABELS = {
  REVENUE: {
    TITLE: 'Revenue Dashboard',
    DESCRIPTION: 'Track financial performance and subscription metrics',
    TOTAL_REVENUE: 'Total Revenue',
    MONTHLY_REVENUE: 'Monthly Recurring Revenue',
    ACTIVE_SUBSCRIPTIONS: 'Active Subscriptions',
    CHURN_RATE: 'Churn Rate',
    REVENUE_TREND: 'Revenue Trend',
    REVENUE_TREND_SUBTITLE: 'Monthly revenue over time',
    REVENUE_BY_PLAN: 'Revenue by Plan',
    PAYMENT_STATUS: 'Payment Status',
    PAYMENT_STATUS_SUBTITLE: 'Recent payment transactions',
    EXPORT_BUTTON: 'Export',
    VS_LAST_MONTH: 'vs last month',
  },
  DATE_RANGES: [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
  ],
} as const;
