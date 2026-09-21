'use client';

import { useEffect, useState } from 'react';

import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

type Sub = {
  plan: string;
  startsAt?: string;
  endsAt?: string;
  entitlements: string[];
};

type PaidPlan = 'PREMIUM' | 'PREMIUM_PLUS';

export default function Premium() {
  const [sub, setSub] = useState<Sub | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkingOut, setCheckingOut] =
    useState<PaidPlan | null>(null);

  async function load() {
    try {
      const data = await api<Sub>('/subscriptions/me');
      setSub(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to load your subscription.'
      );
    }
  }

  useEffect(() => {
    void load();

    const params = new URLSearchParams(
      window.location.search
    );

    if (params.get('success') === '1') {
      setMessage(
        'Payment completed. Updating your SoulSync plan...'
      );

      let attempts = 0;

      const timer = window.setInterval(async () => {
        attempts += 1;

        try {
          const data =
            await api<Sub>('/subscriptions/me');

          setSub(data);

          if (data.plan !== 'FREE') {
            setMessage(
              `Success! Your ${data.plan.replace(
                '_',
                ' '
              )} plan is now active.`
            );

            window.clearInterval(timer);

            window.history.replaceState(
              {},
              '',
              '/premium'
            );
          }
        } catch {
          // Retry briefly while the webhook is processed.
        }

        if (attempts >= 10) {
          window.clearInterval(timer);

          setMessage(
            'Payment was completed. If your plan has not updated yet, refresh this page in a few seconds.'
          );
        }
      }, 2000);

      return () => window.clearInterval(timer);
    }

    if (params.get('canceled') === '1') {
      setMessage(
        'Checkout was canceled. Your current plan was not changed.'
      );

      window.history.replaceState(
        {},
        '',
        '/premium'
      );
    }
  }, []);

  async function choose(plan: PaidPlan) {
    setCheckingOut(plan);
    setError('');
    setMessage('');

    try {
      const checkout = await api<{ url: string }>(
        '/subscriptions/checkout',
        {
          method: 'POST',
          body: JSON.stringify({ plan }),
        }
      );

      if (!checkout.url) {
        throw new Error(
          'Stripe checkout URL was not returned.'
        );
      }

      window.location.href = checkout.url;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to start checkout.'
      );

      setCheckingOut(null);
    }
  }

  const plans = [
    {
      name: 'FREE',
      price: '$0',
      description: 'Get started with SoulSync.',
      items: [
        'Create a complete profile',
        'Compatibility recommendations',
        'Basic profile search',
        'Send interests',
        'Message after a mutual connection',
        'Privacy and photo controls',
      ],
    },
    {
      name: 'PREMIUM',
      price: '$29/mo',
      description:
        'More ways to discover and connect.',
      items: [
        'Everything in Free',
        'Advanced search filters',
        'See profile visitors',
        'Unlimited interests',
        'Contact visibility',
        'Enhanced discovery features',
      ],
    },
    {
      name: 'PREMIUM_PLUS',
      price: '$49/mo',
      description:
        'Maximum visibility and premium features.',
      items: [
        'Everything in Premium',
        'Profile boost',
        'Video-call entitlement',
        'Priority support',
      ],
    },
  ];

  return (
    <AppShell
      title="SoulSync Premium"
      subtitle={`Current plan: ${
        sub?.plan?.replace('_', ' ') ?? 'loading...'
      }`}
    >
      {message && (
        <div className="form-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="form-message error">
          {error}
        </div>
      )}

      <div className="premium-grid section-gap">
        {plans.map(plan => {
          const current = sub?.plan === plan.name;
          const paid = plan.name !== 'FREE';

          return (
            <div
              className={`plan ${
                plan.name === 'PREMIUM'
                  ? 'featured'
                  : ''
              }`}
              key={plan.name}
            >
              <span
                className={`status ${
                  current ? 'ACTIVE' : ''
                }`}
              >
                {current
                  ? 'CURRENT'
                  : paid
                    ? 'AVAILABLE'
                    : 'PLAN'}
              </span>

              <h3>
                {plan.name.replace('_', ' ')}
              </h3>

              <div className="plan-price">
                {plan.price}
              </div>

              <p className="muted">
                {plan.description}
              </p>

              <ul>
                {plan.items.map(item => (
                  <li key={item}>
                    {item}
                  </li>
                ))}
              </ul>

              {current && (
                <button
                  className="ghost-btn"
                  type="button"
                  disabled
                >
                  Current plan
                </button>
              )}

              {paid && !current && (
                <button
                  className="primary-btn"
                  type="button"
                  disabled={
                    checkingOut !== null
                  }
                  onClick={() =>
                    void choose(
                      plan.name as PaidPlan
                    )
                  }
                >
                  {checkingOut === plan.name
                    ? 'Opening checkout...'
                    : `Choose ${plan.name.replace(
                        '_',
                        ' '
                      )}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}