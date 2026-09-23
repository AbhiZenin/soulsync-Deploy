'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {api, logout} from '@/lib/api';

type Account = {
  email: string;
  role: string;
};

const mainLinks = [
  ['/dashboard', 'Home', '⌂'],
  ['/matches', 'Discover', '♡'],
  ['/search', 'Search', '⌕'],
  ['/interests', 'Interests', '✦'],
  ['/messages', 'Messages', '✉'],
  ['/shortlist', 'Shortlist', '☆'],
] as const;

const accountLinks = [
  ['/profile', 'My profile', '◉'],
  ['/preferences', 'Preferences', '⌁'],
  ['/settings', 'Settings', '⚙'],
  ['/premium', 'Premium', '◇'],
] as const;

function NavLink({href, label, icon, active}:{href:string; label:string; icon:string; active:boolean}) {
  return (
    <Link href={href} className={active ? 'nav-item active ss-clean-nav-item' : 'nav-item ss-clean-nav-item'}>
      <span className="ss-clean-nav-icon">{icon}</span>
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
    <div className="app-layout ss-clean-layout">
      <aside className="sidebar ss-clean-sidebar">
        <div className="ss-clean-sidebar-scroll">
          <Link href="/dashboard" className="brand ss-clean-brand">
            <span className="brand-mark">S</span>
            <span>
              SoulSync
              <small>meaningful matches</small>
            </span>
          </Link>

          <nav className="ss-clean-nav">
            <div className="ss-clean-nav-group">
              <span className="ss-clean-nav-label">EXPLORE</span>
              {mainLinks.map(([href, label, icon]) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={active(href)} />
              ))}
            </div>

            <div className="ss-clean-nav-group">
              <span className="ss-clean-nav-label">ACCOUNT</span>
              {accountLinks.map(([href, label, icon]) => (
                <NavLink key={href} href={href} label={label} icon={icon} active={active(href)} />
              ))}
              {account?.role === 'ADMIN' && (
                <NavLink href="/admin" label="Admin" icon="▣" active={active('/admin')} />
              )}
            </div>
          </nav>
        </div>

        <div className="ss-clean-sidebar-foot">
          <div className="ss-clean-account">
            <span className="ss-clean-account-avatar">
              {account?.email?.[0]?.toUpperCase() ?? 'S'}
            </span>
            <div>
              <strong>{account?.email?.split('@')[0] ?? 'Member'}</strong>
              <small>{account?.role ?? 'USER'}</small>
            </div>
          </div>

          <button
            type="button"
            className="ghost-btn ss-clean-signout"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main ss-clean-main">
        <div className="ss-clean-mobile-top">
          <Link href="/dashboard" className="ss-clean-mobile-brand">
            <span className="brand-mark">S</span>
            <strong>SoulSync</strong>
          </Link>
          <div>
            <Link href="/notifications" aria-label="Notifications">●</Link>
            <Link href="/messages" aria-label="Messages">✉</Link>
          </div>
        </div>

        <header className="page-head ss-clean-page-head">
          <div>
            <p className="eyebrow">SOULSYNC</p>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <div className="ss-clean-head-actions">
            <Link href="/notifications">● <span>Notifications</span></Link>
            <Link href="/messages">✉ <span>Messages</span></Link>
          </div>
        </header>

        <div className="ss-clean-content">{children}</div>

        <nav className="ss-clean-bottom-nav" aria-label="Mobile navigation">
          {mainLinks.slice(0, 5).map(([href, label, icon]) => (
            <Link key={href} href={href} className={active(href) ? 'active' : ''}>
              <span>{icon}</span>
              <small>{label}</small>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
