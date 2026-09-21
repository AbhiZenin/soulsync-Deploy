'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import ProfileCard from '@/components/ProfileCard';
import { api } from '@/lib/api';
import type { ProfileCard as Card } from '@/lib/types';

type Subscription = {
  plan: string;
  entitlements: string[];
};

type EnhancedDiscovery = {
  topCompatibility: Card[];
  recentlyActive: Card[];
};

export default function Discover() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [data, setData] =
    useState<EnhancedDiscovery | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const sub = await api<Subscription>(
          '/subscriptions/me'
        );

        if (!active) return;

        setSubscription(sub);

        if (
          !sub.entitlements.includes('ENHANCED_DISCOVERY')
        ) {
          return;
        }

        const discovery =
          await api<EnhancedDiscovery>(
            '/discovery/enhanced'
          );

        if (active) {
          setData(discovery);
        }
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : 'Unable to load enhanced discovery.'
          );
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const canUse =
    subscription?.entitlements.includes(
      'ENHANCED_DISCOVERY'
    ) ?? false;

  return (
    <AppShell
      title="Discover+"
      subtitle="Premium discovery views built around compatibility and recent activity."
    >
      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      {subscription && !canUse ? (
        <section className="panel ss-discover-lock">
          <span className="ss-premium-lock-badge">
            PREMIUM
          </span>
          <h2>Unlock enhanced discovery</h2>
          <p className="muted">
            Explore curated high-compatibility profiles and
            recently active recommendations with Premium.
          </p>
          <Link
            href="/premium"
            className="primary-btn"
          >
            View Premium plans
          </Link>
        </section>
      ) : !subscription || !data ? (
        <section className="panel">
          Loading enhanced discovery...
        </section>
      ) : (
        <div className="ss-discover-page">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="ss-premium-lock-badge">
                  PREMIUM
                </span>
                <h2>Top compatibility</h2>
                <p className="muted">
                  Strong recommendations based on your current
                  partner preferences.
                </p>
              </div>
            </div>

            {data.topCompatibility.length ? (
              <div className="profile-grid">
                {data.topCompatibility.map(profile => (
                  <ProfileCard
                    key={profile.userId}
                    profile={profile}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                Complete your profile and partner preferences
                to improve your recommendations.
              </div>
            )}
          </section>

          <section className="panel section-gap">
            <div className="panel-head">
              <div>
                <span className="ss-premium-lock-badge">
                  PREMIUM
                </span>
                <h2>Recently active</h2>
                <p className="muted">
                  Compatible members who were active most
                  recently.
                </p>
              </div>
            </div>

            {data.recentlyActive.length ? (
              <div className="profile-grid">
                {data.recentlyActive.map(profile => (
                  <ProfileCard
                    key={profile.userId}
                    profile={profile}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                No recent recommendations are available yet.
              </div>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
