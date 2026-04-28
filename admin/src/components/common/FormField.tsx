import React from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, hint, error, required, children }) => (
  <div className="form-field">
    <label className="form-field__label">
      {label}
      {required && <span className="form-field__required">*</span>}
    </label>
    {hint && <p className="form-field__hint">{hint}</p>}
    {children}
    {error && <p className="form-field__error">{error}</p>}
  </div>
);
