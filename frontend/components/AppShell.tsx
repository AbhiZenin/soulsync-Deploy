'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, logout } from '@/lib/api';

const primaryLinks = [
  ['/dashboard', 'Discover'],
  ['/matches', 'Matches'],
  ['/interests', 'Interests'],
  ['/messages', 'Messages'],
  ['/search', 'Search'],
  ['/discover', 'Discover+'],
];

const moreLinks = [
  ['/shortlist', 'Shortlist'],
  ['/notifications', 'Notifications'],
  ['/profile', 'My profile'],
  ['/preferences', 'Preferences'],
  ['/premium', 'Premium'],
  ['/premium-plus', 'Premium+'],
  ['/settings', 'Settings'],
];

type Account = {
  email: string;
  role: string;
};

export default function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const path = usePathname();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api<Account>('/account/me')
      .then((a) => {
        setAccount(a);
        setReady(true);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Opening SoulSync…</p>
      </div>
    );
  }

  return (
    <div className="matrimony-app">
      <header className="matrimony-nav">
        <div className="matrimony-nav-inner">
          <Link href="/dashboard" className="app-brand">
            <span className="app-brand-mark">S</span>

            <span className="app-brand-name">
              Soul<span>Sync</span>
            </span>
          </Link>

          <nav className="app-primary-nav">
            {primaryLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  path === href ? 'app-nav-link active' : 'app-nav-link'
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="app-nav-actions">
            <Link
              href="/shortlist"
              className="nav-icon-btn"
              aria-label="Shortlist"
            >
              ♡
            </Link>

            <Link
              href="/notifications"
              className="nav-icon-btn"
              aria-label="Notifications"
            >
              ♢
            </Link>

            <button
              type="button"
              className="app-account-button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
            >
              <span className="app-avatar">
                {account?.email?.[0]?.toUpperCase()}
              </span>

              <span className="app-account-copy">
                <strong>
                  {account?.email?.split('@')[0]}
                </strong>
                <small>My account</small>
              </span>

              <span className="account-chevron">⌄</span>
            </button>

            {menuOpen && (
              <div className="account-menu">
                {moreLinks.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}

                {account?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}

                <div className="account-menu-divider" />

                <button type="button" onClick={logout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="matrimony-main">
        <header className="matrimony-page-head">
          <div>
            <p className="matrimony-page-eyebrow">
              SOULSYNC
            </p>

            <h1>{title}</h1>

            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>

        {children}
      </main>

      <nav className="mobile-matrimony-nav">
        <Link href="/dashboard">
          <span>⌂</span>
          Discover
        </Link>

        <Link href="/matches">
          <span>♡</span>
          Matches
        </Link>

        <Link href="/interests">
          <span>✦</span>
          Interests
        </Link>

        <Link href="/messages">
          <span>✉</span>
          Messages
        </Link>

        <Link href="/profile">
          <span>◉</span>
          Profile
        </Link>
      </nav>
    </div>
  );
}
