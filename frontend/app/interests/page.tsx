'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import type { Interest, Conversation } from '@/lib/types';

export default function Interests() {
  const router = useRouter();

  const [received, setReceived] = useState<Interest[]>([]);
  const [sent, setSent] = useState<Interest[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [r, s] = await Promise.all([
        api<Interest[]>('/interests/received'),
        api<Interest[]>('/interests/sent'),
      ]);

      setReceived(r);
      setSent(s);

      const ids = [
        ...new Set([
          ...r.map(x => x.senderId),
          ...s.map(x => x.receiverId),
        ]),
      ];

      const profileNames = await Promise.all(
        ids.map(async id => {
          try {
            const profile = await api<{ displayName?: string }>(
              `/profiles/${id}`
            );

            return [
              id,
              profile.displayName || 'SoulSync member',
            ] as const;
          } catch {
            return [id, 'SoulSync member'] as const;
          }
        })
      );

      setNames(Object.fromEntries(profileNames));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to load interests.'
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

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

      /*
       * When an interest is accepted, the backend creates/
       * exposes the conversation. Fetch conversations and
       * locate the one belonging to the sender.
       */
      if (action === 'accept') {
        const conversations =
          await api<Conversation[]>('/conversations');

        const conversation = conversations.find(c => {
          const item = c as Conversation & {
            otherUserId?: string;
          };

          return item.otherUserId === interest.senderId;
        });

        if (conversation) {
          router.push(
            `/messages?conversation=${encodeURIComponent(
              conversation.id
            )}`
          );

          return;
        }

        /*
         * Very small fallback in case the conversation endpoint
         * needs a moment before returning the newly created chat.
         */
        await new Promise(resolve => setTimeout(resolve, 500));

        const retry =
          await api<Conversation[]>('/conversations');

        const retryConversation = retry.find(c => {
          const item = c as Conversation & {
            otherUserId?: string;
          };

          return item.otherUserId === interest.senderId;
        });

        if (retryConversation) {
          router.push(
            `/messages?conversation=${encodeURIComponent(
              retryConversation.id
            )}`
          );

          return;
        }

        /*
         * Acceptance still succeeded even if the conversation
         * could not immediately be resolved.
         */
        await load();

        setError(
          'Interest accepted. Your conversation is available from Messages.'
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

  return (
    <AppShell
      title="Interests"
      subtitle="Connections begin only when interest is mutual."
    >
      {error && (
        <div className="form-message section-gap">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Received</h2>

            <span className="status PENDING">
              {
                received.filter(
                  interest => interest.status === 'PENDING'
                ).length
              }{' '}
              pending
            </span>
          </div>

          <div className="list">
            {received.length ? (
              received.map(interest => (
                <div
                  className="list-row"
                  key={interest.id}
                >
                  <div>
                    <h4>
                      <Link
                        href={`/profile/${interest.senderId}`}
                      >
                        {names[interest.senderId] ??
                          'Member'}
                      </Link>
                    </h4>

                    <p>
                      {new Date(
                        interest.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 7,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      className={`status ${interest.status}`}
                    >
                      {interest.status}
                    </span>

                    {interest.status === 'PENDING' && (
                      <>
                        <button
                          className="primary-btn"
                          disabled={
                            processing === interest.id
                          }
                          onClick={() =>
                            void respond(
                              interest,
                              'accept'
                            )
                          }
                        >
                          {processing === interest.id
                            ? 'Accepting...'
                            : 'Accept & message'}
                        </button>

                        <button
                          className="ghost-btn"
                          disabled={
                            processing === interest.id
                          }
                          onClick={() =>
                            void respond(
                              interest,
                              'decline'
                            )
                          }
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {interest.status === 'ACCEPTED' && (
                      <Link
                        href="/messages"
                        className="primary-btn"
                      >
                        Messages
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">
                No interests received yet.
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Sent</h2>
          </div>

          <div className="list">
            {sent.length ? (
              sent.map(interest => (
                <div
                  className="list-row"
                  key={interest.id}
                >
                  <div>
                    <h4>
                      <Link
                        href={`/profile/${interest.receiverId}`}
                      >
                        {names[interest.receiverId] ??
                          'Member'}
                      </Link>
                    </h4>

                    <p>
                      {new Date(
                        interest.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 7,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      className={`status ${interest.status}`}
                    >
                      {interest.status}
                    </span>

                    {interest.status === 'PENDING' && (
                      <button
                        className="ghost-btn"
                        disabled={
                          processing === interest.id
                        }
                        onClick={() =>
                          void respond(
                            interest,
                            'withdraw'
                          )
                        }
                      >
                        Withdraw
                      </button>
                    )}

                    {interest.status === 'ACCEPTED' && (
                      <Link
                        href="/messages"
                        className="primary-btn"
                      >
                        Messages
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">
                You have not sent any interests.
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}