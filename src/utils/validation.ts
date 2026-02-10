export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: any) => boolean | string;
}

export const validateField = (value: any, rules: ValidationRule): string => {
  if (rules.required) {
    const message = typeof rules.required === 'string' ? rules.required : 'This field is required';
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
  }

  if (rules.minLength && typeof value === 'string') {
    if (value.length < rules.minLength.value) {
      return rules.minLength.message;
    }
  }

  if (rules.maxLength && typeof value === 'string') {
    if (value.length > rules.maxLength.value) {
      return rules.maxLength.message;
    }
  }

  if (rules.pattern && typeof value === 'string') {
    if (!rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }
  }

  if (rules.validate) {
    const result = rules.validate(value);
    if (typeof result === 'string') {
      return result;
    }
    if (!result) {
      return 'Validation failed';
    }
  }

  return '';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s+()-]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: '' };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, ValidationRule>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;

  for (const key in rules) {
    if (rules[key]) {
      const error = validateField(data[key], rules[key]!);
      if (error) {
        errors[key] = error;
        valid = false;
      }
    }
  }

  return { valid, errors };
};
