'use client';

import Link from 'next/link';
import {FormEvent, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {api, setTokens} from '@/lib/api';
import {warmSoulSyncBackend} from '@/components/BackendWakeup';

type BackendState = 'checking' | 'starting' | 'ready' | 'unknown';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [backendState, setBackendState] = useState<BackendState>('checking');
  const router = useRouter();

  const warmupRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    const slowTimer = window.setTimeout(() => {
      setBackendState(current => current === 'checking' ? 'starting' : current);
    }, 900);

    const promise = warmSoulSyncBackend()
      .then(ok => {
        setBackendState(ok ? 'ready' : 'unknown');
        return ok;
      })
      .finally(() => window.clearTimeout(slowTimer));

    warmupRef.current = promise;

    return () => {
      window.clearTimeout(slowTimer);
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (warmupRef.current && backendState !== 'ready') {
        setBackendState('starting');
        await warmupRef.current;
      }

      const t = await api<{accessToken: string; refreshToken: string}>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({email, password}),
          auth: false,
        }
      );

      setTokens(t.accessToken, t.refreshToken);

      // replace() avoids leaving the login page in browser history.
      router.replace('/dashboard');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const serviceMessage =
    backendState === 'starting'
      ? 'Starting SoulSync services… The free server may need a little time after being idle.'
      : backendState === 'ready'
        ? 'SoulSync services are ready.'
        : backendState === 'checking'
          ? 'Checking SoulSync services…'
          : 'SoulSync will connect when you sign in.';

  return (
    <div className="auth-page ss-login-page">
      <aside className="auth-aside ss-login-aside">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>SoulSync</span>
        </Link>

        <div className="ss-login-story">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Your next meaningful connection could be waiting.</h2>
          <p>
            Review compatible matches, incoming interests, your shortlist,
            and conversations in one calm, private space.
          </p>

          <div className="ss-login-points">
            <span>✓ Compatibility-led discovery</span>
            <span>✓ Mutual-interest conversations</span>
            <span>✓ Privacy and visibility controls</span>
          </div>
        </div>

        <div className="ss-login-aside-note">
          <span>SOULSYNC</span>
          <p>Meaningful matches, built with intention.</p>
        </div>
      </aside>

      <main className="auth-main ss-login-main">
        <form className="auth-card ss-login-card" onSubmit={submit}>
          <div className="ss-login-heading">
            <p className="eyebrow">SIGN IN</p>
            <h1>Welcome back</h1>
            <p>Continue your SoulSync journey.</p>
          </div>

          <div className={`ss-login-service ${backendState}`}>
            <span className="ss-login-service-dot" />
            <div>
              <strong>
                {backendState === 'starting'
                  ? 'Starting secure services'
                  : backendState === 'ready'
                    ? 'Services ready'
                    : 'Connecting to SoulSync'}
              </strong>
              <p>{serviceMessage}</p>
            </div>
          </div>

          <div className="form">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <div className="ss-login-label-row">
                <label>Password</label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="form-message error">{error}</div>}

            <button className="primary-btn ss-login-submit" disabled={busy}>
              {busy
                ? backendState === 'starting'
                  ? 'Starting SoulSync…'
                  : 'Signing in…'
                : 'Sign in'}
            </button>
          </div>

          <div className="ss-login-new">
            <span>New to SoulSync?</span>
            <Link href="/register">Create your profile →</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
