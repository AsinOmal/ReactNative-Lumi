import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  detail?: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  trend?: { value: string; positive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  value,
  detail,
  icon,
  accentColor,
  accentBg,
  trend,
}) => (
  <div className="stat-card">
    <div className="stat-card__header">
      <div className="stat-card__icon-wrap" style={{ backgroundColor: accentBg, color: accentColor }}>
        {icon}
      </div>
      <div className="stat-card__labels">
        <span className="stat-card__title">{title}</span>
        <span className="stat-card__subtitle">{subtitle}</span>
      </div>
    </div>
    <div className="stat-card__body">
      <span className="stat-card__value">{value}</span>
      {detail && <span className="stat-card__detail">{detail}</span>}
    </div>
    {trend && (
      <div className={`stat-card__trend ${trend.positive ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
        {trend.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        <span>{trend.value}</span>
      </div>
    )}
  </div>
);
