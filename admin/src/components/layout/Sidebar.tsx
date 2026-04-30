import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Box, Users, BarChart2,
  Shield, Bell, Settings, DollarSign, MessageSquare,
  LogOut, Moon, Sun,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { NavItem } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  onSignOut: () => void;
  unreadFeedback?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     path: ROUTES.DASHBOARD,     icon: LayoutDashboard },
  { label: 'Packs',         path: ROUTES.PACKS,         icon: Package },
  { label: 'Models',        path: ROUTES.MODELS,        icon: Box },
  { label: 'Users',         path: ROUTES.USERS,         icon: Users },
  { label: 'Analytics',     path: ROUTES.ANALYTICS,     icon: BarChart2 },
  { label: 'Moderation',    path: ROUTES.MODERATION,    icon: Shield },
  { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: 'App Config',    path: ROUTES.APP_CONFIG,    icon: Settings },
  { label: 'Revenue',       path: ROUTES.REVENUE,       icon: DollarSign },
  { label: 'Feedback',      path: ROUTES.FEEDBACK,      icon: MessageSquare },
];

export const Sidebar: React.FC<SidebarProps> = ({ onSignOut, unreadFeedback = 0 }) => {
  const { isDark, toggle } = useDarkMode();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">L</div>
        <span className="sidebar__logo-text">Lumi Admin</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasBadge = item.path === ROUTES.FEEDBACK && unreadFeedback > 0;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
              }
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {hasBadge && (
                <span className="sidebar__badge">{unreadFeedback > 99 ? '99+' : unreadFeedback}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__theme-toggle" onClick={toggle} aria-label="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button className="sidebar__signout" onClick={onSignOut}>
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};
