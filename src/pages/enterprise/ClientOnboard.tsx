import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { query, where, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { validateEmail, validatePhone } from '../../utils/validation';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../context/AuthContext';
import { CoachProfile } from '../../types';
import { CLIENT_STATUS, COACH_STATUS, FITNESS_GOALS, SUBSCRIPTION_PLANS, UI_MESSAGES, FORM_PLACEHOLDERS, FORM_LABELS, SECTION_HEADINGS, VALIDATION_ERRORS } from '../../constants';
import './ClientOnboard.css';

const ClientOnboard: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useFirestore('client_profiles');
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [coachesLoading, setCoachesLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Fitness Goals
    primaryGoal: '',
    targetWeight: '',
    targetDate: '',
    specificGoals: '',
    
    // Medical History
    injuries: '',
    conditions: '',
    medications: '',
    allergies: '',
    medicalNotes: '',
    
    // Plan & Coach
    planType: '',
    assignedCoachId: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Basic details' },
    { number: 2, title: 'Fitness Goals', description: 'Health objectives' },
    { number: 3, title: 'Medical History', description: 'Health information' },
    { number: 4, title: 'Plan & Coach', description: 'Assignment' },
  ];

  // Fetch active coaches
  useEffect(() => {
    const q = query(
      collection(db, 'coach_profiles'),
      where('status', '==', COACH_STATUS.ACTIVE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coachList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CoachProfile[];
      setCoaches(coachList);
      setCoachesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      // Personal Info Validation
      if (!formData.fullName?.trim()) stepErrors.fullName = VALIDATION_ERRORS.FULL_NAME_REQUIRED;
      if (!formData.email?.trim()) {
        stepErrors.email = VALIDATION_ERRORS.EMAIL_REQUIRED;
      } else if (!validateEmail(formData.email)) {
        stepErrors.email = VALIDATION_ERRORS.EMAIL_INVALID;
      }
      if (!formData.phone?.trim()) {
        stepErrors.phone = VALIDATION_ERRORS.PHONE_REQUIRED;
      } else if (!validatePhone(formData.phone)) {
        stepErrors.phone = VALIDATION_ERRORS.PHONE_INVALID;
      }
    }

    if (step === 2) {
      // Fitness Goals Validation
      if (!formData.primaryGoal) stepErrors.primaryGoal = VALIDATION_ERRORS.PRIMARY_GOAL_REQUIRED;
    }

    // Step 3 (Medical History) is optional - no validation required

    if (step === 4) {
      // Plan & Coach Validation
      if (!formData.planType) stepErrors.planType = VALIDATION_ERRORS.PLAN_TYPE_REQUIRED;
      if (!formData.assignedCoachId) stepErrors.assignedCoachId = VALIDATION_ERRORS.COACH_ASSIGNMENT_REQUIRED;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const clientData = {
        // Personal Information
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        
        // Fitness Goals
        fitnessGoals: {
          primaryGoal: formData.primaryGoal as any,
          targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
          targetDate: formData.targetDate || undefined,
          specificGoals: formData.specificGoals ? [formData.specificGoals] : [],
        },
        
        // Medical History
        medicalHistory: {
          injuries: formData.injuries ? formData.injuries.split(',').map(i => i.trim()) : [],
          conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()) : [],
          medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : [],
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
          notes: formData.medicalNotes || undefined,
        },
        
        // Plan & Assignment
        planType: formData.planType,
        assignedCoachId: formData.assignedCoachId,
        status: CLIENT_STATUS.ACTIVE, // Client is immediately active
        
        // Metadata
        createdBy: user?.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await create(clientData as any);
      
      alert(UI_MESSAGES.CLIENT_ONBOARDING.SUCCESS(formData.fullName));
      navigate('/enterprise/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout')) {
        alert(UI_MESSAGES.CLIENT_ONBOARDING.ERROR_TIMEOUT);
      } else {
        alert(UI_MESSAGES.CLIENT_ONBOARDING.ERROR_GENERIC);
      }
    } finally {
      setLoading(false);
    }
  };

  const coachOptions = coaches.map(coach => ({
    value: coach.id,
    label: `${coach.fullName} - ${coach.specializations?.join(', ') || 'General'}`,
  }));

  const planOptions = SUBSCRIPTION_PLANS.map(plan => ({
    value: plan.id,
    label: `${plan.name} - $${plan.price}/month`,
  }));

  const fitnessGoalOptions = FITNESS_GOALS.map(goal => ({
    value: goal.value,
    label: goal.label,
  }));

  return (
    <div className="client-onboard-page">
      <div className="page-header">
        <h1 className="page-title">{UI_MESSAGES.CLIENT_ONBOARDING.TITLE}</h1>
        <p className="page-description">{UI_MESSAGES.CLIENT_ONBOARDING.DESCRIPTION}</p>
      </div>

      <Card>
        {/* Progress Steps */}
        <div className="onboarding-steps">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`step ${currentStep === step.number ? 'active' : ''} ${
                currentStep > step.number ? 'completed' : ''
              }`}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3 className="step-heading">{SECTION_HEADINGS.PERSONAL_INFO}</h3>
            <div className="form-grid">
              <Input
                label={FORM_LABELS.PERSONAL_INFO.FULL_NAME}
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                error={errors.fullName}
                placeholder={FORM_PLACEHOLDERS.PERSONAL_INFO.FULL_NAME}
                required
              />
              <Input
                label={FORM_LABELS.PERSONAL_INFO.EMAIL}
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                placeholder={FORM_PLACEHOLDERS.PERSONAL_INFO.EMAIL}
                required
              />
              <Input
                label={FORM_LABELS.PERSONAL_INFO.PHONE}
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                error={errors.phone}
                placeholder={FORM_PLACEHOLDERS.PERSONAL_INFO.PHONE}
                required
              />
              <Input
                label={FORM_LABELS.PERSONAL_INFO.DATE_OF_BIRTH}
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                error={errors.dateOfBirth}
              />
            </div>
          </div>
        )}

        {/* Step 2: Fitness Goals */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3 className="step-heading">{SECTION_HEADINGS.FITNESS_GOALS}</h3>
            <div className="form-grid">
              <Select
                label={FORM_LABELS.FITNESS_GOALS.PRIMARY_GOAL}
                value={formData.primaryGoal}
                onChange={(e) => updateField('primaryGoal', e.target.value)}
                options={fitnessGoalOptions}
                error={errors.primaryGoal}
                required
              />
              <Input
                label={FORM_LABELS.FITNESS_GOALS.TARGET_WEIGHT}
                type="number"
                value={formData.targetWeight}
                onChange={(e) => updateField('targetWeight', e.target.value)}
                placeholder={FORM_PLACEHOLDERS.FITNESS_GOALS.TARGET_WEIGHT}
              />
              <Input
                label={FORM_LABELS.FITNESS_GOALS.TARGET_DATE}
                type="date"
                value={formData.targetDate}
                onChange={(e) => updateField('targetDate', e.target.value)}
              />
            </div>
            <div className="form-grid-full">
              <div className="input-wrapper">
                <label className="input-label">{FORM_LABELS.FITNESS_GOALS.SPECIFIC_GOALS}</label>
                <textarea
                  className="input"
                  value={formData.specificGoals}
                  onChange={(e) => updateField('specificGoals', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.FITNESS_GOALS.SPECIFIC_GOALS}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Medical History */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3 className="step-heading">{SECTION_HEADINGS.MEDICAL_HISTORY}</h3>
            <div className="form-grid">
              <Input
                label={FORM_LABELS.MEDICAL_HISTORY.INJURIES}
                value={formData.injuries}
                onChange={(e) => updateField('injuries', e.target.value)}
                placeholder={FORM_PLACEHOLDERS.MEDICAL_HISTORY.INJURIES}
              />
              <Input
                label={FORM_LABELS.MEDICAL_HISTORY.CONDITIONS}
                value={formData.conditions}
                onChange={(e) => updateField('conditions', e.target.value)}
                placeholder={FORM_PLACEHOLDERS.MEDICAL_HISTORY.CONDITIONS}
              />
              <Input
                label={FORM_LABELS.MEDICAL_HISTORY.MEDICATIONS}
                value={formData.medications}
                onChange={(e) => updateField('medications', e.target.value)}
                placeholder={FORM_PLACEHOLDERS.MEDICAL_HISTORY.MEDICATIONS}
              />
              <Input
                label={FORM_LABELS.MEDICAL_HISTORY.ALLERGIES}
                value={formData.allergies}
                onChange={(e) => updateField('allergies', e.target.value)}
                placeholder={FORM_PLACEHOLDERS.MEDICAL_HISTORY.ALLERGIES}
              />
            </div>
            <div className="form-grid-full">
              <div className="input-wrapper">
                <label className="input-label">{FORM_LABELS.MEDICAL_HISTORY.NOTES}</label>
                <textarea
                  className="input"
                  value={formData.medicalNotes}
                  onChange={(e) => updateField('medicalNotes', e.target.value)}
                  placeholder={FORM_PLACEHOLDERS.MEDICAL_HISTORY.NOTES}
                  rows={3}
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Plan & Coach Assignment */}
        {currentStep === 4 && (
          <div className="form-step">
            <h3 className="step-heading">{SECTION_HEADINGS.PLAN_ASSIGNMENT}</h3>
            <div className="form-grid">
              <Select
                label={FORM_LABELS.PLAN_ASSIGNMENT.PLAN_TYPE}
                value={formData.planType}
                onChange={(e) => updateField('planType', e.target.value)}
                options={planOptions}
                error={errors.planType}
                required
              />
              <Select
                label={FORM_LABELS.PLAN_ASSIGNMENT.ASSIGN_COACH}
                value={formData.assignedCoachId}
                onChange={(e) => updateField('assignedCoachId', e.target.value)}
                options={coachOptions}
                error={errors.assignedCoachId}
                required
              />
            </div>
            {coachesLoading && (
              <p style={{ color: '#6b7280', marginTop: '10px' }}>
                {UI_MESSAGES.CLIENT_ONBOARDING.COACHES_LOADING}
              </p>
            )}
            {coaches.length === 0 && !coachesLoading && (
              <p style={{ color: '#f59e0b', marginTop: '10px' }}>
                {UI_MESSAGES.CLIENT_ONBOARDING.NO_COACHES_WARNING}
              </p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-actions">
          {currentStep > 1 && (
            <Button variant="secondary" onClick={handlePrevious} disabled={loading}>
              Previous
            </Button>
          )}
          {currentStep < 4 ? (
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="success" onClick={handleSubmit} loading={loading}>
              Complete Onboarding
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ClientOnboard;
