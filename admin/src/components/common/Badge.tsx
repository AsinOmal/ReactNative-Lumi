import React from 'react';
import './Badge.css';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral' }) => (
  <span className={`badge badge--${variant}`}>{label}</span>
);
