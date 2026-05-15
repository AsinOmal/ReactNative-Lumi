import React from 'react';
import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled,
}) => (
  <label className={`toggle ${disabled ? 'toggle--disabled' : ''}`}>
    <input
      type="checkbox"
      className="toggle__input"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="toggle__track">
      <span className="toggle__thumb" />
    </span>
    {label && <span className="toggle__label">{label}</span>}
  </label>
);
