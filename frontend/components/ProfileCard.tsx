'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProfileCard as Card } from '@/lib/types';
import { api } from '@/lib/api';
import SecureImage from '@/components/SecureImage';

export default function ProfileCard({
  profile,
  onChanged,
}: {
  profile: Card;
  onChanged?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [sent, setSent] = useState(false);

  const image = profile.primaryPhoto;

  async function interest() {
    setBusy(true);

    try {
      await api(`/interests/${profile.userId}`, {
        method: 'POST',
      });

      setSent(true);
      onChanged?.();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function shortlist() {
    try {
      await api(`/shortlist/${profile.userId}`, {
        method: 'POST',
      });

      setShortlisted(true);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  const meta = [
    profile.age && `${profile.age} yrs`,
    profile.heightCm && `${profile.heightCm} cm`,
  ].filter(Boolean);

  const location = [
    profile.city,
    profile.state,
  ].filter(Boolean).join(', ');

  return (
    <article className="match-card">
      <Link
        href={`/profile/${profile.userId}`}
        className="match-card-photo"
      >
        {image ? (
          <SecureImage
            path={image}
            alt={profile.displayName}
          />
        ) : (
          <div className="match-photo-placeholder">
            {profile.displayName?.[0]}
          </div>
        )}

        <div className="match-photo-shade" />

        {typeof profile.matchScore === 'number' && (
          <span className="compatibility-badge">
            <strong>{profile.matchScore}%</strong>
            <span>Match</span>
          </span>
        )}

        <button
          type="button"
          className={
            shortlisted
              ? 'photo-shortlist active'
              : 'photo-shortlist'
          }
          aria-label="Add to shortlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            shortlist();
          }}
        >
          {shortlisted ? '♥' : '♡'}
        </button>
      </Link>

      <div className="match-card-content">
        <div className="match-name-row">
          <Link href={`/profile/${profile.userId}`}>
            <h3>
              {profile.displayName}
              {profile.age ? `, ${profile.age}` : ''}
            </h3>
          </Link>

          {profile.emailVerified && (
            <span
              className="verified-mark"
              title="Email verified"
            >
              ✓
            </span>
          )}
        </div>

        {location && (
          <p className="match-location">
            <span>⌖</span>
            {location}
          </p>
        )}

        <div className="match-details">
          {meta.length > 1 && (
            <div>
              <span className="detail-icon">↕</span>
              <span>{meta[1]}</span>
            </div>
          )}

          {profile.occupation && (
            <div>
              <span className="detail-icon">◫</span>
              <span>{profile.occupation}</span>
            </div>
          )}

          {profile.education && (
            <div>
              <span className="detail-icon">◇</span>
              <span>{profile.education}</span>
            </div>
          )}
        </div>

        <div className="match-tags">
          {[
            profile.motherTongue,
            profile.religion,
          ]
            .filter(Boolean)
            .map((value) => (
              <span key={value}>{value}</span>
            ))}
        </div>

        <div className="match-card-actions">
          <Link
            href={`/profile/${profile.userId}`}
            className="view-profile-action"
          >
            View profile
          </Link>

          <button
            type="button"
            className={
              sent
                ? 'interest-action sent'
                : 'interest-action'
            }
            onClick={interest}
            disabled={busy || sent}
          >
            {busy
              ? 'Sending…'
              : sent
                ? 'Interest sent ✓'
                : 'Send interest →'}
          </button>
        </div>
      </div>
    </article>
  );
}
