import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: number;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 32,
  fullPage = false,
}) => (
  <div className={`spinner-wrap ${fullPage ? 'spinner-wrap--full' : ''}`}>
    <div className="spinner" style={{ width: size, height: size }} />
  </div>
);
