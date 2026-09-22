'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import AppShell from '@/components/AppShell';
import ProfileCard from '@/components/ProfileCard';
import {api} from '@/lib/api';
import type {ProfileCard as Card} from '@/lib/types';

export default function Shortlist() {
  const [rows, setRows] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const saved = await api<{userId: string}[]>('/shortlist');

        const profiles = await Promise.all(
          saved.map(async item => {
            try {
              return await api<Card>(`/profiles/${item.userId}`);
            } catch {
              return null;
            }
          })
        );

        setRows(profiles.filter(Boolean) as Card[]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <AppShell
      title="Shortlist"
      subtitle="A quiet place for profiles you want to revisit."
    >
      {loading ? (
        <div className="ss-saved-loading">
          <div className="spinner" />
          <span>Opening your shortlist…</span>
        </div>
      ) : rows.length ? (
        <>
          <div className="ss-saved-head">
            <div>
              <span className="eyebrow">SAVED PROFILES</span>
              <h2>{rows.length} worth another look</h2>
            </div>
            <Link href="/matches">Discover more →</Link>
          </div>

          <div className="profile-grid">
            {rows.map(profile => (
              <ProfileCard key={profile.userId} profile={profile} />
            ))}
          </div>
        </>
      ) : (
        <section className="ss-saved-empty">
          <div className="ss-saved-empty-icon">☆</div>
          <span className="eyebrow">YOUR SHORTLIST</span>
          <h2>Save the profiles that stay on your mind.</h2>
          <p>
            When someone catches your attention, tap the star on their profile.
            They will appear here so you can come back without searching again.
          </p>
          <div>
            <Link href="/matches" className="primary-btn">
              Discover matches
            </Link>
            <Link href="/search" className="secondary-btn">
              Search profiles
            </Link>
          </div>
        </section>
      )}
    </AppShell>
  );
}
