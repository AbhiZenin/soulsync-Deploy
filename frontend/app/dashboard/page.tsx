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
  city?: string;
  state?: string;
  occupation?: string;
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

function firstName(value?: string) {
  if (!value) return 'there';
  return value.trim().split(/\s+/)[0] || 'there';
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function isRecent(lastActiveAt?: string) {
  if (!lastActiveAt) return false;
  const value = new Date(lastActiveAt).getTime();
  return Number.isFinite(value) && Date.now() - value < 7 * 24 * 60 * 60 * 1000;
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

  const recommendations = useMemo(() => {
    const seen = new Set<string>();

    return [...matches, ...community].filter(card => {
      if (!card?.userId || seen.has(card.userId)) return false;
      seen.add(card.userId);
      return true;
    });
  }, [matches, community]);

  const featured = recommendations[0];
  const moreMatches = recommendations.slice(1, 5);
  const activeMembers = community
    .filter(member => isRecent(member.lastActiveAt))
    .slice(0, 7);

  const pendingReceived = received.filter(x => x.status === 'PENDING').length;
  const pendingSent = sent.filter(x => x.status === 'PENDING').length;
  const accepted = [...received, ...sent].filter(x => x.status === 'ACCEPTED').length;
  const completion = Math.max(
    0,
    Math.min(100, Number(profile?.completionPercent ?? 0))
  );

  return (
    <AppShell
      title={`${greeting()}, ${firstName(profile?.displayName)}`}
      subtitle="A calmer way to discover meaningful connections."
    >
      <div className="ss-premium-dash">
        <section className="ss-premium-welcome">
          <div className="ss-premium-welcome-copy">
            <span className="ss-premium-kicker">YOUR SOULSYNC JOURNEY</span>
            <h2>Make room for someone meaningful.</h2>
            <p>
              Explore a few thoughtful matches, respond when someone feels
              interesting, and let good conversations begin naturally.
            </p>

            <div className="ss-premium-welcome-actions">
              <Link href="/matches" className="primary-btn">
                Discover matches
              </Link>
              <Link href="/search" className="secondary-btn">
                Search your way
              </Link>
            </div>
          </div>

          <div className="ss-premium-profile-strength">
            <div className="ss-premium-strength-ring">
              <strong>{completion}%</strong>
              <span>profile</span>
            </div>
            <div>
              <span className="ss-premium-kicker">PROFILE STRENGTH</span>
              <h3>
                {completion >= 90
                  ? 'You are ready to be discovered.'
                  : completion >= 70
                    ? 'A few details can make you stand out.'
                    : 'Help people understand who you are.'}
              </h3>
              <Link href="/profile">Review my profile →</Link>
            </div>
          </div>
        </section>

        <section className="ss-premium-activity">
          <Link href="/interests">
            <strong>{pendingReceived}</strong>
            <span>received interests</span>
          </Link>
          <i />
          <Link href="/interests">
            <strong>{pendingSent}</strong>
            <span>sent interests</span>
          </Link>
          <i />
          <Link href="/messages">
            <strong>{accepted}</strong>
            <span>connections ready to talk</span>
          </Link>
        </section>

        <section className="ss-premium-featured">
          <div className="ss-premium-section-head">
            <div>
              <span className="ss-premium-kicker">FOR YOU TODAY</span>
              <h2>One profile worth slowing down for.</h2>
            </div>
            <Link href="/matches">See all matches →</Link>
          </div>

          {loading ? (
            <div className="ss-premium-feature-skeleton" />
          ) : featured ? (
            <div className="ss-premium-feature-grid">
              <Link
                href={`/profile/${featured.userId}`}
                className="ss-premium-feature-photo"
              >
                {featured.primaryPhoto ? (
                  <SecureImage
                    path={featured.primaryPhoto}
                    alt={featured.displayName}
                  />
                ) : (
                  <div className="ss-premium-feature-placeholder">
                    {featured.displayName?.[0] ?? 'S'}
                  </div>
                )}

                {typeof featured.matchScore === 'number' && (
                  <span>{featured.matchScore}% compatible</span>
                )}
              </Link>

              <div className="ss-premium-feature-copy">
                <span className="ss-premium-kicker">COMPATIBLE MATCH</span>
                <h3>
                  {featured.displayName}
                  {featured.age ? `, ${featured.age}` : ''}
                </h3>
                <p className="ss-premium-feature-meta">
                  {[
                    featured.city,
                    featured.state,
                    featured.occupation,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <div className="ss-premium-feature-tags">
                  {[featured.motherTongue, featured.education, featured.religion]
                    .filter(Boolean)
                    .slice(0, 3)
                    .map(value => (
                      <span key={String(value)}>{value}</span>
                    ))}
                </div>

                <p className="ss-premium-feature-note">
                  Take a closer look at the profile before deciding whether you
                  would like to connect.
                </p>

                <div className="ss-premium-feature-actions">
                  <Link
                    href={`/profile/${featured.userId}`}
                    className="primary-btn"
                  >
                    View profile
                  </Link>
                  <Link href="/matches" className="secondary-btn">
                    Keep exploring
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="ss-premium-empty">
              <span>♡</span>
              <h3>Your matches will appear here.</h3>
              <p>
                Complete your preferences or search the community to start
                discovering people.
              </p>
              <Link href="/preferences" className="primary-btn">
                Update preferences
              </Link>
            </div>
          )}
        </section>

        <section className="ss-premium-more">
          <div className="ss-premium-section-head">
            <div>
              <span className="ss-premium-kicker">MORE TO EXPLORE</span>
              <h2>A few more people you may want to meet.</h2>
            </div>
            <Link href="/search">Search profiles →</Link>
          </div>

          {loading ? (
            <div className="ss-premium-card-row">
              {[0, 1, 2, 3].map(i => (
                <div className="ss-premium-mini-skeleton" key={i} />
              ))}
            </div>
          ) : moreMatches.length ? (
            <div className="profile-grid ss-premium-card-row">
              {moreMatches.map(card => (
                <ProfileCard key={card.userId} profile={card} />
              ))}
            </div>
          ) : (
            <div className="ss-premium-inline-empty">
              More recommendations will appear as your community grows.
            </div>
          )}
        </section>

        <section className="ss-premium-active">
          <div className="ss-premium-section-head">
            <div>
              <span className="ss-premium-kicker">RECENTLY ACTIVE</span>
              <h2>People showing up right now.</h2>
            </div>
            <Link href="/search">Explore community →</Link>
          </div>

          <div className="ss-premium-active-row">
            {(activeMembers.length ? activeMembers : community.slice(0, 7)).map(
              member => (
                <Link
                  href={`/profile/${member.userId}`}
                  className="ss-premium-active-person"
                  key={member.userId}
                >
                  <span className="ss-premium-active-photo">
                    {member.primaryPhoto ? (
                      <SecureImage
                        path={member.primaryPhoto}
                        alt={member.displayName}
                      />
                    ) : (
                      <b>{member.displayName?.[0] ?? 'S'}</b>
                    )}
                    {isRecent(member.lastActiveAt) && <i />}
                  </span>
                  <strong>{member.displayName}</strong>
                  <small>{member.city || 'SoulSync member'}</small>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="ss-premium-story">
          <div className="ss-premium-story-visual">
            <div className="ss-premium-story-portrait first">
              <img
                src="/demo-profiles/demo-009.jpg"
                alt="Fictional SoulSync story portrait"
              />
            </div>
            <div className="ss-premium-story-portrait second">
              <img
                src="/demo-profiles/demo-010.jpg"
                alt="Fictional SoulSync story portrait"
              />
            </div>
            <span>♡</span>
          </div>

          <div className="ss-premium-story-copy">
            <span className="ss-premium-kicker">SAMPLE MEMBER STORY</span>
            <h2>“The best part was that it never felt rushed.”</h2>
            <p>
              Two fictional SoulSync members started with a mutual interest,
              took time to talk, and discovered that their values and everyday
              lives fit naturally.
            </p>
            <small>
              Illustrative demo story for the SoulSync product experience.
            </small>
          </div>
        </section>

        <section className="ss-premium-paths">
          <Link href="/search">
            <span>⌕</span>
            <div>
              <strong>Search with intention</strong>
              <small>Location, profession, education and more.</small>
            </div>
            <b>→</b>
          </Link>

          <Link href="/shortlist">
            <span>☆</span>
            <div>
              <strong>Return to your shortlist</strong>
              <small>Revisit profiles that stayed on your mind.</small>
            </div>
            <b>→</b>
          </Link>

          <Link href="/premium">
            <span>✦</span>
            <div>
              <strong>Explore Premium</strong>
              <small>More discovery tools with fewer limits.</small>
            </div>
            <b>→</b>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
