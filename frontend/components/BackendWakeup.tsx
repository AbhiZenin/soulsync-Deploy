'use client';

import {useEffect} from 'react';
import {BACKEND_ORIGIN} from '@/lib/api';

export async function warmSoulSyncBackend(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 180000);

    const response = await fetch(`${BACKEND_ORIGIN}/actuator/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    window.clearTimeout(timeout);
    return response.ok;
  } catch {
    // Warm-up is best-effort. Login itself will still call the API.
    return false;
  }
}

export default function BackendWakeup() {
  useEffect(() => {
    void warmSoulSyncBackend();
  }, []);

  return null;
}
