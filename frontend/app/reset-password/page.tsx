'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '');
  }, []);

  const rules = useMemo(() => ({
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }), [password]);

  const strength = Object.values(rules).filter(Boolean).length;
  const matches = password.length > 0 && password === confirm;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('This reset link is incomplete. Request a new password reset link.');
      return;
    }

    if (!matches) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const result = await api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
        auth: false,
      });

      setMessage(result.message || 'Password updated successfully.');
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update password.');
    } finally {
      setBusy(false);
    }
  }

  if (message) {
    return (
      <main className="ss-reset-page">
        <section className="ss-reset-success">
          <Link href="/" className="ss-reset-brand">
            <span>S</span>
            SoulSync
          </Link>

          <div className="ss-reset-success-icon">✓</div>
          <div className="ss-reset-kicker">PASSWORD UPDATED</div>
          <h1>You&apos;re all set.</h1>
          <p>
            Your password has been changed successfully. Sign in again using
            your new password.
          </p>

          <Link href="/login" className="ss-reset-submit">
            Continue to sign in
          </Link>

          <small>
            If you did not request this change, contact SoulSync support.
          </small>
        </section>
      </main>
    );
  }

  return (
    <main className="ss-reset-page">
      <div className="ss-reset-decoration one" />
      <div className="ss-reset-decoration two" />

      <section className="ss-reset-shell">
        <aside className="ss-reset-story">
          <Link href="/" className="ss-reset-brand light">
            <span>S</span>
            SoulSync
          </Link>

          <div className="ss-reset-story-copy">
            <div className="ss-reset-story-kicker">ACCOUNT SECURITY</div>
            <h2>
              A fresh password.
              <br />
              Same meaningful connections.
            </h2>
            <p>
              Protect your profile, conversations, and private information
              with a strong new password.
            </p>
          </div>

          <div className="ss-reset-story-points">
            <div>
              <b>01</b>
              <span>The reset token stays hidden inside your secure link.</span>
            </div>
            <div>
              <b>02</b>
              <span>Use a password you do not reuse on another website.</span>
            </div>
            <div>
              <b>03</b>
              <span>After updating, sign in again with your new password.</span>
            </div>
          </div>

          <footer>
            <span>SOULSYNC</span>
            <span>Private by design</span>
          </footer>
        </aside>

        <form className="ss-reset-form-card" onSubmit={submit}>
          <div className="ss-reset-kicker">NEW PASSWORD</div>
          <h1>Choose a new password</h1>
          <p className="ss-reset-intro">
            Make it strong, memorable, and different from passwords you use
            elsewhere.
          </p>

          <div className={`ss-reset-link ${token ? 'ok' : 'bad'}`}>
            <span>{token ? '✓' : '!'}</span>
            <div>
              <strong>
                {token ? 'Secure reset link detected' : 'Reset link incomplete'}
              </strong>
              <small>
                {token
                  ? 'Your reset token was loaded automatically.'
                  : 'Request a new password reset link.'}
              </small>
            </div>
          </div>

          <label className="ss-reset-field">
            <span>New password</span>
            <div className="ss-reset-password">
              <input
                type={show ? 'text' : 'password'}
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                required
              />
              <button type="button" onClick={() => setShow(v => !v)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <label className="ss-reset-field">
            <span>Confirm new password</span>
            <input
              type={show ? 'text' : 'password'}
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Enter it again"
              required
            />
            {confirm && (
              <small className={matches ? 'ss-reset-match ok' : 'ss-reset-match bad'}>
                {matches ? '✓ Passwords match' : 'Passwords do not match yet'}
              </small>
            )}
          </label>

          <div className="ss-reset-strength">
            <div className="ss-reset-strength-title">
              <span>Password strength</span>
              <strong>{['Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]}</strong>
            </div>

            <div className="ss-reset-bars">
              {[1, 2, 3, 4].map(level => (
                <span key={level} className={strength >= level ? 'on' : ''} />
              ))}
            </div>

            <div className="ss-reset-rules">
              <Rule ok={rules.length}>8+ characters</Rule>
              <Rule ok={rules.letter}>Letter</Rule>
              <Rule ok={rules.number}>Number</Rule>
              <Rule ok={rules.special}>Special character</Rule>
            </div>
          </div>

          {error && <div className="ss-reset-error">{error}</div>}

          <button
            className="ss-reset-submit"
            type="submit"
            disabled={busy || !token || !matches}
          >
            {busy ? 'Updating password...' : 'Update password'}
          </button>

          <Link href="/login" className="ss-reset-return">
            ← Return to sign in
          </Link>

          <p className="ss-reset-note">
            Reset links should only be used by the person who requested them.
          </p>
        </form>
      </section>
    </main>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={ok ? 'done' : ''}>
      <i>{ok ? '✓' : '·'}</i>
      {children}
    </span>
  );
}
