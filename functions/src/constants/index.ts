// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  basic: { name: 'Basic', price: 29, description: 'Essential features for getting started' },
  standard: { name: 'Standard', price: 79, description: 'Full access with personalized coaching' },
  premium: { name: 'Premium', price: 149, description: 'Elite coaching with nutrition planning' },
} as const;

// Fitness Goals
export const FITNESS_GOALS = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
  general_fitness: 'General Fitness',
} as const;

// Status Types
export const CLIENT_STATUS = {
  PENDING: 'pending',
  FORM_SUBMITTED: 'form_submitted',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
} as const;

export const COACH_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Helper function to get plan label
export const getPlanLabel = (planId: keyof typeof SUBSCRIPTION_PLANS): string => {
  const plan = SUBSCRIPTION_PLANS[planId];
  return plan ? `${plan.name} ($${plan.price}/month)` : planId;
};

// Helper function to format goal
export const formatGoal = (goal: string): string => {
  return goal.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
};

// Generate plan options for email template
export const generatePlanOptions = (): string => {
  return Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => `
    <label class="radio-option">
      <input type="radio" name="planType" value="${id}" required>
      <div class="plan-details">
        <span class="plan-name">${plan.name} Plan</span>
        <span class="plan-price">$${plan.price}/month</span>
        <span style="font-size: 13px; color: #666; margin-top: 4px;">${plan.description}</span>
      </div>
    </label>
  `).join('');
};

// Generate fitness goal options for email template
export const generateFitnessGoalOptions = (): string => {
  return Object.entries(FITNESS_GOALS).map(([value, label]) => 
    `<option value="${value}">${label}</option>`
  ).join('');
};
