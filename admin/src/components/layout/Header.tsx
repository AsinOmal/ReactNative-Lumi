import React from 'react';
import { Search, Bell } from 'lucide-react';
import type { AdminUser } from '../../types';
import './Header.css';

interface HeaderProps {
  user: AdminUser;
  pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ user, pageTitle }) => {
  const initials = user.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

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

        <button className="header__icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

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
