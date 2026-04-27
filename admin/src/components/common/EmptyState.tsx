import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-state__icon">{icon}</div>
    <p className="empty-state__title">{title}</p>
    {description && <p className="empty-state__desc">{description}</p>}
    {action && <div className="empty-state__action">{action}</div>}
  </div>
);
