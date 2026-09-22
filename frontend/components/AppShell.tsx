'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {api, logout} from '@/lib/api';

type Account = {
  email: string;
  role: string;
};

const primary = [
  ['/dashboard', 'Home', '⌂'],
  ['/matches', 'Discover', '♡'],
  ['/search', 'Search', '⌕'],
  ['/interests', 'Interests', '✦'],
  ['/messages', 'Messages', '✉'],
] as const;

const saved = [
  ['/shortlist', 'Shortlist', '☆'],
  ['/notifications', 'Notifications', '●'],
] as const;

const profile = [
  ['/profile', 'My profile', '◉'],
  ['/preferences', 'Preferences', '⌁'],
  ['/settings', 'Settings', '⚙'],
] as const;

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={active ? 'nav-item active ss-app-nav-item' : 'nav-item ss-app-nav-item'}
    >
      <span className="ss-app-nav-icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

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
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let mounted = true;

    api<Account>('/account/me')
      .then(value => {
        if (mounted) setAccount(value);
      })
      .catch(() => {
        if (mounted) router.replace('/login');
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const active = (href: string) =>
    path === href || (href !== '/dashboard' && path.startsWith(`${href}/`));

  return (
    <div className="app-layout ss-app-layout">
      <aside className="sidebar ss-app-sidebar">
        <div className="ss-app-sidebar-top">
          <Link href="/dashboard" className="brand ss-app-brand">
            <span className="brand-mark">S</span>
            <span>
              SoulSync
              <small>meaningful matches</small>
            </span>
          </Link>

          <nav className="ss-app-nav">
            <div className="ss-app-nav-group">
              <span className="ss-app-nav-label">EXPLORE</span>
              {primary.map(([href, label, icon]) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={active(href)}
                />
              ))}
            </div>

            <div className="ss-app-nav-group">
              <span className="ss-app-nav-label">YOUR SPACE</span>
              {saved.map(([href, label, icon]) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={active(href)}
                />
              ))}
            </div>

            <div className="ss-app-nav-group">
              <span className="ss-app-nav-label">PROFILE</span>
              {profile.map(([href, label, icon]) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  active={active(href)}
                />
              ))}
            </div>

            <div className="ss-app-nav-group">
              <span className="ss-app-nav-label">MEMBERSHIP</span>
              <NavLink
                href="/premium"
                label="Premium"
                icon="◇"
                active={active('/premium')}
              />
              <NavLink
                href="/premium-plus"
                label="Premium+"
                icon="✧"
                active={active('/premium-plus')}
              />
              <NavLink
                href="/discover"
                label="Discover+"
                icon="⌁"
                active={active('/discover')}
              />
              {account?.role === 'ADMIN' && (
                <NavLink
                  href="/admin"
                  label="Admin"
                  icon="▣"
                  active={active('/admin')}
                />
              )}
            </div>
          </nav>
        </div>

        <div className="sidebar-foot ss-app-sidebar-foot">
          <div className="mini-account ss-app-account">
            <span className="avatar tiny ss-app-account-avatar">
              {account?.email?.[0]?.toUpperCase() ?? 'S'}
            </span>
            <div>
              <strong>
                {account?.email?.split('@')[0] ?? 'Loading…'}
              </strong>
              <small>{account?.role ?? 'Member'}</small>
            </div>
          </div>

          <button
            type="button"
            className="ghost-btn ss-app-signout"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main ss-app-main">
        <div className="ss-app-mobile-bar">
          <Link href="/dashboard" className="ss-app-mobile-brand">
            <span className="brand-mark">S</span>
            <strong>SoulSync</strong>
          </Link>
          <div>
            <Link href="/search">Search</Link>
            <Link href="/messages">Messages</Link>
          </div>
        </div>

        <header className="page-head ss-app-page-head">
          <div>
            <p className="eyebrow">SOULSYNC</p>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="ss-app-head-actions">
            <Link href="/search" className="ss-app-head-link">
              ⌕ <span>Find someone</span>
            </Link>
            <Link href="/interests" className="ss-app-head-link">
              ♡ <span>Interests</span>
            </Link>
            <Link href="/messages" className="ss-app-head-link">
              ✉ <span>Messages</span>
            </Link>
          </div>
        </header>

        <div className="ss-app-content">{children}</div>

        <nav className="ss-app-bottom-nav" aria-label="Mobile navigation">
          {primary.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              className={active(href) ? 'active' : ''}
            >
              <span>{icon}</span>
              <small>{label}</small>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
