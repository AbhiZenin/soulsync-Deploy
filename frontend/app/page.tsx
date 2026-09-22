import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Build a thoughtful profile',
    text: 'Share the details that matter for a serious match — background, lifestyle, values, education, work and preferences.',
  },
  {
    number: '02',
    title: 'Discover compatible people',
    text: 'Browse recommendations and search with filters designed for intentional matchmaking rather than endless swiping.',
  },
  {
    number: '03',
    title: 'Connect when it is mutual',
    text: 'Express interest privately. Messaging becomes meaningful when a connection is accepted.',
  },
];

const trust = [
  {
    title: 'Privacy controls',
    text: 'Choose who can view your profile and photos, with blocking and reporting built into the experience.',
  },
  {
    title: 'Compatibility first',
    text: 'Partner preferences and profile details help make discovery more relevant.',
  },
  {
    title: 'Intentional communication',
    text: 'Interests, connections and messaging are structured around serious conversations.',
  },
];

export default function Home() {
  return (
    <main className="ss-home">
      <nav className="ss-home-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>SoulSync</span>
        </Link>

        <div className="ss-home-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#why-soulsync">Why SoulSync</a>
          <Link href="/premium">Premium</Link>
        </div>

        <div className="ss-home-nav-actions">
          <Link href="/login" className="ghost-btn">
            Sign in
          </Link>
          <Link href="/register" className="primary-btn">
            Create profile
          </Link>
        </div>
      </nav>

      <section className="ss-home-hero">
        <div className="ss-home-hero-copy">
          <span className="ss-home-eyebrow">
            MATRIMONY, DESIGNED WITH INTENTION
          </span>

          <h1>
            Meet someone who
            <em> fits your life.</em>
          </h1>

          <p>
            SoulSync helps people looking for serious relationships
            discover compatible profiles, express interest privately
            and build a connection at a comfortable pace.
          </p>

          <div className="ss-home-hero-actions">
            <Link href="/register" className="primary-btn ss-home-hero-primary">
              Start your profile
            </Link>
            <Link href="/login" className="secondary-btn">
              I already have an account
            </Link>
          </div>

          <div className="ss-home-trust-line">
            <span>✓ Profile privacy controls</span>
            <span>✓ Mutual-interest conversations</span>
            <span>✓ Compatibility-based discovery</span>
          </div>
        </div>

        <div className="ss-home-showcase" aria-label="SoulSync profile discovery preview">
          <div className="ss-home-showcase-top">
            <div>
              <span>SOULSYNC DISCOVERY</span>
              <strong>Thoughtful matches, clearly presented.</strong>
            </div>
            <div className="ss-home-showcase-heart">♡</div>
          </div>

          <div className="ss-home-profile-stage">
            <article className="ss-home-profile-card featured">
              <div className="ss-home-profile-photo ss-home-photo-one">
                <span>A</span>
                <div className="ss-home-match">94% compatibility</div>
              </div>
              <div className="ss-home-profile-info">
                <div>
                  <h3>Ananya, 26</h3>
                  <p>Austin, TX · Data Analyst</p>
                </div>
                <div className="ss-home-profile-tags">
                  <span>Telugu</span>
                  <span>Hindu</span>
                  <span>Family-oriented</span>
                </div>
              </div>
            </article>

            <article className="ss-home-profile-card secondary">
              <div className="ss-home-profile-photo ss-home-photo-two">
                <span>K</span>
              </div>
              <div className="ss-home-profile-info">
                <div>
                  <h3>Kavya, 27</h3>
                  <p>Dallas, TX · Product Designer</p>
                </div>
                <div className="ss-home-profile-tags">
                  <span>Travel</span>
                  <span>Music</span>
                </div>
              </div>
            </article>

            <div className="ss-home-search-float">
              <span>SEARCH MATCHES</span>
              <strong>Location · Education · Profession</strong>
              <div>
                <i />
                <p>Find profiles aligned with what matters to you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-home-proof">
        <div>
          <span>01</span>
          <strong>Serious profiles</strong>
          <p>Structured details instead of shallow swipe cards.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Private discovery</strong>
          <p>Control profile, photo and contact visibility.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Mutual connection</strong>
          <p>Conversations begin with clear intent.</p>
        </div>
        <div>
          <span>04</span>
          <strong>Premium discovery</strong>
          <p>Advanced filters and visibility tools when needed.</p>
        </div>
      </section>

      <section className="ss-home-section" id="how-it-works">
        <div className="ss-home-section-head">
          <div>
            <span className="ss-home-eyebrow">HOW IT WORKS</span>
            <h2>A clearer path from profile to conversation.</h2>
          </div>
          <p>
            SoulSync keeps the matchmaking journey simple while giving
            members enough depth to make informed choices.
          </p>
        </div>

        <div className="ss-home-steps">
          {steps.map(step => (
            <article key={step.number} className="ss-home-step">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ss-home-product-band" id="why-soulsync">
        <div className="ss-home-product-copy">
          <span className="ss-home-eyebrow">BUILT FOR SERIOUS MATCHES</span>
          <h2>More context. Better decisions. Less noise.</h2>
          <p>
            A matrimony platform should help you understand a person,
            not just scroll past a photo. SoulSync brings profile
            details, preferences, interests and privacy controls into
            one consistent experience.
          </p>

          <Link href="/register" className="secondary-btn">
            Build your profile
          </Link>
        </div>

        <div className="ss-home-product-demo">
          <div className="ss-home-detail-card">
            <div className="ss-home-detail-card-head">
              <div className="ss-home-mini-avatar">J</div>
              <div>
                <strong>Jahnavi Rao</strong>
                <span>Dallas, TX</span>
              </div>
              <b>92%</b>
            </div>

            <div className="ss-home-detail-grid">
              <div>
                <span>Education</span>
                <strong>Master&apos;s degree</strong>
              </div>
              <div>
                <span>Profession</span>
                <strong>Data Analyst</strong>
              </div>
              <div>
                <span>Mother tongue</span>
                <strong>Telugu</strong>
              </div>
              <div>
                <span>Lifestyle</span>
                <strong>Non-smoker</strong>
              </div>
            </div>

            <div className="ss-home-interest-preview">
              <span>INTERESTS</span>
              <div>
                <b>Travel</b>
                <b>Photography</b>
                <b>Music</b>
                <b>Cooking</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ss-home-section">
        <div className="ss-home-section-head">
          <div>
            <span className="ss-home-eyebrow">TRUST & CONTROL</span>
            <h2>Designed to feel personal, without giving up privacy.</h2>
          </div>
        </div>

        <div className="ss-home-trust-grid">
          {trust.map(item => (
            <article key={item.title}>
              <div className="ss-home-trust-icon">◇</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ss-home-premium">
        <div>
          <span className="ss-home-eyebrow">SOULSYNC PREMIUM</span>
          <h2>More discovery tools when you want them.</h2>
          <p>
            Upgrade for advanced search, profile visitors, enhanced
            discovery, contact visibility and Premium Plus features
            including profile boost and video-call access.
          </p>
        </div>

        <div className="ss-home-premium-actions">
          <Link href="/premium" className="ss-home-light-button">
            Explore plans
          </Link>
          <Link href="/register" className="ss-home-outline-light">
            Join SoulSync
          </Link>
        </div>
      </section>

      <footer className="ss-home-footer">
        <div>
          <Link href="/" className="brand">
            <span className="brand-mark">S</span>
            <span>SoulSync</span>
          </Link>
          <p>
            A modern matrimonial platform for meaningful,
            compatibility-focused connections.
          </p>
        </div>

        <div className="ss-home-footer-links">
          <div>
            <strong>Platform</strong>
            <Link href="/register">Create profile</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/premium">Premium</Link>
          </div>

          <div>
            <strong>Experience</strong>
            <a href="#how-it-works">How it works</a>
            <a href="#why-soulsync">Why SoulSync</a>
          </div>
        </div>

        <div className="ss-home-footer-bottom">
          <span>© 2026 SoulSync</span>
          <span>Meaningful matches, built with intention.</span>
        </div>
      </footer>
    </main>
  );
}
