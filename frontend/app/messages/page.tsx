'use client';

import Link from 'next/link';
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AppShell from '@/components/AppShell';
import { api, getAccessToken } from '@/lib/api';
import type { Conversation, ChatMessage } from '@/lib/types';
import { Client } from '@stomp/stompjs';

const WS =
  process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws';

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const selectedRef = useRef<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = useMemo(() => getCurrentUserHint(), []);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    api<Conversation[]>('/conversations')
      .then(cs => {
        setConversations(cs);

        const q = new URLSearchParams(
          window.location.search
        ).get('conversation');

        setSelected(q || cs[0]?.id || null);
      })
      .catch(e => {
        setError(
          e instanceof Error
            ? e.message
            : 'Unable to load conversations.'
        );
      });

    const token = getAccessToken();
    if (!token) return;

    const client = new Client({
      brokerURL: WS,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      reconnectDelay: 4000,

      onConnect: () => {
        client.subscribe('/user/queue/messages', frame => {
          const message = JSON.parse(
            frame.body
          ) as ChatMessage;

          if (
            message.conversationId === selectedRef.current
          ) {
            setMsgs(old =>
              old.some(x => x.id === message.id)
                ? old
                : [message, ...old]
            );
          }

          api<Conversation[]>('/conversations')
            .then(setConversations)
            .catch(() => {});
        });
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, []);

  useEffect(() => {
    if (!selected) {
      setMsgs([]);
      return;
    }

    setLoadingMessages(true);
    setError('');

    api<ChatMessage[]>(
      `/conversations/${selected}/messages`
    )
      .then(setMsgs)
      .catch(e => {
        setError(
          e instanceof Error
            ? e.message
            : 'Unable to load messages.'
        );
      })
      .finally(() => setLoadingMessages(false));

    api(`/conversations/${selected}/read`, {
      method: 'PATCH',
    }).catch(() => {});
  }, [selected]);

  useEffect(() => {
    if (!messagesRef.current) return;

    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop =
          messagesRef.current.scrollHeight;
      }
    });
  }, [msgs, selected]);

  async function send(e?: FormEvent) {
    e?.preventDefault();

    const body = text.trim();

    if (!selected || !body || sending) return;

    setSending(true);
    setError('');

    try {
      const message = await api<ChatMessage>(
        `/conversations/${selected}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body }),
        }
      );

      setMsgs(current =>
        current.some(existing => existing.id === message.id)
          ? current
          : [message, ...current]
      );

      setText('');

      api<Conversation[]>('/conversations')
        .then(setConversations)
        .catch(() => {});
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to send your message.'
      );
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(
    e: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const activeConversation = conversations.find(
    conversation => conversation.id === selected
  );

  const filteredConversations = conversations.filter(
    conversation =>
      (conversation.otherDisplayName || 'SoulSync member')
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const chronologicalMessages = [...msgs].reverse();

  return (
    <AppShell
      title="Messages"
      subtitle="Continue conversations with members you've connected with."
    >
      <div className="ss-chat-page">
        {error && (
          <div className="ss-chat-error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="ss-chat-shell">
          <aside className="ss-chat-sidebar">
            <div className="ss-chat-sidebar-head">
              <div>
                <span className="ss-chat-kicker">
                  CONVERSATIONS
                </span>

                <h2>Messages</h2>
              </div>

              <span className="ss-chat-count">
                {conversations.length}
              </span>
            </div>

            <div className="ss-chat-search">
              <span>⌕</span>

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
              />
            </div>

            <div className="ss-chat-conversations">
              {filteredConversations.length ? (
                filteredConversations.map(conversation => {
                  const active =
                    selected === conversation.id;

                  return (
                    <button
                      type="button"
                      key={conversation.id}
                      className={
                        active
                          ? 'ss-chat-conversation active'
                          : 'ss-chat-conversation'
                      }
                      onClick={() =>
                        setSelected(conversation.id)
                      }
                    >
                      <Avatar
                        name={
                          conversation.otherDisplayName ||
                          'SoulSync member'
                        }
                      />

                      <div className="ss-chat-conversation-copy">
                        <div className="ss-chat-conversation-top">
                          <strong>
                            {conversation.otherDisplayName ||
                              'SoulSync member'}
                          </strong>

                          <time>
                            {conversationTime(
                              conversation.updatedAt
                            )}
                          </time>
                        </div>

                        <p>
                          {active
                            ? 'Open conversation'
                            : 'Continue your conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="ss-chat-no-conversations">
                  <div>♡</div>

                  <strong>
                    {search
                      ? 'No conversations found'
                      : 'No conversations yet'}
                  </strong>

                  <p>
                    {search
                      ? 'Try another name.'
                      : 'When an interest is accepted, your conversation will appear here.'}
                  </p>
                </div>
              )}
            </div>

            <div className="ss-chat-sidebar-foot">
              <span>♡</span>
              Chat becomes available after an interest is accepted.
            </div>
          </aside>

          <section className="ss-chat-main">
            {selected && activeConversation ? (
              <>
                <header className="ss-chat-header">
                  <div className="ss-chat-person">
                    <Avatar
                      name={
                        activeConversation.otherDisplayName ||
                        'SoulSync member'
                      }
                      large
                    />

                    <div>
                      <h3>
                        {activeConversation.otherDisplayName ||
                          'SoulSync member'}
                      </h3>

                      <p>
                        <span>✓</span>
                        SoulSync connection
                      </p>
                    </div>
                  </div>

                  <div className="ss-chat-header-actions">
                    {'otherUserId' in activeConversation &&
                    typeof (
                      activeConversation as Conversation & {
                        otherUserId?: string;
                      }
                    ).otherUserId === 'string' ? (
                      <Link
                        className="ss-chat-profile-button"
                        href={`/profile/${
                          (
                            activeConversation as Conversation & {
                              otherUserId: string;
                            }
                          ).otherUserId
                        }`}
                      >
                        View profile
                      </Link>
                    ) : (
                      <span className="ss-chat-safe">
                        <span>♢</span>
                        Connected
                      </span>
                    )}
                  </div>
                </header>

                <div className="ss-chat-safety">
                  <span>♢</span>

                  <p>
                    Keep conversations respectful. Never share
                    financial information or sensitive personal
                    details with someone you don't trust.
                  </p>
                </div>

                <div
                  className="ss-chat-messages"
                  ref={messagesRef}
                >
                  {loadingMessages ? (
                    <div className="ss-chat-loading">
                      <span />
                      Loading conversation...
                    </div>
                  ) : chronologicalMessages.length ? (
                    <>
                      <div className="ss-chat-date">
                        <span>
                          {conversationDate(
                            chronologicalMessages[0].createdAt
                          )}
                        </span>
                      </div>

                      {chronologicalMessages.map(
                        (message, index) => {
                          const mine =
                            message.senderId === currentUserId;

                          const previous =
                            chronologicalMessages[index - 1];

                          const showDate =
                            index > 0 &&
                            !sameDay(
                              previous.createdAt,
                              message.createdAt
                            );

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="ss-chat-date">
                                  <span>
                                    {conversationDate(
                                      message.createdAt
                                    )}
                                  </span>
                                </div>
                              )}

                              <div
                                className={
                                  mine
                                    ? 'ss-chat-message-row mine'
                                    : 'ss-chat-message-row'
                                }
                              >
                                {!mine && (
                                  <Avatar
                                    name={
                                      activeConversation.otherDisplayName ||
                                      'SoulSync member'
                                    }
                                    small
                                  />
                                )}

                                <div
                                  className={
                                    mine
                                      ? 'ss-chat-bubble mine'
                                      : 'ss-chat-bubble'
                                  }
                                >
                                  <p>{message.body}</p>

                                  <div className="ss-chat-message-meta">
                                    <time>
                                      {new Date(
                                        message.createdAt
                                      ).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </time>

                                    {mine && <span>✓</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </>
                  ) : (
                    <div className="ss-chat-empty-chat">
                      <div className="ss-chat-empty-heart">
                        ♡
                      </div>

                      <h3>
                        Start a meaningful conversation
                      </h3>

                      <p>
                        You and{' '}
                        {activeConversation.otherDisplayName ||
                          'this member'}{' '}
                        are connected. Say hello and get to know
                        each other.
                      </p>

                      <div className="ss-chat-starters">
                        <button
                          type="button"
                          onClick={() =>
                            setText(
                              'Hi! It’s nice to connect with you.'
                            )
                          }
                        >
                          👋 Say hello
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setText(
                              'Hi! How has your day been?'
                            )
                          }
                        >
                          ☺ Ask about their day
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <form
                  className="ss-chat-composer"
                  onSubmit={send}
                >
                  <div className="ss-chat-composer-box">
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      maxLength={4000}
                      rows={1}
                      placeholder={`Message ${
                        activeConversation.otherDisplayName ||
                        ''
                      }...`}
                    />

                    <div className="ss-chat-compose-bottom">
                      <span>
                        Enter to send · Shift + Enter for new line
                      </span>

                      <div>
                        <span className="ss-chat-character-count">
                          {text.length > 3500
                            ? `${text.length}/4000`
                            : ''}
                        </span>

                        <button
                          className="ss-chat-send"
                          disabled={
                            sending || !text.trim()
                          }
                          type="submit"
                          aria-label="Send message"
                        >
                          {sending ? (
                            '...'
                          ) : (
                            <>
                              Send <span>➤</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            ) : (
              <div className="ss-chat-select-empty">
                <div>♡</div>

                <h2>Your conversations</h2>

                <p>
                  Select a conversation to continue getting to
                  know someone.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function Avatar({
  name,
  large = false,
  small = false,
}: {
  name: string;
  large?: boolean;
  small?: boolean;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

  return (
    <div
      className={[
        'ss-chat-avatar',
        large ? 'large' : '',
        small ? 'small' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {initials || 'S'}
    </div>
  );
}

function conversationTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  if (sameDay(date.toISOString(), now.toISOString())) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function conversationDate(value: string) {
  const date = new Date(value);
  const now = new Date();

  if (sameDay(date.toISOString(), now.toISOString())) {
    return 'Today';
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== now.getFullYear()
        ? 'numeric'
        : undefined,
  });
}

function sameDay(a: string, b: string) {
  const first = new Date(a);
  const second = new Date(b);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getCurrentUserHint() {
  try {
    const token = getAccessToken();

    if (!token) return '';

    const payload = JSON.parse(
      atob(
        token
          .split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/')
      )
    );

    return payload.sub ?? '';
  } catch {
    return '';
  }
}
