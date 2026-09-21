'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api<{ devVerificationCode?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
        auth: false,
      });
      const params = new URLSearchParams({ email });
      if (r.devVerificationCode) params.set('code', r.devVerificationCode);
      router.push(`/verify-email?${params.toString()}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-page">
    <aside className="auth-aside">
      <Link href="/" className="brand"><span className="brand-mark">S</span><span>SoulSync</span></Link>
      <div>
        <p className="eyebrow">CREATE YOUR PROFILE</p>
        <h2>Serious intent deserves a better place to meet.</h2>
        <p>Start with a secure account. We verify your email before sign-in so you can connect securely.</p>
      </div>
      <p>Your email address is never displayed publicly.</p>
    </aside>
    <main className="auth-main">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">JOIN SOULSYNC</p>
        <h1>Create account</h1>
        <p>It takes less than a minute to begin.</p>
        <div className="form">
          <div className="field"><label>Display name</label><input value={displayName} onChange={e=>setName(e.target.value)} maxLength={120} required/></div>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="field"><label>Password</label><input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><small className="muted">Use at least 8 characters.</small></div>
          {error&&<div className="form-message error">{error}</div>}
          <button className="primary-btn" disabled={busy}>{busy?'Creating…':'Create account'}</button>
        </div>
        <div className="auth-links">Already registered? <Link href="/login">Sign in</Link></div>
      </form>
    </main>
  </div>;
}
