import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  onBack,
}) => (
  <div className="page-header">
    <div className="page-header__lead">
      {onBack && (
        <button
          type="button"
          className="page-header__back"
          onClick={onBack}
          aria-label="Go back"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </div>
);
