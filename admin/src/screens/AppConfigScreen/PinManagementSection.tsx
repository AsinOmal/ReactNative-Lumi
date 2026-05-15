import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { usePinReset } from '../../hooks/usePinReset';

export const PinManagementSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    searching,
    resetting,
    foundUser,
    searchError,
    resetSuccess,
    searchUserByEmail,
    resetUserPin,
    clearResult,
  } = usePinReset();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    clearResult();
    setShowConfirm(false);
    searchUserByEmail(email);
  };

  const handleReset = async () => {
    if (!foundUser) {
      return;
    }
    await resetUserPin(foundUser.uid);
    setShowConfirm(false);
  };

  return (
    <div className="app-config__card">
      <div className="app-config__header">
        <KeyRound size={16} className="app-config__icon" />
        <div>
          <p className="app-config__card-title">PIN Management</p>
          <p className="app-config__card-sub">
            Reset a parent's PIN by email. The parent will see a banner on their
            next app open.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
      >
        <input
          type="email"
          placeholder="parent@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearResult();
            setShowConfirm(false);
          }}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '14px',
            fontFamily: 'var(--font-family)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!email.trim() || searching}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            opacity: searching ? 0.7 : 1,
          }}
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searchError && (
        <p style={{ color: '#E53E3E', fontSize: '13px', margin: 0 }}>
          {searchError}
        </p>
      )}

      {foundUser && !resetSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'var(--color-body-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--color-text-primary)',
              }}
            >
              {foundUser.displayName}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              {foundUser.email} · {foundUser.uid}
            </p>
          </div>
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#E53E3E',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Reset PIN
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: 'var(--color-border)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  background: '#E53E3E',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {resetting ? 'Resetting…' : 'Confirm Reset'}
              </button>
            </div>
          )}
        </div>
      )}

      {resetSuccess && (
        <p
          style={{
            color: 'var(--color-success, #38A169)',
            fontSize: '14px',
            fontWeight: 600,
            margin: 0,
          }}
        >
          ✓ PIN reset. The parent will see a banner on their next app open.
        </p>
      )}
    </div>
  );
};
