'use client';

import {FormEvent, useState} from 'react';
import {useRouter} from 'next/navigation';

const religions = ['Hindu', 'Christian', 'Muslim', 'Sikh', 'Jain', 'Buddhist', 'Other'];
const languages = ['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'English'];

export default function HomepageMatchFinder() {
  const router = useRouter();
  const [lookingFor, setLookingFor] = useState('Woman');
  const [minAge, setMinAge] = useState('23');
  const [maxAge, setMaxAge] = useState('30');
  const [religion, setReligion] = useState('');
  const [motherTongue, setMotherTongue] = useState('');
  const [country, setCountry] = useState('USA');

  function submit(event: FormEvent) {
    event.preventDefault();

    const preferences = {lookingFor, minAge, maxAge, religion, motherTongue, country};

    try {
      sessionStorage.setItem(
        'soulsync_public_match_preferences',
        JSON.stringify(preferences)
      );
    } catch {}

    const query = new URLSearchParams({
      intent: 'find-match',
      lookingFor,
      minAge,
      maxAge,
      country,
    });

    if (religion) query.set('religion', religion);
    if (motherTongue) query.set('motherTongue', motherTongue);

    router.push(`/register?${query.toString()}`);
  }

  return (
    <form className="ss-home3-finder" onSubmit={submit}>
      <div className="ss-home3-finder-head">
        <span>START YOUR SEARCH</span>
        <h2>Find profiles that fit your preferences</h2>
        <p>Choose a few basics now. You can refine everything after creating your profile.</p>
      </div>

      <div className="ss-home3-finder-grid">
        <label>
          <span>I&apos;m looking for</span>
          <select value={lookingFor} onChange={e => setLookingFor(e.target.value)}>
            <option>Woman</option>
            <option>Man</option>
          </select>
        </label>

        <div className="ss-home3-age">
          <span>Age</span>
          <div>
            <select value={minAge} onChange={e => setMinAge(e.target.value)}>
              {Array.from({length: 43}, (_, i) => i + 18).map(age => (
                <option key={age}>{age}</option>
              ))}
            </select>
            <b>to</b>
            <select value={maxAge} onChange={e => setMaxAge(e.target.value)}>
              {Array.from({length: 43}, (_, i) => i + 18).map(age => (
                <option key={age}>{age}</option>
              ))}
            </select>
          </div>
        </div>

        <label>
          <span>Religion</span>
          <select value={religion} onChange={e => setReligion(e.target.value)}>
            <option value="">Any</option>
            {religions.map(value => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label>
          <span>Mother tongue</span>
          <select value={motherTongue} onChange={e => setMotherTongue(e.target.value)}>
            <option value="">Any</option>
            {languages.map(value => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label className="ss-home3-country">
          <span>Living in</span>
          <select value={country} onChange={e => setCountry(e.target.value)}>
            <option>USA</option>
            <option>India</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>Australia</option>
          </select>
        </label>
      </div>

      <button className="ss-home3-find-btn" type="submit">
        <span>Show me compatible profiles</span><b>→</b>
      </button>

      <small>Free to create a profile. Your preferences remain editable.</small>
    </form>
  );
}
