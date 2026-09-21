'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

type Subscription = {
  plan: string;
  entitlements: string[];
};

type Boost = {
  active: boolean;
  boostedUntil?: string | null;
};

type Ticket = {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function PremiumPlus() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [boost, setBoost] = useState<Boost | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busyBoost, setBusyBoost] = useState(false);
  const [busySupport, setBusySupport] = useState(false);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const isPlus =
    subscription?.entitlements.includes('PROFILE_BOOST') ??
    false;

  const openTickets = useMemo(
    () =>
      tickets.filter(
        ticket =>
          ticket.status === 'OPEN' ||
          ticket.status === 'IN_PROGRESS'
      ).length,
    [tickets]
  );

  useEffect(() => {
    let active = true;

    api<Subscription>('/subscriptions/me')
      .then(result => {
        if (active) {
          setSubscription(result);
        }
      })
      .catch(error => {
        if (active) {
          setNotice(
            error instanceof Error
              ? error.message
              : 'Unable to load subscription.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlus) {
      return;
    }

    let active = true;

    Promise.all([
      api<Boost>('/premium-plus/boost'),
      api<Ticket[]>('/premium-plus/support'),
    ])
      .then(([boostState, supportTickets]) => {
        if (!active) {
          return;
        }

        setBoost(boostState);
        setTickets(supportTickets);
      })
      .catch(error => {
        if (active) {
          setNotice(
            error instanceof Error
              ? error.message
              : 'Unable to load Premium Plus features.'
          );
        }
      });

    return () => {
      active = false;
    };
  }, [isPlus]);

  async function activateBoost() {
    setBusyBoost(true);
    setNotice('');

    try {
      const next = await api<Boost>(
        '/premium-plus/boost',
        {
          method: 'POST',
        }
      );

      setBoost(next);
      setNotice(
        'Your profile boost is active for the next 24 hours.'
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to activate boost.'
      );
    } finally {
      setBusyBoost(false);
    }
  }

  async function submitSupport(event: FormEvent) {
    event.preventDefault();
    setBusySupport(true);
    setNotice('');

    try {
      await api<Ticket>(
        '/premium-plus/support',
        {
          method: 'POST',
          body: JSON.stringify({
            subject,
            message,
          }),
        }
      );

      setSubject('');
      setMessage('');
      setNotice(
        'Priority support ticket submitted successfully.'
      );

      setTickets(
        await api<Ticket[]>(
          '/premium-plus/support'
        )
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to submit support ticket.'
      );
    } finally {
      setBusySupport(false);
    }
  }

  if (loading) {
    return (
      <AppShell
        title="Premium Plus"
        subtitle="Maximum visibility and premium communication features."
      >
        <div className="ss-plus-loading-shell">
          <span className="spinner" />
          <p>Loading your Premium Plus experience...</p>
        </div>
      </AppShell>
    );
  }

  if (!subscription) {
    return (
      <AppShell
        title="Premium Plus"
        subtitle="Maximum visibility and premium communication features."
      >
        <section className="ss-plus-error-card">
          <span className="ss-plus-eyebrow">
            PREMIUM PLUS
          </span>
          <h2>We could not load your plan</h2>
          <p>
            Refresh the page or try again in a moment.
          </p>
        </section>
      </AppShell>
    );
  }

  if (!isPlus) {
    return (
      <AppShell
        title="Premium Plus"
        subtitle="Maximum visibility and premium communication features."
      >
        <section className="ss-plus-hero ss-plus-upgrade-hero">
          <div className="ss-plus-hero-copy">
            <span className="ss-plus-eyebrow">
              PREMIUM PLUS
            </span>
            <h1>
              Be seen sooner.
              <br />
              Connect with more confidence.
            </h1>
            <p>
              Premium Plus adds profile boosting,
              connection-authorized video calls, and
              priority support on top of every Premium
              discovery feature.
            </p>

            <div className="ss-plus-hero-actions">
              <Link
                href="/premium"
                className="ss-plus-primary-action"
              >
                View Premium Plus plan
              </Link>

              <Link
                href="/discover"
                className="ss-plus-secondary-action"
              >
                Explore matches
              </Link>
            </div>
          </div>

          <div className="ss-plus-membership-card">
            <span className="ss-plus-membership-label">
              INCLUDED
            </span>

            <div className="ss-plus-membership-feature">
              <span>01</span>
              <div>
                <strong>24-hour profile boost</strong>
                <small>
                  Priority placement in eligible discovery.
                </small>
              </div>
            </div>

            <div className="ss-plus-membership-feature">
              <span>02</span>
              <div>
                <strong>Video calls</strong>
                <small>
                  Start a call after a mutual connection.
                </small>
              </div>
            </div>

            <div className="ss-plus-membership-feature">
              <span>03</span>
              <div>
                <strong>Priority support</strong>
                <small>
                  Direct ticket access to the support queue.
                </small>
              </div>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Premium Plus"
      subtitle="Maximum visibility and premium communication features."
    >
      <div className="ss-plus-page">
        <section className="ss-plus-hero">
          <div className="ss-plus-hero-copy">
            <div className="ss-plus-hero-badges">
              <span className="ss-plus-eyebrow">
                PREMIUM PLUS
              </span>
              <span className="ss-plus-active-plan">
                ACTIVE PLAN
              </span>
            </div>

            <h1>
              Your premium
              <br />
              connection suite.
            </h1>

            <p>
              Everything designed to improve visibility,
              move strong connections forward, and give you
              faster support when you need it.
            </p>

            <div className="ss-plus-hero-actions">
              <Link
                href="/discover"
                className="ss-plus-primary-action"
              >
                Discover profiles
              </Link>

              <Link
                href="/matches"
                className="ss-plus-secondary-action"
              >
                View connections
              </Link>
            </div>
          </div>

          <div className="ss-plus-membership-card">
            <div className="ss-plus-membership-top">
              <span>SOULSYNC</span>
              <strong>PLUS</strong>
            </div>

            <div className="ss-plus-membership-main">
              <small>YOUR PLAN</small>
              <h3>Premium Plus</h3>
              <p>
                Maximum visibility and premium connection
                tools.
              </p>
            </div>

            <div className="ss-plus-membership-footer">
              <span>
                {boost?.active
                  ? 'Boost active'
                  : 'Boost ready'}
              </span>
              <span>
                {openTickets
                  ? `${openTickets} open support ${
                      openTickets === 1
                        ? 'ticket'
                        : 'tickets'
                    }`
                  : 'Priority support ready'}
              </span>
            </div>
          </div>
        </section>

        {notice && (
          <div className="ss-plus-notice">
            <span>✦</span>
            <p>{notice}</p>
          </div>
        )}

        <section className="ss-plus-feature-strip">
          <div className="ss-plus-feature-mini">
            <span className="ss-plus-feature-number">
              01
            </span>
            <div>
              <strong>Profile Boost</strong>
              <p>
                Move higher in eligible search discovery
                for 24 hours.
              </p>
            </div>
          </div>

          <div className="ss-plus-feature-mini">
            <span className="ss-plus-feature-number">
              02
            </span>
            <div>
              <strong>Video Calls</strong>
              <p>
                Start a video room after a mutual
                connection.
              </p>
            </div>
          </div>

          <div className="ss-plus-feature-mini">
            <span className="ss-plus-feature-number">
              03
            </span>
            <div>
              <strong>Priority Support</strong>
              <p>
                Send requests directly to the support
                queue.
              </p>
            </div>
          </div>
        </section>

        <div className="ss-plus-main-grid">
          <section className="ss-plus-premium-card ss-plus-boost-card">
            <div className="ss-plus-card-heading">
              <div>
                <span className="ss-plus-eyebrow">
                  VISIBILITY
                </span>
                <h2>Profile Boost</h2>
                <p>
                  Give your profile extra visibility for
                  the next 24 hours.
                </p>
              </div>

              <div
                className={`ss-plus-orb ${
                  boost?.active ? 'active' : ''
                }`}
              >
                <span>
                  {boost?.active ? 'ON' : '24H'}
                </span>
              </div>
            </div>

            {boost?.active ? (
              <div className="ss-plus-boost-active">
                <div>
                  <span>BOOST ACTIVE</span>
                  <strong>
                    Your profile is being prioritized.
                  </strong>
                </div>

                <div className="ss-plus-boost-time">
                  <small>ACTIVE UNTIL</small>
                  <strong>
                    {boost.boostedUntil
                      ? new Date(
                          boost.boostedUntil
                        ).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'Later'}
                  </strong>
                </div>
              </div>
            ) : (
              <>
                <div className="ss-plus-boost-meter">
                  <div className="ss-plus-boost-track">
                    <span />
                  </div>
                  <div className="ss-plus-boost-labels">
                    <span>Standard visibility</span>
                    <strong>Boosted visibility</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="ss-plus-primary-action"
                  disabled={busyBoost}
                  onClick={() => void activateBoost()}
                >
                  {busyBoost
                    ? 'Activating boost...'
                    : 'Activate 24-hour boost'}
                </button>
              </>
            )}

            <div className="ss-plus-card-footnote">
              <span>✦</span>
              Boost applies only while your profile is
              eligible to appear in discovery.
            </div>
          </section>

          <section className="ss-plus-premium-card ss-plus-video-card">
            <div className="ss-plus-card-heading">
              <div>
                <span className="ss-plus-eyebrow">
                  CONNECTION
                </span>
                <h2>Video Calls</h2>
                <p>
                  Continue a strong connection beyond
                  messaging.
                </p>
              </div>

              <div className="ss-plus-video-icon">
                <span>▶</span>
              </div>
            </div>

            <div className="ss-plus-video-flow">
              <div>
                <span>1</span>
                <p>
                  Match through an accepted interest.
                </p>
              </div>

              <div>
                <span>2</span>
                <p>
                  Open the member&apos;s profile.
                </p>
              </div>

              <div>
                <span>3</span>
                <p>
                  Start a Premium Plus video call.
                </p>
              </div>
            </div>

            <Link
              href="/matches"
              className="ss-plus-secondary-action"
            >
              View connected members
            </Link>

            <div className="ss-plus-card-footnote">
              <span>✓</span>
              Calls are available only after a mutual
              connection.
            </div>
          </section>
        </div>

        <section className="ss-plus-support-shell">
          <div className="ss-plus-support-intro">
            <span className="ss-plus-eyebrow">
              PRIORITY SUPPORT
            </span>

            <h2>
              Help when you need it,
              <br />
              without the runaround.
            </h2>

            <p>
              Premium Plus gives you a dedicated support
              queue for account, billing, safety, and
              product issues.
            </p>

            <div className="ss-plus-support-points">
              <div>
                <span>✓</span>
                <p>Dedicated Premium Plus queue</p>
              </div>
              <div>
                <span>✓</span>
                <p>Ticket history in one place</p>
              </div>
              <div>
                <span>✓</span>
                <p>Clear status tracking</p>
              </div>
            </div>
          </div>

          <div className="ss-plus-support-panel">
            <form
              className="ss-plus-support-form"
              onSubmit={submitSupport}
            >
              <div className="ss-plus-support-form-head">
                <div>
                  <span>NEW REQUEST</span>
                  <h3>Contact priority support</h3>
                </div>

                <span className="ss-plus-ticket-count">
                  {openTickets} open
                </span>
              </div>

              <label className="ss-plus-field">
                <span>Subject</span>
                <input
                  value={subject}
                  maxLength={200}
                  minLength={3}
                  required
                  onChange={event =>
                    setSubject(event.target.value)
                  }
                  placeholder="What can we help with?"
                />
              </label>

              <label className="ss-plus-field">
                <span>Message</span>
                <textarea
                  value={message}
                  maxLength={5000}
                  minLength={10}
                  required
                  onChange={event =>
                    setMessage(event.target.value)
                  }
                  placeholder="Give us enough detail to help quickly..."
                />
              </label>

              <button
                type="submit"
                className="ss-plus-primary-action"
                disabled={busySupport}
              >
                {busySupport
                  ? 'Submitting request...'
                  : 'Submit priority request'}
              </button>
            </form>

            <div className="ss-plus-ticket-history">
              <div className="ss-plus-ticket-history-head">
                <h3>Recent requests</h3>
                <span>{tickets.length} total</span>
              </div>

              {tickets.length ? (
                <div className="ss-plus-ticket-list">
                  {tickets
                    .slice(0, 4)
                    .map(ticket => (
                      <article
                        className="ss-plus-ticket-row"
                        key={ticket.id}
                      >
                        <div>
                          <strong>
                            {ticket.subject}
                          </strong>
                          <p>
                            {new Date(
                              ticket.createdAt
                            ).toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </div>

                        <span
                          className={`ss-plus-ticket-status ${ticket.status.toLowerCase()}`}
                        >
                          {ticket.status.replace(
                            '_',
                            ' '
                          )}
                        </span>
                      </article>
                    ))}
                </div>
              ) : (
                <div className="ss-plus-ticket-empty">
                  <span>◇</span>
                  <div>
                    <strong>
                      No support requests yet
                    </strong>
                    <p>
                      Your submitted tickets will appear
                      here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
