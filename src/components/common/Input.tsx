import React, { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, className = '', ...props }, ref) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {icon && <span className="input-icon">{icon}</span>}
          <input
            ref={ref}
            className={`input ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}
            {...props}
          />
        </div>
        {error && <span className="input-error-text">{error}</span>}
        {helpText && !error && <span className="input-help-text">{helpText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
