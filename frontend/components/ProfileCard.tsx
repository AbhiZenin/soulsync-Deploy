'use client';

import Link from 'next/link';
import {useState} from 'react';
import SecureImage from '@/components/SecureImage';
import {api} from '@/lib/api';
import type {ProfileCard as Card} from '@/lib/types';

function isRecent(lastActiveAt?: string) {
  if (!lastActiveAt) return false;
  const value = new Date(lastActiveAt).getTime();
  return Number.isFinite(value) && Date.now() - value < 7 * 24 * 60 * 60 * 1000;
}

export default function ProfileCard({
  profile,
  onChanged,
}: {
  profile: Card;
  onChanged?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [saved, setSaved] = useState(false);

  async function interest() {
    if (busy || sent) return;

    setBusy(true);
    try {
      await api(`/interests/${profile.userId}`, {method: 'POST'});
      setSent(true);
      onChanged?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Unable to send interest');
    } finally {
      setBusy(false);
    }
  }

  async function shortlist() {
    try {
      await api(`/shortlist/${profile.userId}`, {method: 'POST'});
      setSaved(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Unable to save profile');
    }
  }

  return (
    <article className="profile-card ss-romance-card">
      <Link
        href={`/profile/${profile.userId}`}
        className="profile-photo ss-romance-photo"
      >
        {profile.primaryPhoto ? (
          <SecureImage
            path={profile.primaryPhoto}
            alt={profile.displayName}
          />
        ) : (
          <div className="photo-placeholder ss-romance-placeholder">
            {profile.displayName?.[0] ?? 'S'}
          </div>
        )}

        <div className="ss-romance-photo-shade" />

        <div className="ss-romance-photo-top">
          {typeof profile.matchScore === 'number' && (
            <span>{profile.matchScore}% match</span>
          )}

          <button
            type="button"
            className={saved ? 'ss-romance-save saved' : 'ss-romance-save'}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              void shortlist();
            }}
            aria-label="Save to shortlist"
          >
            {saved ? '★' : '☆'}
          </button>
        </div>

        <div className="ss-romance-photo-bottom">
          {isRecent(profile.lastActiveAt) && (
            <span className="ss-romance-active"><i /> Recently active</span>
          )}
          <h3>
            {profile.displayName}
            {profile.age ? `, ${profile.age}` : ''}
            {profile.emailVerified && (
              <b title="Email verified">✓</b>
            )}
          </h3>
          <p>
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </p>
        </div>
      </Link>

      <div className="profile-body ss-romance-body">
        <div className="ss-romance-details">
          {[profile.occupation, profile.motherTongue]
            .filter(Boolean)
            .slice(0, 2)
            .map(value => (
              <span key={String(value)}>{value}</span>
            ))}
        </div>

        <div className="ss-romance-actions">
          <Link
            className="secondary-btn"
            href={`/profile/${profile.userId}`}
          >
            View profile
          </Link>

          <button
            type="button"
            className="primary-btn"
            onClick={() => void interest()}
            disabled={busy || sent}
          >
            {busy ? 'Sending…' : sent ? 'Interest sent ✓' : 'Send interest'}
          </button>
        </div>
      </div>
    </article>
  );
}
