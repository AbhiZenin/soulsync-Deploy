'use client';

import Link from 'next/link';
import {useState} from 'react';
import SecureImage from '@/components/SecureImage';
import {api} from '@/lib/api';
import type {ProfileCard as Card} from '@/lib/types';

function recentlyActive(value?: string) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && Date.now() - time < 7 * 24 * 60 * 60 * 1000;
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

  const location = [profile.city, profile.state].filter(Boolean).join(', ');

  return (
    <article className="profile-card ss-m51-card">
      <Link
        href={`/profile/${profile.userId}`}
        className="profile-photo ss-m51-photo"
      >
        {profile.primaryPhoto ? (
          <SecureImage
            path={profile.primaryPhoto}
            alt={profile.displayName}
          />
        ) : (
          <div className="photo-placeholder ss-m51-placeholder">
            {profile.displayName?.[0] ?? 'S'}
          </div>
        )}

        <div className="ss-m51-photo-top">
          {typeof profile.matchScore === 'number' && (
            <span className="ss-m51-match">
              {profile.matchScore}% match
            </span>
          )}

          <button
            type="button"
            className={saved ? 'ss-m51-save saved' : 'ss-m51-save'}
            aria-label="Save to shortlist"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              void shortlist();
            }}
          >
            {saved ? '★' : '☆'}
          </button>
        </div>

        {recentlyActive(profile.lastActiveAt) && (
          <span className="ss-m51-active">
            <i /> Recently active
          </span>
        )}
      </Link>

      <div className="profile-body ss-m51-body">
        <div className="ss-m51-name-row">
          <h3>
            {profile.displayName}
            {profile.age ? `, ${profile.age}` : ''}
          </h3>

          {profile.emailVerified && (
            <span className="ss-m51-verified" title="Email verified">
              ✓
            </span>
          )}
        </div>

        <p className="ss-m51-location">
          {[
            profile.heightCm ? `${profile.heightCm} cm` : null,
            location || null,
          ]
            .filter(Boolean)
            .join(' · ') || 'SoulSync member'}
        </p>

        <div className="ss-m51-facts">
          {profile.occupation && (
            <div>
              <span>Profession</span>
              <strong>{profile.occupation}</strong>
            </div>
          )}

          {profile.education && (
            <div>
              <span>Education</span>
              <strong>{profile.education}</strong>
            </div>
          )}
        </div>

        <div className="ss-m51-tags">
          {[profile.motherTongue, profile.religion]
            .filter(Boolean)
            .map(value => (
              <span key={String(value)}>{value}</span>
            ))}
        </div>

        <div className="ss-m51-actions">
          <Link
            href={`/profile/${profile.userId}`}
            className="secondary-btn"
          >
            View profile
          </Link>

          <button
            type="button"
            className="primary-btn"
            disabled={busy || sent}
            onClick={() => void interest()}
          >
            {busy ? 'Sending…' : sent ? 'Interest sent ✓' : 'Send interest'}
          </button>
        </div>
      </div>
    </article>
  );
}
