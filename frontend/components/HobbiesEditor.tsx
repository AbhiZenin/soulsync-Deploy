'use client';

import {useEffect, useMemo, useState} from 'react';
import {api} from '@/lib/api';

type HobbiesDto = {
  hobbies?: string | null;
};

const suggestions = [
  'Travel',
  'Music',
  'Fitness',
  'Cooking',
  'Reading',
  'Movies',
  'Photography',
  'Hiking',
  'Sports',
  'Gaming',
  'Dance',
  'Volunteering',
  'Art',
  'Long drives',
];

function split(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .filter((item, index, all) =>
      all.findIndex(value => value.toLowerCase() === item.toLowerCase()) === index
    );
}

export default function HobbiesEditor() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<HobbiesDto>('/profile/hobbies')
      .then(result => setValue(result.hobbies ?? ''))
      .catch(() => {});
  }, []);

  const selected = useMemo(() => split(value), [value]);

  function toggle(hobby: string) {
    const current = split(value);
    const exists = current.some(
      item => item.toLowerCase() === hobby.toLowerCase()
    );

    setValue(
      (exists
        ? current.filter(item => item.toLowerCase() !== hobby.toLowerCase())
        : [...current, hobby]
      ).join(', ')
    );
  }

  async function save() {
    setBusy(true);
    setMessage('');

    try {
      const result = await api<HobbiesDto>('/profile/hobbies', {
        method: 'PUT',
        body: JSON.stringify({hobbies: value}),
      });

      setValue(result.hobbies ?? '');
      setMessage('Hobbies saved');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Unable to save hobbies');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ss-profile-card ss-m51-hobbies-editor">
      <div className="ss-m51-hobbies-head">
        <div>
          <span className="ss-profile-kicker">PERSONALITY & LIFESTYLE</span>
          <h2>Hobbies & interests</h2>
          <p>
            Help compatible members understand what you enjoy outside work and
            everyday responsibilities.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          disabled={busy}
          onClick={() => void save()}
        >
          {busy ? 'Saving…' : 'Save hobbies'}
        </button>
      </div>

      <div className="ss-m51-hobby-pills">
        {suggestions.map(hobby => {
          const active = selected.some(
            item => item.toLowerCase() === hobby.toLowerCase()
          );

          return (
            <button
              type="button"
              key={hobby}
              className={active ? 'active' : ''}
              onClick={() => toggle(hobby)}
            >
              {active ? '✓' : '+'} {hobby}
            </button>
          );
        })}
      </div>

      <label className="ss-profile-field ss-m51-hobby-custom">
        <span>Custom interests</span>
        <input
          value={value}
          maxLength={1000}
          onChange={event => setValue(event.target.value)}
          placeholder="Travel, cricket, Telugu movies, cooking, long drives…"
        />
        <small>Separate interests with commas.</small>
      </label>

      {message && <div className="ss-m51-hobby-message">{message}</div>}
    </section>
  );
}
