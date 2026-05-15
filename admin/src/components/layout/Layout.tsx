import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { AdminUser } from '../../types';
import { ROUTES } from '../../constants/routes';
import './Layout.css';

interface LayoutProps {
  user: AdminUser;
  onSignOut: () => void;
  children: React.ReactNode;
  unreadFeedback?: number;
}

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PACKS]: 'Packs',
  [ROUTES.PACK_NEW]: 'New Pack',
  [ROUTES.MODELS]: 'Models',
  [ROUTES.MODEL_NEW]: 'New Model',
  [ROUTES.USERS]: 'Users',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.MODERATION]: 'Moderation',
  [ROUTES.NOTIFICATIONS]: 'Notifications',
  [ROUTES.APP_CONFIG]: 'App Config',
  [ROUTES.REVENUE]: 'Revenue',
  [ROUTES.FEEDBACK]: 'Feedback',
};

export const Layout: React.FC<LayoutProps> = ({
  user,
  onSignOut,
  children,
  unreadFeedback,
}) => {
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] ?? 'Lumi Admin';

  return (
    <div className="layout">
      <Sidebar onSignOut={onSignOut} unreadFeedback={unreadFeedback} />
      <div className="layout__main">
        <Header user={user} pageTitle={pageTitle} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
};
