import React, { SelectHTMLAttributes, forwardRef } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helpText, options, className = '', ...props }, ref) => {
    return (
      <div className={`select-wrapper ${className}`}>
        {label && <label className="select-label">{label}</label>}
        <div className="select-container">
          <select
            ref={ref}
            className={`select ${error ? 'select-error' : ''}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg className="select-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {error && <span className="select-error-text">{error}</span>}
        {helpText && !error && <span className="select-help-text">{helpText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
