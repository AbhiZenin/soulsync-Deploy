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

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(name?: string) {
  if (!name) return 'there';
  return name.trim().split(/\s+/)[0] || 'there';
}

function recent(lastActiveAt?: string) {
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

  const pendingReceived = received.filter(x => x.status === 'PENDING').length;
  const pendingSent = sent.filter(x => x.status === 'PENDING').length;
  const accepted = [...received, ...sent].filter(
    x => x.status === 'ACCEPTED'
  ).length;

  const recommendations = useMemo(() => {
    const seen = new Set<string>();
    return [...matches, ...community]
      .filter(card => {
        if (!card?.userId || seen.has(card.userId)) return false;
        seen.add(card.userId);
        return true;
      })
      .slice(0, 4);
  }, [matches, community]);

  const activePeople = useMemo(
    () => community.filter(card => recent(card.lastActiveAt)).slice(0, 6),
    [community]
  );

  const completion = Math.max(
    0,
    Math.min(100, Number(profile?.completionPercent ?? 0))
  );

  const nextMove =
    pendingReceived > 0
      ? {
          title: `${pendingReceived} interest${pendingReceived === 1 ? '' : 's'} waiting`,
          text: 'Take a look while the conversation is still fresh.',
          href: '/interests',
          action: 'Review interests',
          icon: '♡',
        }
      : completion < 80
        ? {
            title: 'Make your profile easier to connect with',
            text: 'A complete profile gives people more reasons to start a conversation.',
            href: '/profile',
            action: 'Complete profile',
            icon: '◉',
          }
        : {
            title: 'Discover someone new today',
            text: 'Your profile is ready. Explore a few compatible members.',
            href: '/matches',
            action: 'See matches',
            icon: '✦',
          };

  return (
    <AppShell
      title={`${greeting()}, ${firstName(profile?.displayName)}`}
      subtitle="A quick look at what matters today."
    >
      <div className="ss-dash">
        <section className="ss-dash-hero">
          <div className="ss-dash-hero-copy">
            <span className="ss-dash-kicker">YOUR SOULSYNC</span>
            <h2>Small steps. Better connections.</h2>
            <p>
              Keep your profile fresh, explore a few people, and respond when
              someone feels worth knowing.
            </p>

            <div className="ss-dash-hero-actions">
              <Link href="/matches" className="primary-btn">
                Discover matches
              </Link>
              <Link href="/search" className="secondary-btn">
                Search profiles
              </Link>
            </div>
          </div>

          <div className="ss-dash-completion">
            <div className="ss-dash-completion-top">
              <span>Profile strength</span>
              <strong>{completion}%</strong>
            </div>
            <div className="ss-dash-progress">
              <span style={{width: `${completion}%`}} />
            </div>
            <p>
              {completion >= 90
                ? 'Looking great — your profile is ready to be discovered.'
                : completion >= 70
                  ? 'Almost there. A few details can make your profile feel more complete.'
                  : 'Add more about yourself to help compatible members understand you.'}
            </p>
            <Link href="/profile">
              {completion >= 90 ? 'Review profile →' : 'Complete profile →'}
            </Link>
          </div>
        </section>

        <section className="ss-dash-stats">
          <Link href="/interests" className="ss-dash-stat">
            <span className="ss-dash-stat-icon rose">♡</span>
            <div>
              <strong>{pendingReceived}</strong>
              <span>Waiting for you</span>
            </div>
            <small>Received interests</small>
          </Link>

          <Link href="/interests" className="ss-dash-stat">
            <span className="ss-dash-stat-icon gold">✦</span>
            <div>
              <strong>{pendingSent}</strong>
              <span>In progress</span>
            </div>
            <small>Sent interests</small>
          </Link>

          <Link href="/messages" className="ss-dash-stat">
            <span className="ss-dash-stat-icon green">✉</span>
            <div>
              <strong>{accepted}</strong>
              <span>Ready to talk</span>
            </div>
            <small>Accepted connections</small>
          </Link>
        </section>

        <section className="ss-dash-next">
          <div className="ss-dash-next-icon">{nextMove.icon}</div>
          <div>
            <span className="ss-dash-kicker">YOUR NEXT MOVE</span>
            <h3>{nextMove.title}</h3>
            <p>{nextMove.text}</p>
          </div>
          <Link href={nextMove.href} className="primary-btn">
            {nextMove.action}
          </Link>
        </section>

        <section className="ss-dash-section">
          <div className="ss-dash-section-head">
            <div>
              <span className="ss-dash-kicker">FOR YOU</span>
              <h2>People worth a closer look</h2>
              <p>Based on your profile and current discovery preferences.</p>
            </div>
            <Link href="/matches">View all matches →</Link>
          </div>

          {loading ? (
            <div className="ss-dash-card-grid">
              {[0, 1, 2, 3].map(i => (
                <div className="ss-dash-skeleton" key={i}>
                  <div />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : recommendations.length ? (
            <div className="profile-grid ss-dash-card-grid">
              {recommendations.map(card => (
                <ProfileCard key={card.userId} profile={card} />
              ))}
            </div>
          ) : (
            <div className="ss-dash-empty">
              <span>♡</span>
              <h3>Your recommendations will appear here</h3>
              <p>
                Update your preferences or search the community to start
                discovering profiles.
              </p>
              <div>
                <Link href="/preferences" className="secondary-btn">
                  Update preferences
                </Link>
                <Link href="/search" className="primary-btn">
                  Search profiles
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="ss-dash-two-col">
          <div className="ss-dash-section ss-dash-active-section">
            <div className="ss-dash-section-head compact">
              <div>
                <span className="ss-dash-kicker">RECENTLY ACTIVE</span>
                <h2>Members around the community</h2>
              </div>
              <Link href="/search">Explore →</Link>
            </div>

            <div className="ss-dash-active-list">
              {(activePeople.length ? activePeople : community.slice(0, 6)).map(
                person => (
                  <Link
                    href={`/profile/${person.userId}`}
                    className="ss-dash-person"
                    key={person.userId}
                  >
                    <span className="ss-dash-person-photo">
                      {person.primaryPhoto ? (
                        <SecureImage
                          path={person.primaryPhoto}
                          alt={person.displayName}
                        />
                      ) : (
                        <b>{person.displayName?.[0] ?? 'S'}</b>
                      )}
                      {recent(person.lastActiveAt) && <i />}
                    </span>

                    <span className="ss-dash-person-copy">
                      <strong>
                        {person.displayName}
                        {person.age ? `, ${person.age}` : ''}
                      </strong>
                      <small>
                        {[person.city, person.occupation]
                          .filter(Boolean)
                          .join(' · ') || 'SoulSync member'}
                      </small>
                    </span>

                    <span className="ss-dash-person-arrow">›</span>
                  </Link>
                )
              )}

              {!loading && !community.length && (
                <div className="ss-dash-mini-empty">
                  More members will appear here as the community grows.
                </div>
              )}
            </div>
          </div>

          <aside className="ss-dash-side">
            <Link href="/search" className="ss-dash-action-card">
              <span>⌕</span>
              <div>
                <strong>Search your way</strong>
                <small>Location, education, profession and more.</small>
              </div>
              <b>→</b>
            </Link>

            <Link href="/shortlist" className="ss-dash-action-card">
              <span>☆</span>
              <div>
                <strong>Revisit your shortlist</strong>
                <small>Keep promising profiles easy to find.</small>
              </div>
              <b>→</b>
            </Link>

            <Link href="/premium" className="ss-dash-membership">
              <span className="ss-dash-kicker">SOULSYNC PREMIUM</span>
              <h3>More discovery, fewer limits.</h3>
              <p>
                Advanced search, profile visitors, enhanced discovery and more.
              </p>
              <b>Explore Premium →</b>
            </Link>
          </aside>
        </section>

        <section className="ss-dash-journey">
          <span className="ss-dash-kicker">YOUR JOURNEY</span>
          <div>
            <Link href="/profile">
              <b>1</b>
              <span><strong>Be yourself</strong><small>Keep your profile genuine.</small></span>
            </Link>
            <Link href="/matches">
              <b>2</b>
              <span><strong>Explore</strong><small>Look beyond the first card.</small></span>
            </Link>
            <Link href="/interests">
              <b>3</b>
              <span><strong>Show interest</strong><small>Connect intentionally.</small></span>
            </Link>
            <Link href="/messages">
              <b>4</b>
              <span><strong>Start talking</strong><small>Conversation begins when it is mutual.</small></span>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
