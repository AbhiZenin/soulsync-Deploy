'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api, logout } from '@/lib/api';

type Account = {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  status: string;
  createdAt: string;
};

type Block = {
  userId: string;
  createdAt: string;
};

type View = {
  userId: string;
  displayName: string;
  viewedAt: string;
};

export default function Settings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [views, setViews] = useState<View[]>([]);
  const [premiumCanViewVisitors, setPremiumCanViewVisitors] = useState(false);

  async function load() {
    const [accountData, blockData, viewData] = await Promise.all([
      api<Account>('/account/me'),
      api<Block[]>('/blocks'),
      api<{ entitlements: string[] }>('/subscriptions/me')
        .then(subscription => {
          const allowed =
            subscription.entitlements.includes('VIEW_PROFILE_VISITORS');
          setPremiumCanViewVisitors(allowed);

          return allowed
            ? api<View[]>('/profile-viewers')
            : Promise.resolve([] as View[]);
        }),
    ]);

    setAccount(accountData);
    setBlocks(blockData);
    setViews(viewData);
  }

  useEffect(() => {
    load();
  }, []);

  async function unblock(id: string) {
    await api(`/blocks/${id}`, {
      method: 'DELETE',
    });

    await load();
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();

    setSecurityMsg('');
    setSecurityError('');

    try {
      await api('/account/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setSecurityMsg(
        'Password changed. Other refresh sessions were revoked.'
      );

      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setSecurityError((e as Error).message);
    }
  }

  return (
    <AppShell
      title="Settings & privacy"
      subtitle="Manage your account, security, and privacy controls."
    >
      
      <section className="ss-settings-overview">
        <div className="ss-settings-overview-copy">
          <span className="ss-settings-kicker">ACCOUNT &amp; PRIVACY</span>
          <h2>Manage your SoulSync account</h2>
          <p>
            Review your account status, safety controls, and
            profile visibility from one place.
          </p>
        </div>

        <div className="ss-settings-overview-badges">
          <span className="ss-settings-overview-badge">
            <strong>Secure</strong>
            <small>Email verified</small>
          </span>
          <span className="ss-settings-overview-badge">
            <strong>Private</strong>
            <small>You control access</small>
          </span>
        </div>
      </section>

<div className="dashboard-grid ss-settings-top">
        <section className="panel ss-settings-account">
          <div className="panel-head">
            <h2>Account</h2>
            <span className={`status ${account?.status}`}>
              {account?.status}
            </span>
          </div>

          <div className="list">
            <div className="list-row">
              <span className="muted">Email</span>
              <strong>{account?.email}</strong>
            </div>

            <div className="list-row">
              <span className="muted">Email verified</span>
              <strong>
                {account?.emailVerified ? '✓ Yes' : 'No'}
              </strong>
            </div>

            <div className="list-row">
              <span className="muted">Role</span>
              <strong>{account?.role}</strong>
            </div>

            <div className="list-row">
              <span className="muted">Member since</span>
              <strong>
                {account &&
                  new Date(account.createdAt).toLocaleDateString()}
              </strong>
            </div>
          </div>

          <button
            className="danger-btn section-gap"
            onClick={logout}
          >
            Sign out on this device
          </button>
        </section>

        <section className="panel ss-settings-verification">
          <h2>Account verification</h2>

          <p className="muted">
            SoulSync uses email verification to confirm your account.
          </p>

          <div className="list section-gap">
            <div className="list-row">
              <span className="muted">
                Verification status
              </span>

              <strong
                className={`status ${
                  account?.emailVerified
                    ? 'ACTIVE'
                    : 'PENDING'
                }`}
              >
                {account?.emailVerified
                  ? 'EMAIL VERIFIED'
                  : 'PENDING'}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel section-gap ss-settings-blocked">
        <div className="panel-head">
          <h2>Blocked members</h2>
          <span className="muted">Safety controls</span>
        </div>

        <div className="list">
          {blocks.length ? (
            blocks.map((block) => (
              <div
                className="list-row"
                key={block.userId}
              >
                <Link href={`/profile/${block.userId}`}>
                  {block.userId.slice(0, 8)}…
                </Link>

                <button
                  className="ghost-btn"
                  onClick={() => unblock(block.userId)}
                >
                  Unblock
                </button>
              </div>
            ))
          ) : (
            <div className="empty">
              No blocked members.
            </div>
          )}
        </div>
      </section>

      {premiumCanViewVisitors ? (
<section className="panel section-gap ss-settings-viewers">
        <div className="panel-head">
          <h2>Recent profile viewers</h2>
          <span className="muted">
            Latest 50 views
          </span>
        </div>

        <div className="list">
          {views.length ? (
            views.map((view, index) => (
              <div
                className="list-row"
                key={`${view.userId}-${index}`}
              >
                <div>
                  <h4>
                    <Link
                      href={`/profile/${view.userId}`}
                    >
                      {view.displayName}
                    </Link>
                  </h4>

                  <p>
                    {new Date(
                      view.viewedAt
                    ).toLocaleString()}
                  </p>
                </div>

                <Link
                  className="secondary-btn"
                  href={`/profile/${view.userId}`}
                >
                  View profile
                </Link>
              </div>
            ))
          ) : (
            <div className="empty">
              No profile views yet.
            </div>
          )}
        </div>
      </section>
      ) : (
        <section className="panel section-gap ss-premium-visitors-lock">
          <div className="panel-head">
            <div>
              <span className="ss-premium-lock-badge">PREMIUM</span>
              <h2>Recent profile viewers</h2>
            </div>
          </div>
          <p className="muted">
            Upgrade to Premium to see which members have viewed your profile.
          </p>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              window.location.href = '/premium';
            }}
          >
            View Premium plans
          </button>
        </section>
      )}

      <section className="panel section-gap">
        <h2>Security</h2>

        <form
          className="form section-gap"
          onSubmit={changePassword}
        >
          <div className="form-row">
            <div className="field">
              <label>Current password</label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                required
              />
            </div>

            <div className="field">
              <label>New password</label>

              <input
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {securityMsg && (
            <div className="form-message success">
              {securityMsg}
            </div>
          )}

          {securityError && (
            <div className="form-message error">
              {securityError}
            </div>
          )}

          <button className="primary-btn">
            Change password
          </button>
        </form>

        <hr
          style={{
            border: 0,
            borderTop: '1px solid var(--line)',
            margin: '24px 0',
          }}
        />

        <h3>Delete account</h3>

        <p className="muted">
          This permanently deletes your SoulSync account
          and associated profile data from this
          installation.
        </p>

        <button
          className="danger-btn"
          onClick={async () => {
            const password = prompt(
              'Enter your password to permanently delete the account'
            );

            if (
              password &&
              confirm(
                'This cannot be undone. Delete your account?'
              )
            ) {
              await api('/account/delete', {
                method: 'POST',
                body: JSON.stringify({ password }),
              });

              await logout();
            }
          }}
        >
          Delete my account
        </button>
      </section>
    </AppShell>
  );
}