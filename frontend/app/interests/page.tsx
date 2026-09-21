'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AppShell from '@/components/AppShell';
import SecureImage from '@/components/SecureImage';
import { api } from '@/lib/api';
import type { Conversation, Interest, ProfileDetail } from '@/lib/types';

type Tab = 'received' | 'sent';

type MemberPreview = {
  displayName: string;
  age?: number;
  city?: string;
  state?: string;
  photo?: string;
};

export default function Interests() {
  const router = useRouter();

  const [received, setReceived] = useState<Interest[]>([]);
  const [sent, setSent] = useState<Interest[]>([]);
  const [members, setMembers] =
    useState<Record<string, MemberPreview>>({});
  const [tab, setTab] = useState<Tab>('received');
  const [processing, setProcessing] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');

    try {
      const [receivedInterests, sentInterests] =
        await Promise.all([
          api<Interest[]>('/interests/received'),
          api<Interest[]>('/interests/sent'),
        ]);

      setReceived(receivedInterests);
      setSent(sentInterests);

      const ids = [
        ...new Set([
          ...receivedInterests.map(interest => interest.senderId),
          ...sentInterests.map(interest => interest.receiverId),
        ]),
      ];

      const previews = await Promise.all(
        ids.map(async id => {
          try {
            const profile =
              await api<ProfileDetail>(`/profiles/${id}`);

            const primary =
              profile.photos?.find(photo => photo.primary) ??
              profile.photos?.[0];

            return [
              id,
              {
                displayName:
                  profile.displayName || 'SoulSync member',
                age: profile.age,
                city: profile.city,
                state: profile.state,
                photo: primary?.url,
              },
            ] as const;
          } catch {
            return [
              id,
              {
                displayName: 'SoulSync member',
              },
            ] as const;
          }
        })
      );

      setMembers(Object.fromEntries(previews));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to load interests.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const pendingReceived = useMemo(
    () =>
      received.filter(
        interest => interest.status === 'PENDING'
      ).length,
    [received]
  );

  const connectedCount = useMemo(
    () =>
      [...received, ...sent].filter(
        interest => interest.status === 'ACCEPTED'
      ).length,
    [received, sent]
  );

  async function openConversation(
    targetUserId: string,
    interestId: string
  ) {
    setProcessing(interestId);
    setError('');

    try {
      const conversation = await api<Conversation>(
        `/conversations/with/${targetUserId}`,
        { method: 'POST' }
      );

      router.push(
        `/messages?conversation=${encodeURIComponent(
          conversation.id
        )}`
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to open the conversation.'
      );
      setProcessing(null);
    }
  }

  async function respond(
    interest: Interest,
    action: 'accept' | 'decline' | 'withdraw'
  ) {
    setProcessing(interest.id);
    setError('');

    try {
      await api(`/interests/${interest.id}/${action}`, {
        method: 'PATCH',
      });

      if (action === 'accept') {
        const conversation = await api<Conversation>(
          `/conversations/with/${interest.senderId}`,
          { method: 'POST' }
        );

        router.push(
          `/messages?conversation=${encodeURIComponent(
            conversation.id
          )}`
        );
        return;
      }

      await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to update interest.'
      );
    } finally {
      setProcessing(null);
    }
  }

  const visible =
    tab === 'received' ? received : sent;

  return (
    <AppShell
      title="Interests"
      subtitle="Review requests, manage sent interests, and continue conversations when a connection is mutual."
    >
      <div className="ss-interests-page">
        <section className="ss-interests-summary">
          <div className="ss-interest-stat">
            <span>Awaiting you</span>
            <strong>{pendingReceived}</strong>
            <small>New interests to review</small>
          </div>

          <div className="ss-interest-stat">
            <span>Connections</span>
            <strong>{connectedCount}</strong>
            <small>Accepted interests</small>
          </div>

          <div className="ss-interest-stat">
            <span>Sent</span>
            <strong>{sent.length}</strong>
            <small>Total interests sent</small>
          </div>
        </section>

        {error && (
          <div className="form-message error">{error}</div>
        )}

        <section className="ss-interests-card">
          <div className="ss-interests-card-head">
            <div>
              <span className="ss-interests-kicker">
                CONNECTIONS
              </span>
              <h2>Your interests</h2>
              <p>
                Keep track of requests waiting on you or the
                other member.
              </p>
            </div>

            <div
              className="ss-interest-tabs"
              role="tablist"
              aria-label="Interest type"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'received'}
                className={
                  tab === 'received' ? 'active' : ''
                }
                onClick={() => setTab('received')}
              >
                Received
                {pendingReceived > 0 && (
                  <span>{pendingReceived}</span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tab === 'sent'}
                className={tab === 'sent' ? 'active' : ''}
                onClick={() => setTab('sent')}
              >
                Sent
                {sent.length > 0 && (
                  <span>{sent.length}</span>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="ss-interests-loading">
              <span className="spinner" />
              <p>Loading your interests...</p>
            </div>
          ) : visible.length ? (
            <div className="ss-interest-list">
              {visible.map(interest => {
                const targetId =
                  tab === 'received'
                    ? interest.senderId
                    : interest.receiverId;

                const member =
                  members[targetId] ?? {
                    displayName: 'SoulSync member',
                  };

                return (
                  <InterestRow
                    key={interest.id}
                    interest={interest}
                    member={member}
                    targetId={targetId}
                    direction={tab}
                    processing={
                      processing === interest.id
                    }
                    onAccept={() =>
                      void respond(interest, 'accept')
                    }
                    onDecline={() =>
                      void respond(interest, 'decline')
                    }
                    onWithdraw={() =>
                      void respond(interest, 'withdraw')
                    }
                    onMessage={() =>
                      void openConversation(
                        targetId,
                        interest.id
                      )
                    }
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState tab={tab} />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function InterestRow({
  interest,
  member,
  targetId,
  direction,
  processing,
  onAccept,
  onDecline,
  onWithdraw,
  onMessage,
}: {
  interest: Interest;
  member: MemberPreview;
  targetId: string;
  direction: Tab;
  processing: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
  onMessage: () => void;
}) {
  const details = [
    member.age ? `${member.age} yrs` : null,
    member.city,
    member.state,
  ]
    .filter(Boolean)
    .join(' · ');

  const date = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(interest.createdAt));

  const statusLabel =
    interest.status === 'ACCEPTED'
      ? 'Connected'
      : interest.status === 'PENDING'
        ? direction === 'received'
          ? 'Awaiting response'
          : 'Pending'
        : interest.status === 'DECLINED'
          ? 'Declined'
          : interest.status;

  return (
    <article className="ss-interest-row">
      <Link
        href={`/profile/${targetId}`}
        className="ss-interest-avatar"
        aria-label={`View ${member.displayName}'s profile`}
      >
        {member.photo ? (
          <SecureImage
            path={member.photo}
            alt={member.displayName}
          />
        ) : (
          <span>
            {member.displayName
              .trim()
              .charAt(0)
              .toUpperCase()}
          </span>
        )}
      </Link>

      <div className="ss-interest-member">
        <Link
          href={`/profile/${targetId}`}
          className="ss-interest-name"
        >
          {member.displayName}
        </Link>

        <p>{details || 'SoulSync member'}</p>

        <small>
          {direction === 'received' ? 'Received' : 'Sent'}{' '}
          {date}
        </small>
      </div>

      <div className="ss-interest-status">
        <span
          className={`ss-interest-status-pill ${interest.status.toLowerCase()}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="ss-interest-actions">
        {interest.status === 'PENDING' &&
          direction === 'received' && (
            <>
              <button
                type="button"
                className="primary-btn"
                disabled={processing}
                onClick={onAccept}
              >
                {processing ? 'Accepting...' : 'Accept'}
              </button>

              <button
                type="button"
                className="ghost-btn"
                disabled={processing}
                onClick={onDecline}
              >
                Decline
              </button>
            </>
          )}

        {interest.status === 'PENDING' &&
          direction === 'sent' && (
            <button
              type="button"
              className="ghost-btn"
              disabled={processing}
              onClick={onWithdraw}
            >
              {processing ? 'Withdrawing...' : 'Withdraw'}
            </button>
          )}

        {interest.status === 'ACCEPTED' && (
          <>
            <button
              type="button"
              className="primary-btn ss-interest-message"
              disabled={processing}
              onClick={onMessage}
            >
              {processing ? 'Opening...' : 'Message'}
            </button>

            <Link
              className="ghost-btn"
              href={`/profile/${targetId}`}
            >
              View profile
            </Link>
          </>
        )}

        {interest.status !== 'PENDING' &&
          interest.status !== 'ACCEPTED' && (
            <Link
              className="ghost-btn"
              href={`/profile/${targetId}`}
            >
              View profile
            </Link>
          )}
      </div>
    </article>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="ss-interest-empty">
      <div className="ss-interest-empty-icon">
        {tab === 'received' ? '♡' : '↗'}
      </div>

      <h3>
        {tab === 'received'
          ? 'No interests waiting'
          : 'No sent interests yet'}
      </h3>

      <p>
        {tab === 'received'
          ? 'New interests from members will appear here when they arrive.'
          : 'Discover compatible profiles and send an interest when someone stands out.'}
      </p>

      <Link
        href={tab === 'received' ? '/discover' : '/search'}
        className="secondary-btn"
      >
        {tab === 'received'
          ? 'Discover matches'
          : 'Browse profiles'}
      </Link>
    </div>
  );
}
