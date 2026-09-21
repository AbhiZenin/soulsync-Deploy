'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Subscription = {
  plan: string;
  entitlements: string[];
};

type VideoCall = {
  id: string;
  callerId: string;
  calleeId: string;
  joinUrl: string;
  expiresAt: string;
};

export default function PremiumPlusVideoCall({
  userId,
}: {
  userId: string;
}) {
  const [ready, setReady] = useState(false);
  const [canCall, setCanCall] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    api<Subscription>('/subscriptions/me')
      .then(subscription => {
        if (!active) return;
        setCanCall(subscription.entitlements.includes('VIDEO_CALL'));
      })
      .catch(() => {
        if (active) setCanCall(false);
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  async function startCall() {
    setBusy(true);
    setMessage('');

    try {
      const call = await api<VideoCall>(
        `/premium-plus/video-calls/${userId}`,
        { method: 'POST' }
      );
      window.open(call.joinUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start video call.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  if (!canCall) {
    return (
      <div className="ss-plus-call ss-plus-locked">
        <span className="ss-plus-badge">PREMIUM PLUS</span>
        <strong>Video call</strong>
        <p>
          Upgrade to Premium Plus to start a connection-authorized
          video call.
        </p>
        <Link href="/premium" className="secondary-btn">
          View Premium Plus
        </Link>
      </div>
    );
  }

  return (
    <div className="ss-plus-call">
      <span className="ss-plus-badge">PREMIUM PLUS</span>
      <strong>Video call</strong>
      <p>Video calls can be started only after a mutual connection.</p>
      <button
        type="button"
        className="secondary-btn"
        disabled={busy}
        onClick={() => void startCall()}
      >
        {busy ? 'Starting call...' : 'Start video call'}
      </button>

      {message && <div className="form-message">{message}</div>}
    </div>
  );
}
