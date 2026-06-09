import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Bell,
  ArrowRight,
  Heart,
  AlertTriangle,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminUser } from '../../types';
import { Button } from '../common/Button';
import { ROUTES } from '../../constants/routes';
import { useContentInsights } from '../../hooks/useContentInsights';
import './Header.css';

interface HeaderProps {
  user: AdminUser;
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ user, pageTitle }) => {
  const navigate = useNavigate();
  const { summary, alerts, loading } = useContentInsights();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        event.target instanceof Node &&
        !popoverRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const alertCount = alerts.length;

  return (
    <header className="header">
      <span className="header__page-title">{pageTitle}</span>

      <div className="header__right">
        <div className="header__search">
          <Search size={15} className="header__search-icon" />
          <input
            className="header__search-input"
            placeholder="Search users, packs, words..."
            aria-label="Search"
          />
          <kbd className="header__search-kbd">⌘K</kbd>
        </div>

        <div className="header__alerts-wrap" ref={popoverRef}>
          <button
            className={`header__icon-btn ${
              open ? 'header__icon-btn--active' : ''
            }`}
            aria-label="Notifications"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Bell size={18} />
            {alertCount > 0 && (
              <span className="header__icon-badge">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>

          {open && (
            <div className="header__alerts-popover" role="menu">
              <div className="header__alerts-head">
                <div>
                  <p className="header__alerts-title">Content alerts</p>
                  <p className="header__alerts-sub">
                    Live signals from scans, wishlists, feedback, and previews
                  </p>
                </div>
                <button
                  type="button"
                  className="header__alerts-close"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>

              <div className="header__alerts-metrics">
                <Metric
                  label="Users"
                  value={summary.totalUsers}
                  icon={<Users size={14} />}
                  tone="users"
                />
                <Metric
                  label="Scans"
                  value={summary.totalScans}
                  icon={<Sparkles size={14} />}
                  tone="scans"
                />
                <Metric
                  label="Wishlisted"
                  value={summary.totalWishlistRequests}
                  icon={<Heart size={14} />}
                  tone="wishlist"
                />
                <Metric
                  label="Reports"
                  value={summary.unreadReports}
                  icon={<AlertTriangle size={14} />}
                  tone="reports"
                />
              </div>

              <div className="header__alerts-list">
                {loading ? (
                  <p className="header__alerts-empty">Loading alerts…</p>
                ) : alerts.length === 0 ? (
                  <p className="header__alerts-empty">
                    No active content alerts right now.
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`header__alert-item header__alert-item--${alert.tone}`}
                    >
                      <div className="header__alert-dot" />
                      <div className="header__alert-copy">
                        <strong>{alert.title}</strong>
                        <span>{alert.body}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="header__alerts-footer">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight size={14} />}
                  onClick={() => {
                    setOpen(false);
                    navigate(ROUTES.ANALYTICS);
                  }}
                >
                  Open Analytics
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    navigate(ROUTES.FEEDBACK);
                  }}
                >
                  Support Inbox
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="header__avatar" title={user.email}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={initials}
              className="header__avatar-img"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>
    </header>
  );
};

const Metric: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'users' | 'scans' | 'wishlist' | 'reports';
}> = ({ label, value, icon, tone }) => (
  <div className={`header__metric header__metric--${tone}`}>
    <span className="header__metric-icon">{icon}</span>
    <div>
      <strong>{value.toLocaleString('en-US')}</strong>
      <span>{label}</span>
    </div>
  </div>
);
