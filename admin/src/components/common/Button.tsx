import React from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => (
  <button
    className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className}`}
    disabled={disabled || loading}
    {...rest}
  >
    {icon && <span className="btn__icon">{icon}</span>}
    {children}
  </button>
);
