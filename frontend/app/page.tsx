import Link from 'next/link';
import BackendWakeup from '@/components/BackendWakeup';

const profiles = [
  {name:'Ananya', age:26, city:'Austin', role:'Data Analyst', img:'/demo-profiles/demo-001.jpg', match:'94%'},
  {name:'Kavya', age:27, city:'Dallas', role:'Product Designer', img:'/demo-profiles/demo-002.jpg', match:'91%'},
  {name:'Sneha', age:25, city:'Richardson', role:'Software Engineer', img:'/demo-profiles/demo-003.jpg', match:'89%'},
  {name:'Meera', age:28, city:'Seattle', role:'Business Analyst', img:'/demo-profiles/demo-004.jpg', match:'88%'},
];

export default function Home(){
  return (
    <main className="ss-v2-home">
      <BackendWakeup />

      <nav className="ss-v2-nav">
        <Link href="/" className="ss-v2-brand">
          <span className="ss-v2-brand-mark">S</span>
          <span>SoulSync</span>
        </Link>

        <div className="ss-v2-nav-links">
          <a href="#discover">Discover</a>
          <a href="#how">How it works</a>
          <Link href="/premium">Premium</Link>
        </div>

        <div className="ss-v2-nav-actions">
          <Link href="/login" className="ss-v2-text-btn">Sign in</Link>
          <Link href="/register" className="ss-v2-primary">Join SoulSync</Link>
        </div>
      </nav>

      <section className="ss-v2-hero">
        <div className="ss-v2-hero-copy ss-v2-reveal">
          <span className="ss-v2-kicker">SERIOUS MATCHES. MODERN EXPERIENCE.</span>
          <h1>Meet someone who <em>feels like home.</em></h1>
          <p>
            Thoughtful profiles, meaningful compatibility and conversations
            that begin with mutual interest.
          </p>

          <div className="ss-v2-hero-actions">
            <Link href="/register" className="ss-v2-primary ss-v2-large">Create my profile</Link>
            <a href="#discover" className="ss-v2-secondary ss-v2-large">See how it works</a>
          </div>

          <div className="ss-v2-mini-proof">
            <span><b>✓</b> Private</span>
            <span><b>✓</b> Intentional</span>
            <span><b>✓</b> Compatibility-first</span>
          </div>
        </div>

        <div className="ss-v2-hero-visual ss-v2-reveal ss-v2-delay-1">
          <div className="ss-v2-orbit ss-v2-orbit-one"/>
          <div className="ss-v2-orbit ss-v2-orbit-two"/>

          <article className="ss-v2-main-profile">
            <img src="/demo-profiles/demo-001.jpg" alt="Fictional SoulSync demo profile" />
            <div className="ss-v2-profile-overlay">
              <div>
                <strong>Ananya, 26</strong>
                <span>Austin · Data Analyst</span>
              </div>
              <b>94% match</b>
            </div>
          </article>

          <article className="ss-v2-floating-card ss-v2-float-a">
            <img src="/demo-profiles/demo-002.jpg" alt="Fictional demo profile" />
            <div><strong>Kavya, 27</strong><span>Dallas</span></div>
          </article>

          <article className="ss-v2-floating-card ss-v2-float-b">
            <img src="/demo-profiles/demo-003.jpg" alt="Fictional demo profile" />
            <div><strong>Sneha, 25</strong><span>Richardson</span></div>
          </article>

          <div className="ss-v2-match-chip">
            <span>♥</span>
            <div><strong>New compatible match</strong><small>Based on your preferences</small></div>
          </div>
        </div>
      </section>

      <section className="ss-v2-trust-strip ss-v2-reveal">
        <div><span>01</span><strong>Build your profile</strong></div>
        <div><span>02</span><strong>Discover compatible people</strong></div>
        <div><span>03</span><strong>Connect when it’s mutual</strong></div>
      </section>

      <section className="ss-v2-discover" id="discover">
        <div className="ss-v2-section-heading ss-v2-reveal">
          <span className="ss-v2-kicker">DISCOVER</span>
          <h2>People, not endless forms.</h2>
          <p>Get the important details at a glance, then explore when someone catches your attention.</p>
        </div>

        <div className="ss-v2-profile-row">
          {profiles.map((p,i)=>(
            <article key={p.name} className={`ss-v2-profile-card ss-v2-reveal ss-v2-delay-${Math.min(i+1,3)}`}>
              <div className="ss-v2-card-photo">
                <img src={p.img} alt={`${p.name} fictional demo profile`} />
                <span>{p.match}</span>
              </div>
              <div className="ss-v2-card-body">
                <h3>{p.name}, {p.age}</h3>
                <p>{p.city} · {p.role}</p>
                <div className="ss-v2-card-tags">
                  <span>Verified</span>
                  <span>Active</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="ss-v2-demo-label">Fictional demo profiles shown for product preview.</p>
      </section>

      <section className="ss-v2-how" id="how">
        <div className="ss-v2-how-visual ss-v2-reveal">
          <div className="ss-v2-phone">
            <div className="ss-v2-phone-top">
              <span className="ss-v2-brand-mark">S</span>
              <strong>For you</strong>
              <span>♡</span>
            </div>
            <img src="/demo-profiles/demo-005.jpg" alt="Fictional SoulSync match preview" />
            <div className="ss-v2-phone-copy">
              <strong>Priya, 27</strong>
              <span>Plano · Product Analyst</span>
              <div><b>92% compatible</b><b>Recently active</b></div>
            </div>
          </div>
          <div className="ss-v2-heart-pop">♥</div>
        </div>

        <div className="ss-v2-how-copy ss-v2-reveal ss-v2-delay-1">
          <span className="ss-v2-kicker">HOW IT WORKS</span>
          <h2>Simple enough to enjoy.</h2>

          <div className="ss-v2-steps">
            <div><b>1</b><span><strong>Tell us about you</strong><small>Create a thoughtful profile in a few minutes.</small></span></div>
            <div><b>2</b><span><strong>Explore your matches</strong><small>Use preferences without making discovery feel like paperwork.</small></span></div>
            <div><b>3</b><span><strong>Start with mutual interest</strong><small>Conversations open when both people want to connect.</small></span></div>
          </div>

          <Link href="/register" className="ss-v2-primary">Start now</Link>
        </div>
      </section>

      <section className="ss-v2-safety ss-v2-reveal">
        <div>
          <span className="ss-v2-kicker">YOUR SPACE, YOUR RULES</span>
          <h2>Private when you want it. Open when you’re ready.</h2>
        </div>
        <div className="ss-v2-safety-cards">
          <article><span>◉</span><strong>Photo controls</strong><small>Choose who can see your photos.</small></article>
          <article><span>♡</span><strong>Mutual messaging</strong><small>Connect after interest is accepted.</small></article>
          <article><span>⌁</span><strong>Block & report</strong><small>Safety controls are always within reach.</small></article>
        </div>
      </section>

      <section className="ss-v2-cta ss-v2-reveal">
        <div>
          <span>READY WHEN YOU ARE</span>
          <h2>Your next chapter can start here.</h2>
        </div>
        <Link href="/register" className="ss-v2-primary ss-v2-large">Create my profile</Link>
      </section>

      <footer className="ss-v2-footer">
        <div className="ss-v2-brand">
          <span className="ss-v2-brand-mark">S</span>
          <span>SoulSync</span>
        </div>
        <span>Meaningful matches, built with intention.</span>
        <div><Link href="/login">Sign in</Link><Link href="/premium">Premium</Link></div>
      </footer>
    </main>
  );
}
