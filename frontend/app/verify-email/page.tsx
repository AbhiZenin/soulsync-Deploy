'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [legacyToken, setLegacyToken] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);

    setEmail(q.get('email') ?? '');

    // Keep legacy token support temporarily, but never read an OTP
    // from the URL.
    setLegacyToken(q.get('token') ?? '');
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown(current => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  async function verify(e?: FormEvent) {
    e?.preventDefault();

    setError('');
    setMsg('');

    if (!legacyToken) {
      if (!email.trim()) {
        setError('Enter your email address.');
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        setError('Enter the 6-digit verification code from your email.');
        return;
      }
    }

    setBusy(true);

    try {
      const payload =
        legacyToken && (!email || !code)
          ? { token: legacyToken }
          : {
              email: email.trim(),
              code
            };

      const r = await api<{ message: string }>(
        '/auth/verify-email',
        {
          method: 'POST',
          body: JSON.stringify(payload),
          auth: false
        }
      );

      setVerified(true);
      setMsg(r.message || 'Your email has been verified.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to verify your email.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setMsg('');

    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }

    setBusy(true);

    try {
      const r = await api<{
        message: string;
        expiresInSeconds?: number;
        retryAfterSeconds?: number;
      }>(
        '/auth/email-otp/resend',
        {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim()
          }),
          auth: false
        }
      );

      // Never put a server-returned development OTP into the input.
      setCode('');

      setResendCooldown(
        Math.max(1, r.retryAfterSeconds ?? 60)
      );

      setMsg(
        r.message ||
          'If the account exists, a new verification code has been sent.'
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to resend the verification code.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ss-verify-page">
      <section className="ss-verify-card">
        <Link href="/" className="ss-verify-brand">
          <span>S</span>
          <strong>
            Soul<span>Sync</span>
          </strong>
        </Link>

        {!verified ? (
          <>
            <div className="ss-verify-icon">
              ✉
            </div>

            <p className="ss-verify-eyebrow">
              EMAIL VERIFICATION
            </p>

            <h1>Check your inbox</h1>

            <p className="ss-verify-intro">
              We sent a 6-digit verification code to your
              email. Enter it below to activate your SoulSync
              account.
            </p>

            <form
              className="ss-verify-form"
              onSubmit={verify}
            >
              {!legacyToken && (
                <>
                  <label className="ss-verify-field">
                    <span>Email address</span>

                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label className="ss-verify-field">
                    <span>Verification code</span>

                    <input
                      className="ss-verify-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={code}
                      onChange={e =>
                        setCode(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6)
                        )
                      }
                      placeholder="000000"
                      required
                      autoFocus
                    />

                    <small>
                      The code expires after a short period.
                      Never share it with anyone.
                    </small>
                  </label>
                </>
              )}

              {msg && (
                <div className="ss-verify-message success">
                  {msg}
                </div>
              )}

              {error && (
                <div className="ss-verify-message error">
                  {error}
                </div>
              )}

              <button
                className="primary-btn ss-verify-primary"
                disabled={
                  busy ||
                  (!legacyToken && code.length !== 6)
                }
                type="submit"
              >
                {busy
                  ? 'Verifying...'
                  : 'Verify email'}
              </button>

              {!legacyToken && (
                <div className="ss-verify-resend">
                  <span>Didn't receive the email?</span>

                  <button
                    type="button"
                    onClick={resend}
                    disabled={
                      busy || resendCooldown > 0
                    }
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend code'}
                  </button>
                </div>
              )}
            </form>

            <div className="ss-verify-footer">
              Already verified?{' '}
              <Link href="/login">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          <div className="ss-verify-success">
            <div className="ss-verify-success-icon">
              ✓
            </div>

            <p className="ss-verify-eyebrow">
              EMAIL VERIFIED
            </p>

            <h1>You're verified</h1>

            <p>
              Your email address has been verified successfully.
              You can now sign in to SoulSync.
            </p>

            <Link
              href="/login"
              className="primary-btn ss-verify-login"
            >
              Continue to sign in
            </Link>
          </div>
        )}
      </section>

      <aside className="ss-verify-aside">
        <div>
          <span className="ss-verify-aside-kicker">
            SOULSYNC
          </span>

          <h2>
            Meaningful connections start with trust.
          </h2>

          <p>
            Email verification helps us build a safer,
            more authentic community for people looking
            for serious relationships.
          </p>
        </div>

        <div className="ss-verify-trust">
          <span>✓ Verified members</span>
          <span>⌾ Privacy controls</span>
          <span>♡ Meaningful matches</span>
        </div>
      </aside>
    </main>
  );
}
