'use client';

import Link from 'next/link';
import {useState} from 'react';
import SecureImage from '@/components/SecureImage';
import {api} from '@/lib/api';
import type {ProfileCard as Card} from '@/lib/types';

function activeRecently(value?: string) {
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
  const [note, setNote] = useState('');

  async function interest() {
    if (sent || busy) return;

    setBusy(true);
    setNote('');

    try {
      await api(`/interests/${profile.userId}`, {method: 'POST'});
      setSent(true);
      setNote('Interest sent');
      onChanged?.();
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Unable to send interest');
    } finally {
      setBusy(false);
    }
  }

  async function shortlist() {
    setNote('');

    try {
      await api(`/shortlist/${profile.userId}`, {method: 'POST'});
      setSaved(true);
      setNote('Saved to shortlist');
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Unable to save profile');
    }
  }

  return (
    <article className="profile-card ss-member-card">
      <Link
        href={`/profile/${profile.userId}`}
        className="profile-photo ss-member-photo"
      >
        {profile.primaryPhoto ? (
          <SecureImage
            path={profile.primaryPhoto}
            alt={profile.displayName}
          />
        ) : (
          <div className="photo-placeholder ss-member-placeholder">
            {profile.displayName?.[0] ?? 'S'}
          </div>
        )}

        <div className="ss-member-photo-top">
          {typeof profile.matchScore === 'number' && (
            <span className="match-pill ss-member-match">
              {profile.matchScore}% match
            </span>
          )}

          <button
            type="button"
            className={saved ? 'ss-member-save saved' : 'ss-member-save'}
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

        {activeRecently(profile.lastActiveAt) && (
          <span className="ss-member-active">
            <i /> Recently active
          </span>
        )}
      </Link>

      <div className="profile-body ss-member-body">
        <div className="ss-member-title-row">
          <div>
            <h3>
              {profile.displayName}
              {profile.emailVerified && (
                <span className="ss-member-verified" title="Email verified">
                  ✓
                </span>
              )}
            </h3>
            <p>
              {[
                profile.age && `${profile.age} yrs`,
                profile.city,
                profile.state,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="ss-member-tags">
          {[profile.occupation, profile.education, profile.motherTongue, profile.religion]
            .filter(Boolean)
            .slice(0, 3)
            .map(value => (
              <span key={String(value)}>{value}</span>
            ))}
        </div>

        {note && (
          <div className={sent || saved ? 'ss-member-note success' : 'ss-member-note'}>
            {note}
          </div>
        )}

        <div className="card-actions ss-member-actions">
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
