'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import ProfileCard from '@/components/ProfileCard';
import { api } from '@/lib/api';
import type { ProfileCard as Card } from '@/lib/types';

type Filters = {
  minAge: string;
  maxAge: string;
  country: string;
  state: string;
  city: string;
  religion: string;
  motherTongue: string;
  education: string;
  occupation: string;
  gender: string;
};

const defaults: Filters = {
  minAge: '',
  maxAge: '',
  country: 'USA',
  state: 'Texas',
  city: '',
  religion: '',
  motherTongue: '',
  education: '',
  occupation: '',
  gender: '',
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

export default function Search() {
  const [premiumCanUseAdvancedSearch, setPremiumCanUseAdvancedSearch] =
    useState(false);
  const [premiumSubscriptionReady, setPremiumSubscriptionReady] =
    useState(false);

  useEffect(() => {
    let active = true;

    api<{ entitlements: string[] }>('/subscriptions/me')
      .then(subscription => {
        if (!active) return;
        setPremiumCanUseAdvancedSearch(
          subscription.entitlements.includes('ADVANCED_SEARCH')
        );
      })
      .catch(() => {
        if (active) setPremiumCanUseAdvancedSearch(false);
      })
      .finally(() => {
        if (active) setPremiumSubscriptionReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const [filters, setFilters] = useState<Filters>(defaults);
  const [rows, setRows] = useState<Card[]>([]);
  const [searched, setSearched] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function field(key: keyof Filters, value: string) {
    setFilters(current => ({
      ...current,
      [key]: value,
    }));
  }

  async function search(e?: FormEvent) {
    e?.preventDefault();
    setError('');

    const minAge = filters.minAge
      ? Number(filters.minAge)
      : null;

    const maxAge = filters.maxAge
      ? Number(filters.maxAge)
      : null;

    if (
      minAge !== null &&
      maxAge !== null &&
      minAge > maxAge
    ) {
      setError(
        'Minimum age cannot be greater than maximum age.'
      );
      return;
    }

    const q = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) {
        q.set(key, value.trim());
      }
    });

    setLoading(true);

    try {
      const result = await api<{ content: Card[] }>(
        `/profiles?${q.toString()}`
      );

      setRows(result.content ?? []);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to search profiles.'
      );
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setFilters({
      minAge: '',
      maxAge: '',
      country: '',
      state: '',
      city: '',
      religion: '',
      motherTongue: '',
      education: '',
      occupation: '',
      gender: '',
    });

    setRows([]);
    setSearched(false);
    setError('');
  }

  const activeFilters = useMemo(() => {
    const result: {
      key: keyof Filters;
      label: string;
    }[] = [];

    if (filters.minAge || filters.maxAge) {
      result.push({
        key: 'minAge',
        label: `Age ${filters.minAge || 'Any'}–${
          filters.maxAge || 'Any'
        }`,
      });
    }

    if (filters.gender) {
      result.push({
        key: 'gender',
        label: pretty(filters.gender),
      });
    }

    if (filters.religion) {
      result.push({
        key: 'religion',
        label: filters.religion,
      });
    }

    if (filters.motherTongue) {
      result.push({
        key: 'motherTongue',
        label: filters.motherTongue,
      });
    }

    if (filters.city) {
      result.push({
        key: 'city',
        label: filters.city,
      });
    }

    if (filters.state) {
      result.push({
        key: 'state',
        label: filters.state,
      });
    }

    if (filters.country) {
      result.push({
        key: 'country',
        label: filters.country,
      });
    }

    if (filters.education) {
      result.push({
        key: 'education',
        label: filters.education,
      });
    }

    if (filters.occupation) {
      result.push({
        key: 'occupation',
        label: filters.occupation,
      });
    }

    return result;
  }, [filters]);

  function removeFilter(key: keyof Filters) {
    if (key === 'minAge') {
      setFilters(current => ({
        ...current,
        minAge: '',
        maxAge: '',
      }));
      return;
    }

    field(key, '');
  }

  return (
    <AppShell
      title="Search profiles"
      subtitle="Discover people who align with the things that matter most to you."
    >
      <div className="ss-search-page">
        <section className="ss-search-hero">
          <div className="ss-search-hero-copy">
            <div className="ss-search-kicker">
              DISCOVER SOMEONE SPECIAL
            </div>

            <h2>Find profiles your way.</h2>

            <p>
              Search the SoulSync community using the preferences
              that matter to you. Keep filters open to discover
              more possibilities.
            </p>
          </div>

          <div className="ss-search-heart">
            ♡
          </div>
        </section>

        <form
          className="ss-search-filter-card"
          onSubmit={search}
        >
          <div className="ss-search-filter-head">
            <div>
              <span>PROFILE SEARCH</span>
              <h3>Who are you looking for?</h3>
            </div>

            {activeFilters.length > 0 && (
              <button
                type="button"
                className="ss-search-clear"
                onClick={clearAll}
              >
                Clear all
              </button>
            )}
          </div>

          <div className="ss-search-primary-filters">
            <div className="ss-search-age">
              <label>Age range</label>

              <div>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.minAge}
                  onChange={e =>
                    field('minAge', e.target.value)
                  }
                  placeholder="Min"
                />

                <span>to</span>

                <input
                  type="number"
                  min="18"
                  max="100"
                  value={filters.maxAge}
                  onChange={e =>
                    field('maxAge', e.target.value)
                  }
                  placeholder="Max"
                />
              </div>
            </div>

            <SelectField
              label="Looking for"
              value={filters.gender}
              onChange={value => field('gender', value)}
            >
              <option value="">Anyone</option>
              <option value="MALE">Man</option>
              <option value="FEMALE">Woman</option>
              <option value="NON_BINARY">Non-binary</option>
            </SelectField>

            <SelectField
              label="Religion"
              value={filters.religion}
              onChange={value => field('religion', value)}
            >
              {religions.map(value => (
                <option
                  key={value || 'any'}
                  value={value}
                >
                  {value || 'Any religion'}
                </option>
              ))}
            </SelectField>

            <Field
              label="Location"
              value={filters.state}
              onChange={value => field('state', value)}
              placeholder="Any state"
            />

            <button
              type="submit"
              className="primary-btn ss-search-submit"
              disabled={loading}
            >
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <span>⌕</span>
                  Find matches
                </>
              )}
            </button>
          </div>

          <div className="ss-search-filter-footer">
            <button
              type="button"
              className="ss-search-more"
              onClick={() => setAdvanced(value => !value)}
            >
              <span>☷</span>
              {advanced
                ? 'Hide advanced filters'
                : 'More filters'}
              <b>{advanced ? '⌃' : '⌄'}</b>
            </button>

            <p>
              Blank fields are treated as flexible.
            </p>
          </div>

          {advanced && (
            premiumCanUseAdvancedSearch ? (
<div className="ss-search-advanced">
              <Field
                label="Country"
                value={filters.country}
                onChange={value => field('country', value)}
                placeholder="Any country"
              />

              <Field
                label="City"
                value={filters.city}
                onChange={value => field('city', value)}
                placeholder="Any city"
              />

              <SelectField
                label="Mother tongue"
                value={filters.motherTongue}
                onChange={value =>
                  field('motherTongue', value)
                }
              >
                {languages.map(value => (
                  <option
                    key={value || 'any'}
                    value={value}
                  >
                    {value || 'Any language'}
                  </option>
                ))}
              </SelectField>

              <Field
                label="Education"
                value={filters.education}
                onChange={value =>
                  field('education', value)
                }
                placeholder="Any education"
              />

              <Field
                label="Occupation"
                value={filters.occupation}
                onChange={value =>
                  field('occupation', value)
                }
                placeholder="Any occupation"
              />
            </div>
            ) : (
              <div className="ss-premium-search-lock">
                <span className="ss-premium-lock-badge">PREMIUM</span>
                <h3>Unlock advanced search</h3>
                <p>
                  Religion, mother tongue, education, occupation, and
                  height filters are available with SoulSync Premium.
                </p>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    window.location.href = '/premium';
                  }}
                  disabled={!premiumSubscriptionReady}
                >
                  View Premium plans
                </button>
              </div>
            )
          )}
        </form>

        {error && (
          <div className="ss-search-error">
            <span>!</span>
            {error}
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="ss-search-active">
            <span className="ss-search-active-label">
              Active filters
            </span>

            <div>
              {activeFilters.map(filter => (
                <button
                  type="button"
                  key={`${filter.key}-${filter.label}`}
                  onClick={() =>
                    removeFilter(filter.key)
                  }
                >
                  {filter.label}
                  <span>×</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <SearchLoading />
        ) : searched ? (
          <section className="ss-search-results">
            <div className="ss-search-results-head">
              <div>
                <span className="ss-search-kicker">
                  SEARCH RESULTS
                </span>

                <h2>
                  {rows.length
                    ? `${rows.length} ${
                        rows.length === 1
                          ? 'profile'
                          : 'profiles'
                      } found`
                    : 'No profiles found'}
                </h2>
              </div>

              {rows.length > 0 && (
                <span className="ss-search-result-note">
                  Based on your selected filters
                </span>
              )}
            </div>

            {rows.length ? (
              <div className="profile-grid ss-search-grid">
                {rows.map(profile => (
                  <ProfileCard
                    key={profile.userId}
                    profile={profile}
                  />
                ))}
              </div>
            ) : (
              <div className="ss-search-empty">
                <div>⌕</div>

                <h3>No matches for these filters</h3>

                <p>
                  Try widening your age range, location or
                  community preferences to discover more people.
                </p>

                <button
                  type="button"
                  className="ss-search-empty-button"
                  onClick={clearAll}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className="ss-search-start">
            <div className="ss-search-start-icon">
              ♡
            </div>

            <div>
              <span className="ss-search-kicker">
                START DISCOVERING
              </span>

              <h2>Your next connection could be here.</h2>

              <p>
                Choose a few preferences above and search the
                SoulSync community. You can be as specific or as
                flexible as you like.
              </p>
            </div>

            <div className="ss-search-start-tips">
              <span>
                <b>01</b>
                Set an age range
              </span>

              <span>
                <b>02</b>
                Choose what matters
              </span>

              <span>
                <b>03</b>
                Discover profiles
              </span>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="ss-search-field">
      <span>{label}</span>

      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="ss-search-field">
      <span>{label}</span>

      <div className="ss-search-select">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {children}
        </select>

        <b>⌄</b>
      </div>
    </label>
  );
}

function SearchLoading() {
  return (
    <div className="ss-search-loading">
      <span />
      <div>
        <strong>Finding profiles...</strong>
        <p>
          Searching SoulSync using your preferences.
        </p>
      </div>
    </div>
  );
}

function pretty(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
