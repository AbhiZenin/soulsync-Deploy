'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ProfileCard from '@/components/ProfileCard';
import SecureImage from '@/components/SecureImage';
import {api} from '@/lib/api';
import type {ProfileCard as Card,ProfileDetail,Interest} from '@/lib/types';

type PageResponse={content:Card[]};

export default function Dashboard(){
  const [me,setMe]=useState<ProfileDetail|null>(null);
  const [matches,setMatches]=useState<Card[]>([]);
  const [community,setCommunity]=useState<Card[]>([]);
  const [received,setReceived]=useState<Interest[]>([]);
  const [sent,setSent]=useState<Interest[]>([]);
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{
      const [profile,matchRows,communityPage,receivedRows,sentRows]=await Promise.all([
        api<ProfileDetail>('/profile/me'),
        api<Card[]>('/matches').catch(()=>[]),
        api<PageResponse>('/profiles?country=USA&size=12').catch(()=>({content:[]})),
        api<Interest[]>('/interests/received').catch(()=>[]),
        api<Interest[]>('/interests/sent').catch(()=>[]),
      ]);
      setMe(profile);
      setMatches(matchRows);
      setCommunity(communityPage.content ?? []);
      setReceived(receivedRows);
      setSent(sentRows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{void load()},[]);

  const pending=received.filter(x=>x.status==='PENDING').length;
  const connections=[...received,...sent].filter(x=>x.status==='ACCEPTED').length;
  const recentlyActive=useMemo(
    ()=>[...community]
      .sort((a,b)=>new Date(b.lastActiveAt??0).getTime()-new Date(a.lastActiveAt??0).getTime())
      .slice(0,4),
    [community]
  );
  const spotlight=(matches.length?matches:community).slice(0,4);
  const profileName=me?.displayName?.split(' ')[0] || 'there';
  const completion=me?.completionPercent ?? 0;

  return (
    <AppShell title={`Welcome back, ${profileName}`} subtitle="Your SoulSync home for thoughtful discovery, connections and conversations.">
      <div className="ss-real-dashboard">
        <section className="ss-real-dash-hero">
          <div className="ss-real-dash-hero-copy">
            <span className="ss-real-kicker">YOUR MATCHMAKING JOURNEY</span>
            <h2>Keep your profile strong and your discovery intentional.</h2>
            <p>
              Review compatible profiles, respond to new interests and keep your profile fresh
              so the right people can understand who you are.
            </p>

            <div className="ss-real-dash-actions">
              <Link href="/search" className="primary-btn">Search profiles</Link>
              <Link href="/profile" className="secondary-btn">Update my profile</Link>
            </div>
          </div>

          <div className="ss-real-dash-progress">
            <div className="ss-real-dash-progress-top">
              <span>PROFILE COMPLETION</span>
              <strong>{completion}%</strong>
            </div>
            <div className="ss-real-dash-progress-track"><span style={{width:`${Math.min(100,completion)}%`}}/></div>
            <p>
              {completion>=90
                ? 'Your profile is in great shape. Keep photos and details current.'
                : 'Complete more profile details to help members understand you better.'}
            </p>
            <Link href="/profile">Improve profile →</Link>
          </div>
        </section>

        <section className="ss-real-dash-stats">
          <div><span>Pending interests</span><strong>{pending}</strong><small>Waiting for your response</small></div>
          <div><span>Connections</span><strong>{connections}</strong><small>Accepted interests</small></div>
          <div><span>Recommended</span><strong>{matches.length}</strong><small>Compatibility-ranked profiles</small></div>
          <div><span>Explore</span><strong>{community.length}</strong><small>Profiles loaded today</small></div>
        </section>

        <section className="ss-real-dash-section">
          <div className="ss-real-dash-section-head">
            <div>
              <span className="ss-real-kicker">RECOMMENDED FOR YOU</span>
              <h2>Profiles worth a closer look</h2>
              <p>Based on your partner preferences and available compatibility signals.</p>
            </div>
            <Link href="/matches">View all matches →</Link>
          </div>

          {loading ? (
            <div className="ss-real-dash-loading">Loading recommendations…</div>
          ) : spotlight.length ? (
            <div className="profile-grid ss-real-dash-profile-grid">
              {spotlight.map(p=><ProfileCard key={p.userId} profile={p} onChanged={load}/>)}
            </div>
          ) : (
            <div className="empty">No recommendations yet. Complete your partner preferences or broaden your filters.</div>
          )}
        </section>

        <section className="ss-real-dash-split">
          <div className="ss-real-dash-section">
            <div className="ss-real-dash-section-head compact">
              <div>
                <span className="ss-real-kicker">RECENTLY ACTIVE</span>
                <h2>People exploring SoulSync now</h2>
              </div>
              <Link href="/search">Search more →</Link>
            </div>

            <div className="ss-real-active-list">
              {recentlyActive.map(p=>(
                <Link href={`/profile/${p.userId}`} key={p.userId} className="ss-real-active-row">
                  <div className="ss-real-active-photo">
                    {p.primaryPhoto
                      ? <SecureImage path={p.primaryPhoto} alt={p.displayName}/>
                      : <span>{p.displayName?.[0]}</span>}
                  </div>
                  <div>
                    <strong>{p.displayName}</strong>
                    <p>{[p.age&&`${p.age} yrs`,p.city,p.state].filter(Boolean).join(' · ')}</p>
                  </div>
                  <span className="ss-real-online-dot"/>
                </Link>
              ))}
              {!recentlyActive.length && !loading && <div className="empty">No recently active profiles yet.</div>}
            </div>
          </div>

          <aside className="ss-real-dash-side">
            <div className="ss-real-dash-side-card">
              <span className="ss-real-kicker">QUICK DISCOVERY</span>
              <h3>Find someone by what matters most.</h3>
              <p>Search by location and basic preferences, then refine further with Premium filters.</p>
              <Link href="/search" className="secondary-btn">Open profile search</Link>
            </div>

            <div className="ss-real-dash-side-card premium">
              <span>PREMIUM</span>
              <h3>See more of your discovery activity.</h3>
              <p>Unlock profile visitors, enhanced discovery and unlimited interests.</p>
              <Link href="/premium">Explore plans →</Link>
            </div>
          </aside>
        </section>

        <section className="ss-real-dash-journey">
          <div>
            <span>1</span>
            <strong>Discover</strong>
            <p>Browse compatible people.</p>
          </div>
          <div>
            <span>2</span>
            <strong>Express interest</strong>
            <p>Make your intention clear.</p>
          </div>
          <div>
            <span>3</span>
            <strong>Connect</strong>
            <p>Build a mutual conversation.</p>
          </div>
          <div>
            <span>4</span>
            <strong>Know each other</strong>
            <p>Move at a pace that feels right.</p>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
