'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import ProfileCard from '@/components/ProfileCard';
import { api } from '@/lib/api';
import type {
  ProfileCard as Card,
  ProfileDetail,
  Interest,
} from '@/lib/types';

export default function Dashboard() {
  const [profile, setProfile] =
    useState<ProfileDetail | null>(null);

  const [matches, setMatches] =
    useState<Card[]>([]);

  const [received, setReceived] =
    useState<Interest[]>([]);

  useEffect(() => {
    Promise.all([
      api<ProfileDetail>('/profile/me'),
      api<Card[]>('/matches'),
      api<Interest[]>('/interests/received'),
    ])
      .then(([p, m, i]) => {
        setProfile(p);
        setMatches(m);
        setReceived(i);
      })
      .catch(console.error);
  }, []);

  const pending =
    received.filter((i) => i.status === 'PENDING').length;

  const firstName =
    profile?.displayName?.split(' ')[0] || 'there';

  return (
    <AppShell
      title={`Find your person, ${firstName}`}
      subtitle="Discover people who match your preferences, values and future."
    >
      <section className="discovery-toolbar">
        <Link href="/search" className="discovery-search">
          <span>⌕</span>

          <span>
            Search by location, education, profession…
          </span>
        </Link>

        <Link href="/preferences" className="filter-pill">
          Age
          <span>⌄</span>
        </Link>

        <Link href="/preferences" className="filter-pill">
          Location
          <span>⌄</span>
        </Link>

        <Link href="/preferences" className="filter-pill">
          More filters
          <span>＋</span>
        </Link>
      </section>

      {pending > 0 && (
        <Link href="/interests" className="interest-banner">
          <div className="interest-banner-icon">♡</div>

          <div>
            <strong>
              {pending} new {pending === 1 ? 'person is' : 'people are'}
              {' '}interested in you
            </strong>

            <p>
              Review your received interests and decide
              whether you would like to connect.
            </p>
          </div>

          <span className="interest-banner-action">
            View interests →
          </span>
        </Link>
      )}

      {profile && profile.completionPercent < 70 && (
        <section className="profile-progress-card">
          <div>
            <p>COMPLETE YOUR PROFILE</p>

            <h3>
              Help the right people discover you.
            </h3>

            <span>
              Your profile is {profile.completionPercent}% complete.
            </span>
          </div>

          <div className="profile-progress-actions">
            <div className="profile-progress-track">
              <span
                style={{
                  width: `${profile.completionPercent}%`,
                }}
              />
            </div>

            <Link href="/profile">
              Complete profile →
            </Link>
          </div>
        </section>
      )}

      <section className="discovery-section">
        <div className="discovery-section-head">
          <div>
            <p className="section-kicker">
              CURATED FOR YOU
            </p>

            <h2>Recommended matches</h2>

            <p>
              Profiles selected using your current partner
              preferences.
            </p>
          </div>

          <Link href="/matches">
            View all matches →
          </Link>
        </div>

        {matches.length ? (
          <div className="matrimony-profile-grid">
            {matches.slice(0, 8).map((p) => (
              <ProfileCard
                key={p.userId}
                profile={p}
              />
            ))}
          </div>
        ) : (
          <div className="matrimony-empty">
            <div>♡</div>

            <h3>Your recommendations are being prepared.</h3>

            <p>
              Complete your profile and partner preferences
              to receive better matches.
            </p>

            <Link href="/preferences">
              Update preferences
            </Link>
          </div>
        )}
      </section>

      <section className="matrimony-values">
        <div>
          <span>✓</span>
          <strong>Verified profiles</strong>
          <p>Connect with greater confidence.</p>
        </div>

        <div>
          <span>♡</span>
          <strong>Compatibility focused</strong>
          <p>Look beyond just photographs.</p>
        </div>

        <div>
          <span>⌾</span>
          <strong>Your privacy matters</strong>
          <p>You control your profile and photos.</p>
        </div>
      </section>
    </AppShell>
  );
}
