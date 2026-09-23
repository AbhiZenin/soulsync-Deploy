'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import SecureImage from '@/components/SecureImage';
import HobbiesEditor from '@/components/HobbiesEditor';
import { api } from '@/lib/api';
import type { ProfileDetail } from '@/lib/types';

const empty = {
  displayName: '',
  dateOfBirth: '',
  gender: '',
  heightCm: '',
  maritalStatus: '',
  motherTongue: '',
  religion: '',
  community: '',
  country: '',
  state: '',
  city: '',
  education: '',
  occupation: '',
  incomeRange: '',
  diet: '',
  smoking: '',
  drinking: '',
  about: '',
  profileCreatedBy: '',
  visibility: 'PUBLIC'
};

export default function Profile() {
  const [form, setForm] = useState<any>(empty);
  const [photos, setPhotos] = useState<ProfileDetail['photos']>([]);
  const [completion, setCompletion] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [photoError, setPhotoError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ProfileDetail>('/profile/me')
      .then(p => {
        applyProfile(p);
      })
      .catch(e => {
        setMsgType('error');
        setMsg(e instanceof Error ? e.message : 'Unable to load profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  function applyProfile(profile: ProfileDetail) {
    setForm({
      ...empty,
      ...profile,
      dateOfBirth: profile.dateOfBirth ?? '',
      heightCm: profile.heightCm ?? ''
    });
    setPhotos(profile.photos ?? []);
    setCompletion(profile.completionPercent ?? 0);
    setEmailVerified(Boolean(profile.emailVerified));
  }

  function set(key: string, value: any) {
    setForm((current: any) => ({
      ...current,
      [key]: value
    }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg('');
    setSaving(true);

    try {
      const body = {
        ...form,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        age: undefined,
        photos: undefined,
        userId: undefined,
        completionPercent: undefined,
        lastActiveAt: undefined,
        primaryPhoto: undefined,
        matchScore: undefined,
        emailVerified: undefined
      };

      const profile = await api<ProfileDetail>('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      applyProfile(profile);
      setMsgType('success');
      setMsg(`Profile saved. You're ${profile.completionPercent}% complete.`);
    } catch (e) {
      setMsgType('error');
      setMsg(e instanceof Error ? e.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function refreshPhotos() {
    const profile = await api<ProfileDetail>('/profile/me');
    applyProfile(profile);
  }

  async function upload(file: File) {
    setPhotoError('');

    if (photos.length >= 6) {
      setPhotoError('You can upload a maximum of 6 photos.');
      return;
    }

    try {
      setPhotoBusy(true);

      const formData = new FormData();
      formData.append('file', file);

      await api('/photos', {
        method: 'POST',
        body: formData
      });

      await refreshPhotos();
    } catch (e) {
      setPhotoError(
        e instanceof Error ? e.message : 'Unable to upload photo.'
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  async function primary(id: string) {
    try {
      setPhotoError('');
      setPhotoBusy(true);

      await api(`/photos/${id}/primary`, {
        method: 'PATCH'
      });

      await refreshPhotos();
    } catch (e) {
      setPhotoError(
        e instanceof Error ? e.message : 'Unable to set primary photo.'
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this photo?')) return;

    try {
      setPhotoError('');
      setPhotoBusy(true);

      await api(`/photos/${id}`, {
        method: 'DELETE'
      });

      await refreshPhotos();
    } catch (e) {
      setPhotoError(
        e instanceof Error ? e.message : 'Unable to delete photo.'
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  async function changePhotoVisibility(id: string, visibility: string) {
    try {
      setPhotoError('');
      setPhotoBusy(true);

      await api(
        `/photos/${id}/visibility?visibility=${encodeURIComponent(visibility)}`,
        { method: 'PATCH' }
      );

      await refreshPhotos();
    } catch (e) {
      setPhotoError(
        e instanceof Error
          ? e.message
          : 'Unable to update photo visibility.'
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= photos.length) return;

    const reordered = [...photos];

    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index]
    ];

    try {
      setPhotoError('');
      setPhotoBusy(true);

      const updated = await api<ProfileDetail['photos']>(
        '/photos/reorder',
        {
          method: 'PATCH',
          body: JSON.stringify({
            photoIds: reordered.map(photo => photo.id)
          })
        }
      );

      setPhotos(updated);
    } catch (e) {
      setPhotoError(
        e instanceof Error ? e.message : 'Unable to reorder photos.'
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  const primaryPhoto = useMemo(
    () => photos.find(photo => photo.primary) ?? photos[0],
    [photos]
  );

  const location = [form.city, form.state, form.country]
    .filter(Boolean)
    .join(', ');

  const headline = [form.occupation, form.education]
    .filter(Boolean)
    .join(' · ');

  if (loading) {
    return (
      <AppShell title="My profile" subtitle="Build a profile that feels like you.">
        <div className="ss-profile-loading">
          <div className="spinner" />
          <span>Loading your profile...</span>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="My profile"
      subtitle="Create a profile that helps the right person understand who you are."
    >
      <form className="ss-profile-page" onSubmit={save}>

        <section className="ss-profile-hero">
          <div className="ss-profile-hero-photo">
            {primaryPhoto ? (
              <SecureImage
                path={primaryPhoto.url}
                alt={form.displayName || 'Profile photo'}
              />
            ) : (
              <div className="ss-profile-avatar-placeholder">
                {(form.displayName || 'S').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="ss-profile-hero-copy">
            <div className="ss-profile-kicker">YOUR MATRIMONY PROFILE</div>

            <div className="ss-profile-name-row">
              <h2>{form.displayName || 'Complete your profile'}</h2>

              {emailVerified && (
                <span
                  className="ss-profile-verified"
                  title="Email verified"
                >
                  ✓
                </span>
              )}
            </div>

            {headline && (
              <p className="ss-profile-headline">{headline}</p>
            )}

            {location && (
              <p className="ss-profile-location">⌖ {location}</p>
            )}

            <div className="ss-profile-quick-facts">
              {form.age && <span>{form.age} yrs</span>}
              {form.heightCm && <span>{form.heightCm} cm</span>}
              {form.religion && <span>{form.religion}</span>}
              {form.motherTongue && <span>{form.motherTongue}</span>}
            </div>
          </div>

          <div className="ss-profile-completion">
            <div className="ss-profile-completion-top">
              <span>Profile strength</span>
              <strong>{completion}%</strong>
            </div>

            <div className="ss-profile-progress">
              <span style={{ width: `${Math.min(completion, 100)}%` }} />
            </div>

            <p>
              {completion >= 90
                ? 'Your profile is looking great.'
                : 'Complete more details to help compatible matches understand you better.'}
            </p>

            <button
              className="primary-btn ss-profile-save-top"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </section>

        {msg && (
          <div className={`ss-profile-message ${msgType}`}>
            {msg}
          </div>
        )}

        <section className="ss-profile-card ss-profile-photo-section">
          <SectionHeader
            eyebrow="PHOTOS"
            title="Your photo gallery"
            description="Add photos that represent you naturally. Choose a primary photo and control who can see each image."
          />

          <div className="ss-profile-photo-summary">
            <strong>{photos.length}/6 photos</strong>
            <span>JPEG, PNG or WebP · up to 10 MB</span>
          </div>

          {photoError && (
            <div className="ss-profile-message error">
              {photoError}
            </div>
          )}

          <div className="ss-profile-gallery">
            {photos.map((photo, index) => (
              <article
                className={`ss-profile-photo-card ${
                  photo.primary ? 'is-primary' : ''
                }`}
                key={photo.id}
              >
                <div className="ss-profile-photo-image">
                  <SecureImage
                    path={photo.url}
                    alt={`Profile photo ${index + 1}`}
                  />

                  {photo.primary && (
                    <span className="ss-profile-primary-badge">
                      ★ Primary
                    </span>
                  )}

                  <span className="ss-profile-photo-number">
                    {index + 1}
                  </span>
                </div>

                <div className="ss-profile-photo-actions">
                  <button
                    type="button"
                    className="ss-profile-small-button"
                    disabled={photo.primary || photoBusy}
                    onClick={() => primary(photo.id)}
                  >
                    {photo.primary ? 'Primary photo' : 'Make primary'}
                  </button>

                  <div className="ss-profile-order-buttons">
                    <button
                      type="button"
                      title="Move left"
                      disabled={index === 0 || photoBusy}
                      onClick={() => movePhoto(index, -1)}
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      title="Move right"
                      disabled={index === photos.length - 1 || photoBusy}
                      onClick={() => movePhoto(index, 1)}
                    >
                      →
                    </button>
                  </div>
                </div>

                <label className="ss-profile-photo-visibility">
                  <span>Photo visibility</span>
                  <select
                    value={photo.visibility}
                    disabled={photoBusy}
                    onChange={e =>
                      changePhotoVisibility(photo.id, e.target.value)
                    }
                  >
                    <option value="PUBLIC">Everyone</option>
                    <option value="CONNECTIONS">Connections only</option>
                    <option value="PRIVATE">Only me</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="ss-profile-delete-photo"
                  disabled={photoBusy}
                  onClick={() => remove(photo.id)}
                >
                  Delete photo
                </button>
              </article>
            ))}

            {photos.length < 6 && (
              <label
                className={`ss-profile-add-photo ${
                  photoBusy ? 'disabled' : ''
                }`}
              >
                <span className="ss-profile-add-icon">＋</span>
                <strong>{photoBusy ? 'Working...' : 'Add a photo'}</strong>
                <small>
                  {photos.length
                    ? `${6 - photos.length} spots remaining`
                    : 'Start with a clear primary photo'}
                </small>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  disabled={photoBusy}
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) await upload(file);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
        </section>

        <section className="ss-profile-card">
          <SectionHeader
            eyebrow="INTRODUCTION"
            title="About me"
            description="Write a warm introduction that gives potential matches a sense of your personality, values and interests."
          />

          <label className="ss-profile-about">
            <textarea
              maxLength={3000}
              value={form.about ?? ''}
              placeholder="Share a little about yourself, your interests, values, career, family and what matters to you..."
              onChange={e => set('about', e.target.value)}
            />
            <span>{(form.about ?? '').length}/3000</span>
          </label>
        </section>

        <div className="ss-profile-section-grid">

          <section className="ss-profile-card">
            <SectionHeader
              eyebrow="PERSONAL"
              title="Basic details"
              description="The essentials people usually look for first."
            />

            <div className="ss-profile-fields">
              <Field
                label="Display name"
                value={form.displayName}
                onChange={v => set('displayName', v)}
              />

              <Field
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={v => set('dateOfBirth', v)}
              />

              <Select
                label="Gender"
                value={form.gender ?? ''}
                onChange={v => set('gender', v)}
                options={[
                  '',
                  'MALE',
                  'FEMALE',
                  'NON_BINARY',
                  'OTHER'
                ]}
              />

              <Field
                label="Height (cm)"
                type="number"
                value={form.heightCm ?? ''}
                onChange={v => set('heightCm', v)}
              />

              <Field
                label="Marital status"
                value={form.maritalStatus ?? ''}
                onChange={v => set('maritalStatus', v)}
              />

              <Field
                label="Profile created by"
                value={form.profileCreatedBy ?? ''}
                onChange={v => set('profileCreatedBy', v)}
              />
            </div>
          </section>

          <section className="ss-profile-card">
            <SectionHeader
              eyebrow="BACKGROUND"
              title="Religion & community"
              description="Share the cultural details that are important to you."
            />

            <div className="ss-profile-fields">
              <Field
                label="Religion"
                value={form.religion ?? ''}
                onChange={v => set('religion', v)}
              />

              <Field
                label="Community"
                value={form.community ?? ''}
                onChange={v => set('community', v)}
              />

              <Field
                label="Mother tongue"
                value={form.motherTongue ?? ''}
                onChange={v => set('motherTongue', v)}
              />
            </div>
          </section>

          <section className="ss-profile-card">
            <SectionHeader
              eyebrow="CAREER"
              title="Education & career"
              description="Tell matches about your professional and academic journey."
            />

            <div className="ss-profile-fields">
              <Field
                label="Education"
                value={form.education ?? ''}
                onChange={v => set('education', v)}
              />

              <Field
                label="Occupation"
                value={form.occupation ?? ''}
                onChange={v => set('occupation', v)}
              />

              <Field
                label="Income range"
                value={form.incomeRange ?? ''}
                onChange={v => set('incomeRange', v)}
              />
            </div>
          </section>

          <section className="ss-profile-card">
            <SectionHeader
              eyebrow="LOCATION"
              title="Where I live"
              description="Your location helps us surface more relevant matches."
            />

            <div className="ss-profile-fields">
              <Field
                label="Country"
                value={form.country ?? ''}
                onChange={v => set('country', v)}
              />

              <Field
                label="State"
                value={form.state ?? ''}
                onChange={v => set('state', v)}
              />

              <Field
                label="City"
                value={form.city ?? ''}
                onChange={v => set('city', v)}
              />
            </div>
          </section>

          <section className="ss-profile-card">
            <SectionHeader
              eyebrow="LIFESTYLE"
              title="Lifestyle"
              description="A few everyday preferences can make compatibility easier to understand."
            />

            <div className="ss-profile-fields">
              <Field
                label="Diet"
                value={form.diet ?? ''}
                onChange={v => set('diet', v)}
              />

              <Field
                label="Smoking"
                value={form.smoking ?? ''}
                onChange={v => set('smoking', v)}
              />

              <Field
                label="Drinking"
                value={form.drinking ?? ''}
                onChange={v => set('drinking', v)}
              />
            </div>
          </section>

          <HobbiesEditor />

          <section className="ss-profile-card ss-profile-privacy-card">
            <SectionHeader
              eyebrow="PRIVACY"
              title="Profile visibility"
              description="You stay in control of who can discover your profile."
            />

            <Select
              label="Who can discover my profile?"
              value={form.visibility ?? 'PUBLIC'}
              onChange={v => set('visibility', v)}
              options={['PUBLIC', 'MEMBERS', 'HIDDEN']}
              labels={{
                PUBLIC: 'Everyone',
                MEMBERS: 'SoulSync members',
                HIDDEN: 'Hidden'
              }}
            />

            <div className="ss-profile-privacy-note">
              <span>⌾</span>
              <p>
                Photo privacy is managed separately for each image in your
                gallery.
              </p>
            </div>
          </section>
        </div>

        <section className="ss-profile-save-bar">
          <div>
            <strong>Ready to update your profile?</strong>
            <span>
              Your changes become part of the profile other members see.
            </span>
          </div>

          <button
            className="primary-btn"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving profile...' : 'Save profile'}
          </button>
        </section>

      </form>
    </AppShell>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="ss-profile-section-head">
      <span>{eyebrow}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text'
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="ss-profile-field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels = {}
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="ss-profile-field">
      <span>{label}</span>

      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option || 'blank'} value={option}>
            {option ? labels[option] ?? pretty(option) : 'Select'}
          </option>
        ))}
      </select>
    </label>
  );
}

function pretty(value: string) {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
