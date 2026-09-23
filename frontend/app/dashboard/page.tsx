'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import AppShell from '@/components/AppShell';
import ProfileCard from '@/components/ProfileCard';
import SecureImage from '@/components/SecureImage';
import {api} from '@/lib/api';
import type {Interest, ProfileCard as Card} from '@/lib/types';

type Profile = {
  displayName?: string;
  completionPercent?: number;
};

function normalizeCards(value: unknown): Card[] {
  if (Array.isArray(value)) return value as Card[];

  if (
    value &&
    typeof value === 'object' &&
    'content' in value &&
    Array.isArray((value as {content?: unknown[]}).content)
  ) {
    return (value as {content: Card[]}).content;
  }

  return [];
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(value?: string) {
  if (!value) return 'there';
  return value.trim().split(/\s+/)[0] || 'there';
}

function recentlyActive(value?: string) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && Date.now() - time < 7 * 24 * 60 * 60 * 1000;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Card[]>([]);
  const [community, setCommunity] = useState<Card[]>([]);
  const [received, setReceived] = useState<Interest[]>([]);
  const [sent, setSent] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [p, m, c, r, s] = await Promise.allSettled([
        api<Profile>('/profile/me'),
        api<unknown>('/matches'),
        api<unknown>('/profiles?country=USA&size=12'),
        api<Interest[]>('/interests/received'),
        api<Interest[]>('/interests/sent'),
      ]);

      if (!mounted) return;

      if (p.status === 'fulfilled') setProfile(p.value);
      if (m.status === 'fulfilled') setMatches(normalizeCards(m.value));
      if (c.status === 'fulfilled') setCommunity(normalizeCards(c.value));
      if (r.status === 'fulfilled') setReceived(r.value);
      if (s.status === 'fulfilled') setSent(s.value);

      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const recommended = useMemo(() => {
    const seen = new Set<string>();
    return [...matches, ...community]
      .filter(card => {
        if (!card?.userId || seen.has(card.userId)) return false;
        seen.add(card.userId);
        return true;
      })
      .slice(0, 4);
  }, [matches, community]);

  const activeMembers = community.filter(x => recentlyActive(x.lastActiveAt)).slice(0, 7);

  const pendingReceived = received.filter(x => x.status === 'PENDING').length;
  const connections = [...received, ...sent].filter(x => x.status === 'ACCEPTED').length;
  const completion = Math.max(0, Math.min(100, Number(profile?.completionPercent ?? 0)));

  return (
    <AppShell
      title={`${greeting()}, ${firstName(profile?.displayName)}`}
      subtitle="Here are the people and conversations worth your attention."
    >
      <div className="ss-simple-dash">
        <section className="ss-simple-intro">
          <div>
            <span className="ss-simple-kicker">YOUR SOULSYNC</span>
            <h2>Meet people, not dashboards.</h2>
            <p>
              Start with a few compatible profiles and take your time getting
              to know the people who feel right.
            </p>
            <div className="ss-simple-intro-actions">
              <Link href="/matches" className="primary-btn">Discover matches</Link>
              <Link href="/search" className="secondary-btn">Search profiles</Link>
            </div>
          </div>

          <Link href="/profile" className="ss-simple-completion">
            <span>Profile</span>
            <strong>{completion}%</strong>
            <small>{completion >= 90 ? 'Ready to be discovered' : 'Complete your profile'}</small>
            <b>→</b>
          </Link>
        </section>

        <section className="ss-simple-recommendations">
          <div className="ss-simple-section-head">
            <div>
              <span className="ss-simple-kicker">RECOMMENDED FOR YOU</span>
              <h2>People you may want to know.</h2>
            </div>
            <Link href="/matches">View all →</Link>
          </div>

          {loading ? (
            <div className="ss-simple-profile-grid">
              {[0, 1, 2, 3].map(i => <div className="ss-simple-skeleton" key={i} />)}
            </div>
          ) : recommended.length ? (
            <div className="profile-grid ss-simple-profile-grid">
              {recommended.map(card => <ProfileCard key={card.userId} profile={card} />)}
            </div>
          ) : (
            <div className="ss-simple-empty">
              <span>♡</span>
              <h3>Your recommendations will appear here.</h3>
              <p>Update your preferences or search the community to get started.</p>
              <Link href="/preferences" className="primary-btn">Update preferences</Link>
            </div>
          )}
        </section>

        <section className="ss-simple-activity-line">
          <Link href="/interests">
            <strong>{pendingReceived}</strong>
            <span>interests waiting</span>
          </Link>
          <Link href="/messages">
            <strong>{connections}</strong>
            <span>connections ready to talk</span>
          </Link>
          <Link href="/shortlist">
            <strong>☆</strong>
            <span>your shortlist</span>
          </Link>
        </section>

        <section className="ss-simple-active">
          <div className="ss-simple-section-head">
            <div>
              <span className="ss-simple-kicker">RECENTLY ACTIVE</span>
              <h2>See who’s around.</h2>
            </div>
            <Link href="/search">Explore community →</Link>
          </div>

          <div className="ss-simple-active-row">
            {(activeMembers.length ? activeMembers : community.slice(0, 7)).map(member => (
              <Link key={member.userId} href={`/profile/${member.userId}`} className="ss-simple-person">
                <span>
                  {member.primaryPhoto ? (
                    <SecureImage path={member.primaryPhoto} alt={member.displayName} />
                  ) : (
                    <b>{member.displayName?.[0] ?? 'S'}</b>
                  )}
                  {recentlyActive(member.lastActiveAt) && <i />}
                </span>
                <strong>{member.displayName}</strong>
                <small>{member.city || 'SoulSync member'}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="ss-simple-story">
          <div className="ss-simple-story-photos">
            <img src="/demo-profiles/demo-009.jpg" alt="Fictional SoulSync sample member" />
            <img src="/demo-profiles/demo-010.jpg" alt="Fictional SoulSync sample member" />
          </div>
          <div>
            <span className="ss-simple-kicker">SAMPLE MEMBER STORY</span>
            <h2>Good connections don’t need to feel rushed.</h2>
            <p>
              A fictional SoulSync couple started with mutual interest, talked
              at their own pace, and discovered how naturally their values aligned.
            </p>
            <small>Illustrative product story — not a real endorsement.</small>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
