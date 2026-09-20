'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

type PreferencesForm = {
  minAge: number | string | null;
  maxAge: number | string | null;
  minHeightCm: number | string | null;
  maxHeightCm: number | string | null;
  country: string;
  state: string;
  religion: string;
  motherTongue: string;
  education: string;
  occupation: string;
  diet: string;
};

const empty: PreferencesForm = {
  minAge: 21,
  maxAge: 35,
  minHeightCm: '',
  maxHeightCm: '',
  country: 'USA',
  state: 'Texas',
  religion: '',
  motherTongue: '',
  education: '',
  occupation: '',
  diet: '',
};

const religions = [
  '',
  'Hindu',
  'Christian',
  'Muslim',
  'Sikh',
  'Jain',
  'Buddhist',
  'Other',
];

const languages = [
  '',
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Bengali',
  'English',
  'Other',
];

const diets = [
  '',
  'Vegetarian',
  'Non-Vegetarian',
  'Eggetarian',
  'Vegan',
];

export default function Preferences() {
  const [form, setForm] = useState<PreferencesForm>(empty);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Partial<PreferencesForm>>('/preferences')
      .then(data => {
        setForm({ ...empty, ...data });
      })
      .catch(err => {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load your preferences.'
        );
      })
      .finally(() => setLoading(false));
  }, []);

  function set(key: keyof PreferencesForm, value: string) {
    setMsg('');
    setError('');
    setForm(current => ({
      ...current,
      [key]: value,
    }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    setError('');

    const minAge = form.minAge ? Number(form.minAge) : null;
    const maxAge = form.maxAge ? Number(form.maxAge) : null;
    const minHeight = form.minHeightCm
      ? Number(form.minHeightCm)
      : null;
    const maxHeight = form.maxHeightCm
      ? Number(form.maxHeightCm)
      : null;

    if (
      minAge !== null &&
      maxAge !== null &&
      minAge > maxAge
    ) {
      setError('Minimum age cannot be greater than maximum age.');
      return;
    }

    if (
      minHeight !== null &&
      maxHeight !== null &&
      minHeight > maxHeight
    ) {
      setError(
        'Minimum height cannot be greater than maximum height.'
      );
      return;
    }

    setSaving(true);

    try {
      const body = {
        ...form,
        minAge,
        maxAge,
        minHeightCm: minHeight,
        maxHeightCm: maxHeight,
      };

      await api('/preferences', {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      setMsg(
        'Preferences saved. Your recommendations have been updated.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save your preferences.'
      );
    } finally {
      setSaving(false);
    }
  }

  const preferenceCount = useMemo(() => {
    const optional = [
      form.minAge,
      form.maxAge,
      form.minHeightCm,
      form.maxHeightCm,
      form.country,
      form.state,
      form.religion,
      form.motherTongue,
      form.education,
      form.occupation,
      form.diet,
    ];

    return optional.filter(
      value => value !== '' && value !== null && value !== undefined
    ).length;
  }, [form]);

  if (loading) {
    return (
      <AppShell
        title="Partner preferences"
        subtitle="Define what matters most in your search."
      >
        <div className="ss-pref-loading">
          <div className="ss-pref-spinner" />
          <span>Loading your preferences...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Partner preferences"
      subtitle="Define what matters most to you. Leave anything blank when you're flexible."
    >
      <form className="ss-pref-page" onSubmit={save}>
        <section className="ss-pref-hero">
          <div className="ss-pref-hero-copy">
            <div className="ss-pref-kicker">
              YOUR IDEAL MATCH
            </div>

            <h2>What are you looking for?</h2>

            <p>
              Your preferences help SoulSync surface profiles that
              are more relevant to you. You can change these
              anytime.
            </p>

            <div className="ss-pref-tags">
              {form.minAge && form.maxAge && (
                <span>
                  ♡ {form.minAge}–{form.maxAge} years
                </span>
              )}

              {form.religion && (
                <span>✦ {form.religion}</span>
              )}

              {form.state && (
                <span>⌖ {form.state}</span>
              )}

              {form.motherTongue && (
                <span>◌ {form.motherTongue}</span>
              )}
            </div>
          </div>

          <div className="ss-pref-score">
            <div className="ss-pref-score-ring">
              <strong>{preferenceCount}</strong>
              <span>/ 11</span>
            </div>

            <div>
              <strong>Preferences added</strong>
              <span>
                More details can improve your recommendations.
              </span>
            </div>
          </div>
        </section>

        {msg && (
          <div className="ss-pref-message success">
            <span>✓</span>
            {msg}
          </div>
        )}

        {error && (
          <div className="ss-pref-message error">
            <span>!</span>
            {error}
          </div>
        )}

        <div className="ss-pref-layout">
          <div className="ss-pref-main">
            <PreferenceSection
              number="01"
              title="Age & height"
              subtitle="Choose the range you're comfortable with."
            >
              <div className="ss-pref-grid">
                <Field
                  label="Minimum age"
                  type="number"
                  min="18"
                  max="100"
                  value={form.minAge ?? ''}
                  onChange={v => set('minAge', v)}
                  suffix="years"
                />

                <Field
                  label="Maximum age"
                  type="number"
                  min="18"
                  max="100"
                  value={form.maxAge ?? ''}
                  onChange={v => set('maxAge', v)}
                  suffix="years"
                />

                <Field
                  label="Minimum height"
                  type="number"
                  min="100"
                  max="250"
                  value={form.minHeightCm ?? ''}
                  onChange={v => set('minHeightCm', v)}
                  placeholder="Flexible"
                  suffix="cm"
                />

                <Field
                  label="Maximum height"
                  type="number"
                  min="100"
                  max="250"
                  value={form.maxHeightCm ?? ''}
                  onChange={v => set('maxHeightCm', v)}
                  placeholder="Flexible"
                  suffix="cm"
                />
              </div>
            </PreferenceSection>

            <PreferenceSection
              number="02"
              title="Location"
              subtitle="Where would you prefer your partner to live?"
            >
              <div className="ss-pref-grid">
                <Field
                  label="Country"
                  value={form.country ?? ''}
                  onChange={v => set('country', v)}
                  placeholder="Any country"
                />

                <Field
                  label="State / region"
                  value={form.state ?? ''}
                  onChange={v => set('state', v)}
                  placeholder="Any state"
                />
              </div>
            </PreferenceSection>

            <PreferenceSection
              number="03"
              title="Community & background"
              subtitle="These fields are optional. Leave them open if they don't matter to you."
            >
              <div className="ss-pref-grid">
                <SelectField
                  label="Religion"
                  value={form.religion ?? ''}
                  options={religions}
                  flexibleLabel="Any religion"
                  onChange={v => set('religion', v)}
                />

                <SelectField
                  label="Mother tongue"
                  value={form.motherTongue ?? ''}
                  options={languages}
                  flexibleLabel="Any language"
                  onChange={v => set('motherTongue', v)}
                />
              </div>
            </PreferenceSection>

            <PreferenceSection
              number="04"
              title="Education & career"
              subtitle="Tell us about the professional background you prefer."
            >
              <div className="ss-pref-grid">
                <Field
                  label="Education"
                  value={form.education ?? ''}
                  onChange={v => set('education', v)}
                  placeholder="No preference"
                />

                <Field
                  label="Occupation"
                  value={form.occupation ?? ''}
                  onChange={v => set('occupation', v)}
                  placeholder="No preference"
                />
              </div>
            </PreferenceSection>

            <PreferenceSection
              number="05"
              title="Lifestyle"
              subtitle="Lifestyle compatibility can be important for long-term relationships."
            >
              <div className="ss-pref-grid one">
                <SelectField
                  label="Diet preference"
                  value={form.diet ?? ''}
                  options={diets}
                  flexibleLabel="Any diet"
                  onChange={v => set('diet', v)}
                />
              </div>
            </PreferenceSection>
          </div>

          <aside className="ss-pref-sidebar">
            <div className="ss-pref-summary">
              <div className="ss-pref-summary-icon">
                ♡
              </div>

              <h3>Your preference summary</h3>

              <p>
                Blank preferences stay flexible and won't exclude
                profiles from your search.
              </p>

              <div className="ss-pref-summary-list">
                <Summary
                  label="Age"
                  value={
                    form.minAge || form.maxAge
                      ? `${form.minAge || 'Any'} – ${
                          form.maxAge || 'Any'
                        }`
                      : 'Flexible'
                  }
                />

                <Summary
                  label="Height"
                  value={
                    form.minHeightCm || form.maxHeightCm
                      ? `${form.minHeightCm || 'Any'} – ${
                          form.maxHeightCm || 'Any'
                        } cm`
                      : 'Flexible'
                  }
                />

                <Summary
                  label="Location"
                  value={
                    [form.state, form.country]
                      .filter(Boolean)
                      .join(', ') || 'Flexible'
                  }
                />

                <Summary
                  label="Religion"
                  value={form.religion || 'Flexible'}
                />

                <Summary
                  label="Language"
                  value={form.motherTongue || 'Flexible'}
                />

                <Summary
                  label="Education"
                  value={form.education || 'Flexible'}
                />

                <Summary
                  label="Occupation"
                  value={form.occupation || 'Flexible'}
                />

                <Summary
                  label="Diet"
                  value={form.diet || 'Flexible'}
                />
              </div>

              <button
                className="primary-btn ss-pref-save"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save preferences'}
              </button>
            </div>

            <div className="ss-pref-tip">
              <span>✦</span>

              <div>
                <strong>Keep an open mind</strong>
                <p>
                  Fewer strict preferences can help you discover
                  compatible people you may not have considered.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="ss-pref-mobile-save">
          <div>
            <strong>Partner preferences</strong>
            <span>{preferenceCount} of 11 added</span>
          </div>

          <button
            className="primary-btn"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function PreferenceSection({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ss-pref-section">
      <div className="ss-pref-section-head">
        <span>{number}</span>

        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
  min,
  max,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="ss-pref-field">
      <span>{label}</span>

      <div className="ss-pref-input-wrap">
        <input
          type={type}
          min={min}
          max={max}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
        />

        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  flexibleLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  flexibleLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="ss-pref-field">
      <span>{label}</span>

      <div className="ss-pref-select-wrap">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {options.map(option => (
            <option key={option || 'flexible'} value={option}>
              {option || flexibleLabel}
            </option>
          ))}
        </select>

        <span>⌄</span>
      </div>
    </label>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="ss-pref-summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
