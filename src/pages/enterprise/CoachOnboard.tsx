import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { validateEmail, validatePhone } from '../../utils/validation';
import { useFirestore } from '../../hooks/useFirestore';
import { CoachFormData } from '../../types';
import { UI_MESSAGES, FORM_PLACEHOLDERS, COACH_SPECIALIZATIONS, COACH_STATUS, VALIDATION_ERRORS } from '../../constants';
import '../enterprise/ClientOnboard.css';
import './CoachOnboard.css';

const CoachOnboard: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useFirestore('coach_profiles');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CoachFormData>>({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    certifications: [],
    specializations: [],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    commissionRate: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Basic details' },
    { number: 2, title: 'Credentials', description: 'Certifications' },
    { number: 3, title: 'Specializations', description: 'Areas of expertise' },
    { number: 4, title: 'Availability', description: 'Schedule & commission' },
  ];

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: '', issuer: '', issueDate: '', expiryDate: '' },
      ],
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const newCertifications = [...(formData.certifications || [])];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setFormData((prev) => ({ ...prev, certifications: newCertifications }));
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.specializations || [];
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    updateField('specializations', updated);
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
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
      if (!formData.certifications || formData.certifications.length === 0) {
        stepErrors.certifications = VALIDATION_ERRORS.CERTIFICATION_REQUIRED;
      }
    }

    if (step === 3) {
      if (!formData.specializations || formData.specializations.length === 0) {
        stepErrors.specializations = VALIDATION_ERRORS.SPECIALIZATION_REQUIRED;
      }
    }

    if (step === 4) {
      if (!formData.commissionRate || formData.commissionRate <= 0) {
        stepErrors.commissionRate = VALIDATION_ERRORS.COMMISSION_RATE_REQUIRED;
      }
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
      await create({
        ...formData,
        // Mark as verified so they are immediately assignable in client onboarding
        status: COACH_STATUS.VERIFIED,
        createdAt: new Date().toISOString(),
      } as any);
      
      alert(UI_MESSAGES.COACH_ONBOARDING.SUCCESS);
      navigate('/enterprise/coaches');
    } catch (error) {
      console.error('Error creating coach:', error);
      alert(UI_MESSAGES.COACH_ONBOARDING.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const specializationOptions = COACH_SPECIALIZATIONS;

  return (
    <div className="client-onboard-page coach-onboard-page">
      <div className="page-header">
        <h1 className="page-title">Coach Onboarding</h1>
      </div>

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

      <Card>
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3 className="step-heading">Personal Information</h3>
            <div className="form-grid">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                error={errors.fullName}
                placeholder={FORM_PLACEHOLDERS.COACH_INFO.FULL_NAME}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                placeholder={FORM_PLACEHOLDERS.COACH_INFO.EMAIL}
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                error={errors.phone}
                placeholder={FORM_PLACEHOLDERS.COACH_INFO.PHONE}
              />
            </div>
            <div className="form-full-width">
              <Input
                label="Bio"
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder={FORM_PLACEHOLDERS.COACH_INFO.BIO}
                helpText="Brief introduction and experience"
              />
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3 className="step-heading">Certifications & Credentials</h3>
            {errors.certifications && (
              <div className="error-message">{errors.certifications}</div>
            )}
            {formData.certifications?.map((cert, index) => (
              <div key={index} className="certification-block">
                <h4>Certification {index + 1}</h4>
                <div className="form-grid">
                  <Input
                    label="Certification Name"
                    value={cert.name}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder={FORM_PLACEHOLDERS.CERTIFICATION.NAME}
                  />
                  <Input
                    label="Issuing Organization"
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder={FORM_PLACEHOLDERS.CERTIFICATION.ISSUER}
                  />
                  <Input
                    label="Issue Date"
                    type="date"
                    value={cert.issueDate}
                    onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                  />
                  <Input
                    label="Expiry Date (Optional)"
                    type="date"
                    value={cert.expiryDate}
                    onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={addCertification}>
              + Add Certification
            </Button>
          </div>
        )}

        {/* Step 3: Specializations */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3 className="step-heading">Areas of Expertise</h3>
            {errors.specializations && (
              <div className="error-message">{errors.specializations}</div>
            )}
            <div className="specialization-grid">
              {specializationOptions.map((spec) => (
                <div
                  key={spec}
                  className={`specialization-card ${
                    formData.specializations?.includes(spec) ? 'selected' : ''
                  }`}
                  onClick={() => toggleSpecialization(spec)}
                >
                  <div className="specialization-checkbox">
                    {formData.specializations?.includes(spec) && (
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Availability & Commission */}
        {currentStep === 4 && (
          <div className="form-step">
            <h3 className="step-heading">Availability & Commission</h3>
            <div className="form-grid">
              <Input
                label="Commission Rate (%)"
                type="number"
                value={formData.commissionRate}
                onChange={(e) => updateField('commissionRate', parseFloat(e.target.value))}
                error={errors.commissionRate}
                placeholder={FORM_PLACEHOLDERS.COACH_INFO.COMMISSION_RATE}
                helpText="Percentage of revenue paid to coach"
              />
            </div>
            <p className="info-text">
              Weekly schedule can be configured after initial approval in the coach profile.
            </p>
          </div>
        )}

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
              Submit for Verification
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CoachOnboard;
