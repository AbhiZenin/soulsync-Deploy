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

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setEmail(q.get('email') ?? '');
    setCode(q.get('code') ?? '');
    setLegacyToken(q.get('token') ?? '');
  }, []);

  async function verify(e?: FormEvent) {
    e?.preventDefault();
    setError('');
    setMsg('');
    setBusy(true);
    try {
      const payload = legacyToken && (!email || !code) ? { token: legacyToken } : { email, code };
      const r = await api<{message:string}>('/auth/verify-email', { method:'POST', body:JSON.stringify(payload), auth:false });
      setMsg(r.message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setMsg('');
    if (!email) { setError('Enter your email first.'); return; }
    setBusy(true);
    try {
      const r = await api<{message:string;devCode?:string}>('/auth/email-otp/resend', {
        method:'POST', body:JSON.stringify({email}), auth:false,
      });
      if (r.devCode) setCode(r.devCode);
      setMsg(r.message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="auth-main" style={{minHeight:'100vh'}}>
    <form className="auth-card" onSubmit={verify}>
      <p className="eyebrow">EMAIL VERIFICATION</p>
      <h1>Enter your 6-digit code</h1>
      <p>We send a short-lived code to your email. In local development the code is filled automatically.</p>
      <div className="form">
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required={!legacyToken}/></div>
        {!legacyToken && <div className="field"><label>Verification code</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456" required/></div>}
        {msg&&<div className="form-message success">{msg}</div>}
        {error&&<div className="form-message error">{error}</div>}
        <button className="primary-btn" disabled={busy || (!legacyToken && code.length!==6)}>{busy?'Checking…':'Verify email'}</button>
        {!legacyToken && <button type="button" className="ghost-btn" onClick={resend} disabled={busy}>Resend code</button>}
      </div>
      <div className="auth-links"><Link href="/login">Go to sign in</Link></div>
    </form>
  </div>;
}
