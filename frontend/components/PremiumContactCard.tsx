'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Subscription = {
  plan: string;
  entitlements: string[];
};

type Contact = {
  userId: string;
  email: string;
  phoneNumber?: string | null;
};

export default function PremiumContactCard({
  userId,
}: {
  userId: string;
}) {
  const [ready, setReady] = useState(false);
  const [canView, setCanView] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    api<Subscription>('/subscriptions/me')
      .then(subscription => {
        if (!active) return;
        setCanView(
          subscription.entitlements.includes('VIEW_CONTACT')
        );
      })
      .catch(() => {
        if (active) setCanView(false);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  async function reveal() {
    setLoading(true);
    setMessage('');

    try {
      const result = await api<Contact>(
        `/contacts/${userId}`
      );
      setContact(result);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load contact details.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return null;
  }

  if (!canView) {
    return (
      <div className="ss-contact-card ss-contact-card-locked">
        <span className="ss-premium-lock-badge">
          PREMIUM
        </span>
        <strong>Contact visibility</strong>
        <p>
          Premium members can view contact details after a
          mutual connection.
        </p>
        <Link className="secondary-btn" href="/premium">
          View Premium plans
        </Link>
      </div>
    );
  }

  return (
    <div className="ss-contact-card">
      <div className="ss-contact-card-head">
        <div>
          <span className="ss-premium-lock-badge">
            PREMIUM
          </span>
          <strong>Contact details</strong>
        </div>
      </div>

      {contact ? (
        <div className="list">
          <div className="list-row">
            <span className="muted">Email</span>
            <a href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </div>

          {contact.phoneNumber ? (
            <div className="list-row">
              <span className="muted">Phone</span>
              <a href={`tel:${contact.phoneNumber}`}>
                {contact.phoneNumber}
              </a>
            </div>
          ) : (
            <div className="list-row">
              <span className="muted">Phone</span>
              <span>Not provided</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <p>
            Contact information is available only after you
            and this member are mutually connected.
          </p>
          <button
            type="button"
            className="secondary-btn"
            disabled={loading}
            onClick={() => void reveal()}
          >
            {loading
              ? 'Loading contact...'
              : 'Show contact details'}
          </button>
        </>
      )}

      {message && (
        <div className="form-message">
          {message}
        </div>
      )}
    </div>
  );
}
