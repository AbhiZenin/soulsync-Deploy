'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [boost, setBoost] = useState<Boost | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busyBoost, setBusyBoost] = useState(false);
  const [busySupport, setBusySupport] = useState(false);
  const [notice, setNotice] = useState('');

  const isPlus =
    subscription?.entitlements.includes('PROFILE_BOOST') ?? false;

  useEffect(() => {
    api<Subscription>('/subscriptions/me')
      .then(setSubscription)
      .catch(error => {
        setNotice(
          error instanceof Error
            ? error.message
            : 'Unable to load subscription.'
        );
      });
  }, []);

  useEffect(() => {
    if (!isPlus) return;

    Promise.all([
      api<Boost>('/premium-plus/boost'),
      api<Ticket[]>('/premium-plus/support'),
    ])
      .then(([b, t]) => {
        setBoost(b);
        setTickets(t);
      })
      .catch(error => {
        setNotice(
          error instanceof Error
            ? error.message
            : 'Unable to load Premium Plus features.'
        );
      });
  }, [isPlus]);

  async function activateBoost() {
    setBusyBoost(true);
    setNotice('');
    try {
      setBoost(
        await api<Boost>('/premium-plus/boost', {
          method: 'POST',
        })
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
      await api<Ticket>('/premium-plus/support', {
        method: 'POST',
        body: JSON.stringify({ subject, message }),
      });

      setSubject('');
      setMessage('');
      setNotice('Priority support ticket submitted.');
      setTickets(await api<Ticket[]>('/premium-plus/support'));
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

  return (
    <AppShell
      title="Premium Plus"
      subtitle="Maximum visibility and premium communication features."
    >
      {notice && (
        <div className="form-message section-gap">{notice}</div>
      )}

      {subscription && !isPlus ? (
        <section className="panel ss-plus-upgrade">
          <span className="ss-plus-badge">PREMIUM PLUS</span>
          <h2>Unlock Premium Plus</h2>
          <p className="muted">
            Profile boosts, video-call entitlement, and priority
            support are included with Premium Plus.
          </p>
          <Link href="/premium" className="primary-btn">
            View Premium Plus plan
          </Link>
        </section>
      ) : !subscription ? (
        <section className="panel">Loading Premium Plus...</section>
      ) : (
        <div className="ss-plus-grid">
          <section className="panel">
            <span className="ss-plus-badge">PROFILE BOOST</span>
            <h2>Increase discovery visibility</h2>
            <p className="muted">
              Activate a 24-hour boost. While active, your profile
              is prioritized in eligible search discovery.
            </p>

            {boost?.active ? (
              <div className="ss-plus-active">
                <strong>Boost active</strong>
                <span>
                  Until{' '}
                  {boost.boostedUntil
                    ? new Date(boost.boostedUntil).toLocaleString()
                    : 'later'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="primary-btn"
                disabled={busyBoost}
                onClick={() => void activateBoost()}
              >
                {busyBoost
                  ? 'Activating...'
                  : 'Boost my profile for 24 hours'}
              </button>
            )}
          </section>

          <section className="panel">
            <span className="ss-plus-badge">VIDEO CALLS</span>
            <h2>Call after connecting</h2>
            <p className="muted">
              Open a mutually connected member's profile and use
              the Premium Plus video-call control there.
            </p>
            <Link href="/matches" className="secondary-btn">
              View connections
            </Link>
          </section>

          <section className="panel ss-plus-support">
            <span className="ss-plus-badge">PRIORITY SUPPORT</span>
            <h2>Priority support</h2>
            <p className="muted">
              Submit a ticket directly to the SoulSync support queue.
            </p>

            <form className="form section-gap" onSubmit={submitSupport}>
              <div className="field">
                <label>Subject</label>
                <input
                  value={subject}
                  maxLength={200}
                  minLength={3}
                  required
                  onChange={e => setSubject(e.target.value)}
                  placeholder="How can we help?"
                />
              </div>

              <div className="field">
                <label>Message</label>
                <textarea
                  value={message}
                  maxLength={5000}
                  minLength={10}
                  required
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe the issue or request."
                />
              </div>

              <button className="primary-btn" disabled={busySupport}>
                {busySupport ? 'Submitting...' : 'Submit priority ticket'}
              </button>
            </form>

            <div className="section-gap">
              <h3>Your tickets</h3>
              {tickets.length ? (
                <div className="list">
                  {tickets.map(ticket => (
                    <div
                      className="list-row ss-plus-ticket"
                      key={ticket.id}
                    >
                      <div>
                        <strong>{ticket.subject}</strong>
                        <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                      <span className={`status ${ticket.status}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  No priority support tickets yet.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
