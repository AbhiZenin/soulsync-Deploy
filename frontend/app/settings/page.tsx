'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { api, logout } from '@/lib/api';

type Account={
  id:string; email:string; role:string; emailVerified:boolean;
  phoneNumber?:string; phoneVerified:boolean; identityVerified:boolean;
  status:string; createdAt:string;
};
type Block={userId:string;createdAt:string};
type View={userId:string;displayName:string;viewedAt:string};

export default function Settings(){
  const [a,setA]=useState<Account|null>(null);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [securityMsg,setSecurityMsg]=useState('');
  const [blocks,setBlocks]=useState<Block[]>([]);
  const [views,setViews]=useState<View[]>([]);
  const [phone,setPhone]=useState('');
  const [phoneCode,setPhoneCode]=useState('');
  const [verificationMsg,setVerificationMsg]=useState('');
  const [verificationError,setVerificationError]=useState('');
  const [verificationBusy,setVerificationBusy]=useState(false);

  async function load(){
    const[x,b,v]=await Promise.all([
      api<Account>('/account/me'), api<Block[]>('/blocks'), api<View[]>('/profile-viewers')
    ]);
    setA(x); setBlocks(b); setViews(v);
    if(x.phoneNumber) setPhone(x.phoneNumber);
  }
  useEffect(()=>{load()},[]);

  async function unblock(id:string){ await api(`/blocks/${id}`,{method:'DELETE'}); load(); }

  async function requestPhoneCode(){
    setVerificationMsg(''); setVerificationError(''); setVerificationBusy(true);
    try{
      const r=await api<{message:string;devCode?:string}>('/account/phone/request',{
        method:'POST', body:JSON.stringify({phoneNumber:phone})
      });
      if(r.devCode) setPhoneCode(r.devCode);
      setVerificationMsg(r.message);
    }catch(e){ setVerificationError((e as Error).message); }
    finally{ setVerificationBusy(false); }
  }

  async function verifyPhone(){
    setVerificationMsg(''); setVerificationError(''); setVerificationBusy(true);
    try{
      const r=await api<{message:string}>('/account/phone/verify',{
        method:'POST', body:JSON.stringify({code:phoneCode})
      });
      setVerificationMsg(r.message); setPhoneCode(''); await load();
    }catch(e){ setVerificationError((e as Error).message); }
    finally{ setVerificationBusy(false); }
  }

  return <AppShell title="Settings & privacy" subtitle="Manage identity verification, account security, and safety controls.">
    <div className="dashboard-grid">
      <section className="panel">
        <div className="panel-head"><h2>Account</h2><span className={`status ${a?.status}`}>{a?.status}</span></div>
        <div className="list">
          <div className="list-row"><span className="muted">Email</span><strong>{a?.email}</strong></div>
          <div className="list-row"><span className="muted">Email verified</span><strong>{a?.emailVerified?'✓ Yes':'No'}</strong></div>
          <div className="list-row"><span className="muted">Phone</span><strong>{a?.phoneNumber??'Not verified'}</strong></div>
          <div className="list-row"><span className="muted">Phone verified</span><strong>{a?.phoneVerified?'✓ Yes':'No'}</strong></div>
          <div className="list-row"><span className="muted">Identity status</span><strong className={`status ${a?.identityVerified?'ACTIVE':'PENDING'}`}>{a?.identityVerified?'VERIFIED':'EMAIL ONLY'}</strong></div>
          <div className="list-row"><span className="muted">Role</span><strong>{a?.role}</strong></div>
          <div className="list-row"><span className="muted">Member since</span><strong>{a&&new Date(a.createdAt).toLocaleDateString()}</strong></div>
        </div>
        <button className="danger-btn section-gap" onClick={logout}>Sign out on this device</button>
      </section>

      <section className="panel">
        <h2>Phone verification</h2>
        <p className="muted">A verified phone is required before sending/accepting interests or using chat. Use international format such as +14695551234.</p>
        <div className="form section-gap">
          <div className="field"><label>Phone number</label><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+14695551234"/></div>
          <button className="secondary-btn" type="button" onClick={requestPhoneCode} disabled={verificationBusy||!phone}>{a?.phoneVerified?'Verify a different number':'Send verification code'}</button>
          <div className="field"><label>6-digit code</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={phoneCode} onChange={e=>setPhoneCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="123456"/></div>
          <button className="primary-btn" type="button" onClick={verifyPhone} disabled={verificationBusy||phoneCode.length!==6}>{verificationBusy?'Working…':'Verify phone'}</button>
          {verificationMsg&&<div className="form-message success">{verificationMsg}</div>}
          {verificationError&&<div className="form-message error">{verificationError}</div>}
        </div>
      </section>
    </div>

    <section className="panel section-gap">
      <div className="panel-head"><h2>Blocked members</h2><span className="muted">Safety controls</span></div>
      <div className="list">{blocks.length?blocks.map(b=><div className="list-row" key={b.userId}><Link href={`/profile/${b.userId}`}>{b.userId.slice(0,8)}…</Link><button className="ghost-btn" onClick={()=>unblock(b.userId)}>Unblock</button></div>):<div className="empty">No blocked members.</div>}</div>
    </section>

    <section className="panel section-gap">
      <div className="panel-head"><h2>Recent profile viewers</h2><span className="muted">Latest 50 views</span></div>
      <div className="list">{views.length?views.map((v,i)=><div className="list-row" key={`${v.userId}-${i}`}><div><h4><Link href={`/profile/${v.userId}`}>{v.displayName}</Link></h4><p>{new Date(v.viewedAt).toLocaleString()}</p></div><Link className="secondary-btn" href={`/profile/${v.userId}`}>View profile</Link></div>):<div className="empty">No profile views yet.</div>}</div>
    </section>

    <section className="panel section-gap">
      <h2>Security</h2>
      <form className="form section-gap" onSubmit={async(e:FormEvent)=>{
        e.preventDefault();
        await api('/account/change-password',{method:'POST',body:JSON.stringify({currentPassword,newPassword})});
        setSecurityMsg('Password changed. Other refresh sessions were revoked.'); setCurrentPassword(''); setNewPassword('');
      }}>
        <div className="form-row">
          <div className="field"><label>Current password</label><input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required/></div>
          <div className="field"><label>New password</label><input type="password" minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required/></div>
        </div>
        {securityMsg&&<div className="form-message success">{securityMsg}</div>}
        <button className="primary-btn">Change password</button>
      </form>
      <hr style={{border:0,borderTop:'1px solid var(--line)',margin:'24px 0'}}/>
      <h3>Delete account</h3>
      <p className="muted">This permanently deletes your SoulSync account and associated profile data from this installation.</p>
      <button className="danger-btn" onClick={async()=>{const password=prompt('Enter your password to permanently delete the account');if(password&&confirm('This cannot be undone. Delete your account?')){await api('/account/delete',{method:'POST',body:JSON.stringify({password})});await logout()}}}>Delete my account</button>
    </section>
  </AppShell>;
}
