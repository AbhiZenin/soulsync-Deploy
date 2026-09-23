'use client';

import {useEffect, useMemo, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import AppShell from '@/components/AppShell';
import PremiumPlusVideoCall from '@/components/PremiumPlusVideoCall';
import PremiumContactCard from '@/components/PremiumContactCard';
import SecureImage from '@/components/SecureImage';
import {api} from '@/lib/api';
import type {ProfileDetail} from '@/lib/types';

function hobbyList(value?: string | null) {
  return (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export default function PublicProfile() {
  const {id} = useParams<{id: string}>();
  const router = useRouter();
  const [p, setP] = useState<ProfileDetail | null>(null);
  const [interestSent, setInterestSent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;

    api<ProfileDetail>(`/profiles/${id}`)
      .then(setP)
      .catch(error => alert(error.message));
  }, [id]);

  const hobbies = useMemo(() => hobbyList(p?.hobbies), [p?.hobbies]);

  async function interest() {
    await api(`/interests/${id}`, {method: 'POST'});
    setInterestSent(true);
  }

  async function shortlist() {
    await api(`/shortlist/${id}`, {method: 'POST'});
    setSaved(true);
  }

  async function chat() {
    try {
      const conversation = await api<{id: string}>(
        `/conversations/with/${id}`,
        {method: 'POST'}
      );
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Conversation unavailable');
    }
  }

  async function block() {
    if (!confirm('Block this member?')) return;
    await api(`/blocks/${id}`, {method: 'POST'});
    router.push('/matches');
  }

  async function report() {
    const reason = prompt('Reason for reporting this profile');
    if (!reason) return;

    await api(`/reports/${id}`, {
      method: 'POST',
      body: JSON.stringify({reason, details: ''}),
    });
  }

  if (!p) {
    return (
      <AppShell title="Profile">
        <div className="ss-m51-public-loading">
          <div className="spinner" />
          <span>Opening profile…</span>
        </div>
      </AppShell>
    );
  }

  const location = [p.city, p.state, p.country].filter(Boolean).join(', ');
  const mainPhoto = p.photos.find(photo => photo.primary) ?? p.photos[0];
  const details = [
    ['Age', p.age ? `${p.age} years` : null],
    ['Height', p.heightCm ? `${p.heightCm} cm` : null],
    ['Marital status', p.maritalStatus],
    ['Location', location],
    ['Education', p.education],
    ['Profession', p.occupation],
    ['Religion', p.religion],
    ['Community', p.community],
    ['Mother tongue', p.motherTongue],
    ['Diet', p.diet],
  ].filter(([, value]) => Boolean(value));

  return (
    <AppShell
      title={p.displayName}
      subtitle={[
        p.age ? `${p.age} years` : null,
        p.occupation,
        p.city,
      ]
        .filter(Boolean)
        .join(' · ')}
    >
      <div className="ss-m51-public">
        <section className="ss-m51-public-hero">
          <div className="ss-m51-public-main-photo">
            {mainPhoto ? (
              <SecureImage path={mainPhoto.url} alt={p.displayName} />
            ) : (
              <div className="ss-m51-public-placeholder">
                {p.displayName?.[0] ?? 'S'}
              </div>
            )}
          </div>

          <div className="ss-m51-public-intro">
            <span className="ss-profile-kicker">MATRIMONY PROFILE</span>

            <div className="ss-m51-public-name">
              <h2>
                {p.displayName}
                {p.age ? `, ${p.age}` : ''}
              </h2>

              {p.emailVerified && (
                <span title="Email verified">✓ Verified</span>
              )}
            </div>

            <p className="ss-m51-public-meta">
              {[
                p.heightCm ? `${p.heightCm} cm` : null,
                p.occupation,
                location,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>

            <p className="ss-m51-public-about">
              {p.about ||
                'This member has not added a personal introduction yet.'}
            </p>

            <div className="ss-m51-public-tags">
              {[p.motherTongue, p.religion, p.education, p.diet]
                .filter(Boolean)
                .map(value => (
                  <span key={String(value)}>{value}</span>
                ))}
            </div>

            <div className="ss-m51-public-actions">
              <button
                className="primary-btn"
                type="button"
                onClick={() => void interest()}
                disabled={interestSent}
              >
                {interestSent ? 'Interest sent ✓' : 'Send interest'}
              </button>

              <button
                className="secondary-btn"
                type="button"
                onClick={() => void chat()}
              >
                Message if connected
              </button>

              <button
                className="ghost-btn"
                type="button"
                onClick={() => void shortlist()}
                disabled={saved}
              >
                {saved ? 'Shortlisted ★' : 'Add to shortlist ☆'}
              </button>
            </div>
          </div>
        </section>

        {p.photos.length > 1 && (
          <section className="ss-m51-public-gallery">
            <div className="ss-m51-section-title">
              <span className="ss-profile-kicker">PHOTOS</span>
              <h3>More photos</h3>
            </div>

            <div>
              {p.photos.map(photo => (
                <div key={photo.id}>
                  <SecureImage path={photo.url} alt={p.displayName} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="ss-m51-public-columns">
          <section className="ss-m51-public-section">
            <div className="ss-m51-section-title">
              <span className="ss-profile-kicker">ABOUT THIS MEMBER</span>
              <h3>Profile details</h3>
            </div>

            <div className="ss-m51-detail-grid">
              {details.map(([label, value]) => (
                <div key={String(label)}>
                  <span>{label}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>
          </section>

          <aside className="ss-m51-public-side">
            <PremiumContactCard userId={id} />
            <PremiumPlusVideoCall userId={id} />
          </aside>
        </div>

        {hobbies.length > 0 && (
          <section className="ss-m51-public-hobbies">
            <div className="ss-m51-section-title">
              <span className="ss-profile-kicker">PERSONALITY</span>
              <h3>Hobbies & interests</h3>
              <p>
                A glimpse of what this member enjoys outside work and everyday
                responsibilities.
              </p>
            </div>

            <div className="ss-m51-public-hobby-list">
              {hobbies.map(hobby => (
                <span key={hobby}>♡ {hobby}</span>
              ))}
            </div>
          </section>
        )}

        <section className="ss-m51-safety">
          <div>
            <span className="ss-profile-kicker">SAFETY</span>
            <h3>Your comfort comes first.</h3>
            <p>
              You can block or report a profile whenever something does not
              feel right.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => void report()}
            >
              Report profile
            </button>

            <button
              type="button"
              className="danger-btn"
              onClick={() => void block()}
            >
              Block member
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
