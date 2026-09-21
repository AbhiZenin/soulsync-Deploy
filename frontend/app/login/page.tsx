'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setTokens } from '@/lib/api';

export default function Login() {
  const isDev = process.env.NODE_ENV === 'development';

  const [email, setEmail] = useState(
    isDev ? 'ananya@soulsync.dev' : ''
  );

  const [password, setPassword] = useState(
    isDev ? 'Password123!' : ''
  );

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const tokens = await api<{
        accessToken: string;
        refreshToken: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        auth: false,
      });

      setTokens(tokens.accessToken, tokens.refreshToken);
      router.push('/dashboard');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="matrimony-login">
      <section className="matrimony-hero">
        <div className="matrimony-hero-overlay" />

        <div className="matrimony-hero-content">
          <Link href="/" className="matrimony-brand">
            <span className="matrimony-brand-mark">S</span>

            <span>
              Soul<span>Sync</span>
            </span>
          </Link>

          <div className="matrimony-hero-copy">
            <p className="matrimony-kicker">
              MEANINGFUL MATCHES. LASTING BONDS.
            </p>

            <h1>
              Find someone
              <br />
              who feels like
              <br />
              <em>home.</em>
            </h1>

            <p className="matrimony-description">
              Discover compatible people who share your values,
              ambitions, traditions and vision for the future.
            </p>

            <div className="matrimony-trust">
              <div>
                <span className="trust-icon">✓</span>
                <span>
                  <strong>Verified</strong>
                  <small>profiles</small>
                </span>
              </div>

              <div>
                <span className="trust-icon">♡</span>
                <span>
                  <strong>Meaningful</strong>
                  <small>connections</small>
                </span>
              </div>

              <div>
                <span className="trust-icon">⌾</span>
                <span>
                  <strong>Privacy</strong>
                  <small>focused</small>
                </span>
              </div>
            </div>
          </div>

          <p className="matrimony-hero-footer">
            Your story deserves the right beginning.
          </p>
        </div>
      </section>

      <main className="matrimony-login-side">
        <div className="matrimony-mobile-brand">
          <Link href="/" className="matrimony-brand dark">
            <span className="matrimony-brand-mark">S</span>
            <span>
              Soul<span>Sync</span>
            </span>
          </Link>
        </div>

        <form className="matrimony-login-card" onSubmit={submit}>
          <div className="matrimony-card-heading">
            <p className="matrimony-kicker dark">
              WELCOME BACK
            </p>

            <h2>Continue your journey</h2>

            <p>
              Sign in to discover matches and meaningful
              connections.
            </p>
          </div>

          <div className="matrimony-form">
            <div className="matrimony-field">
              <label htmlFor="email">Email address</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="matrimony-field">
              <div className="matrimony-password-label">
                <label htmlFor="password">Password</label>

                <Link href="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="matrimony-error">
                {error}
              </div>
            )}

            <button
              className="matrimony-signin-btn"
              disabled={busy}
              type="submit"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          <div className="matrimony-divider">
            <span />
            <p>NEW TO SOULSYNC?</p>
            <span />
          </div>

          <Link
            href="/register"
            className="matrimony-create-btn"
          >
            Create your profile
          </Link>

          <p className="matrimony-register-copy">
            Join people looking for genuine, long-term
            relationships.
          </p>

        </form>

        <div className="matrimony-legal">
          <Link href="/privacy">Privacy</Link>
          <span>•</span>
          <Link href="/terms">Terms</Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} SoulSync</span>
        </div>
      </main>
    </div>
  );
}
