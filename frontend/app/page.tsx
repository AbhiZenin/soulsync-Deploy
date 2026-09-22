import Link from 'next/link';

const demoProfiles = [
  {name:'Ananya Reddy',age:26,city:'Austin, TX',job:'Data Analyst',img:'/demo-profiles/demo-001.jpg',match:'94%'},
  {name:'Kavya Nair',age:27,city:'Dallas, TX',job:'Product Designer',img:'/demo-profiles/demo-002.jpg',match:'91%'},
  {name:'Sneha Iyer',age:25,city:'Richardson, TX',job:'Software Engineer',img:'/demo-profiles/demo-003.jpg',match:'89%'},
  {name:'Meera Sharma',age:28,city:'Seattle, WA',job:'Business Analyst',img:'/demo-profiles/demo-004.jpg',match:'88%'},
];

const reviews = [
  {name:'Aarav',city:'Dallas',img:'/demo-profiles/demo-009.jpg',text:'I like that SoulSync gives enough profile detail to understand someone before starting a conversation.'},
  {name:'Nisha',city:'Austin',img:'/demo-profiles/demo-010.jpg',text:'The privacy controls and mutual-interest flow make the experience feel more intentional.'},
  {name:'Kiran',city:'Seattle',img:'/demo-profiles/demo-011.jpg',text:'Search and compatibility details make it easier to focus on profiles that actually fit my preferences.'},
];

export default function Home(){
  return (
    <main className="ss-real-home">
      <nav className="ss-real-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>SoulSync</span>
        </Link>

        <div className="ss-real-nav-center">
          <a href="#discover">Discover</a>
          <a href="#how">How it works</a>
          <a href="#stories">Member voices</a>
          <Link href="/premium">Premium</Link>
        </div>

        <div className="ss-real-nav-actions">
          <Link href="/login" className="ghost-btn">Sign in</Link>
          <Link href="/register" className="primary-btn">Create profile</Link>
        </div>
      </nav>

      <section className="ss-real-hero">
        <div className="ss-real-hero-copy">
          <span className="ss-real-kicker">MODERN MATRIMONY, BUILT FOR SERIOUS INTENT</span>
          <h1>Find a match who feels right for your life.</h1>
          <p>
            Discover thoughtful profiles, compare compatibility, express interest privately,
            and build meaningful conversations when the connection is mutual.
          </p>

          <div className="ss-real-hero-actions">
            <Link href="/register" className="primary-btn">Start your profile</Link>
            <Link href="/login" className="secondary-btn">Explore with an account</Link>
          </div>

          <div className="ss-real-trust-row">
            <span>✓ Privacy controls</span>
            <span>✓ Compatibility-led discovery</span>
            <span>✓ Mutual-interest messaging</span>
          </div>
        </div>

        <div className="ss-real-hero-gallery">
          <div className="ss-real-hero-main-photo">
            <img src="/demo-profiles/demo-001.jpg" alt="Fictional SoulSync demo profile" />
            <div className="ss-real-photo-overlay">
              <span>FEATURED MATCH</span>
              <strong>Ananya, 26</strong>
              <small>Austin · Data Analyst · 94% match</small>
            </div>
          </div>

          <div className="ss-real-hero-side">
            <div>
              <img src="/demo-profiles/demo-002.jpg" alt="Fictional SoulSync demo profile" />
              <span>Kavya · Dallas</span>
            </div>
            <div>
              <img src="/demo-profiles/demo-003.jpg" alt="Fictional SoulSync demo profile" />
              <span>Sneha · Richardson</span>
            </div>
          </div>

          <div className="ss-real-floating-search">
            <span>SEARCH MATCHES</span>
            <strong>Location · Education · Profession</strong>
            <p>Filter for the details that matter to you.</p>
          </div>
        </div>
      </section>

      <section className="ss-real-metrics">
        <div><strong>Compatibility</strong><span>Preference-driven recommendations</span></div>
        <div><strong>Privacy</strong><span>Visibility and safety controls</span></div>
        <div><strong>Intent</strong><span>Mutual-interest communication</span></div>
        <div><strong>Choice</strong><span>Free, Premium and Premium Plus</span></div>
      </section>

      <section className="ss-real-section" id="discover">
        <div className="ss-real-section-head">
          <div>
            <span className="ss-real-kicker">DISCOVER SOULSYNC</span>
            <h2>Profiles designed to help you understand the person, not just the picture.</h2>
          </div>
          <p>
            Members can share background, lifestyle, education, profession, interests and
            partner preferences so discovery feels informed and intentional.
          </p>
        </div>

        <div className="ss-real-featured-profiles">
          {demoProfiles.map(p => (
            <article key={p.name} className="ss-real-demo-card">
              <div className="ss-real-demo-photo">
                <img src={p.img} alt={`${p.name} fictional demo profile`} />
                <span>{p.match} match</span>
              </div>
              <div className="ss-real-demo-info">
                <h3>{p.name}, {p.age}</h3>
                <p>{p.city}</p>
                <strong>{p.job}</strong>
                <div>
                  <span>Verified email</span>
                  <span>Profile complete</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="ss-real-demo-note">
          <span>DEMO PROFILES</span>
          <p>Illustrative fictional profiles are shown on this public page to demonstrate the SoulSync experience.</p>
        </div>
      </section>

      <section className="ss-real-how" id="how">
        <div className="ss-real-how-copy">
          <span className="ss-real-kicker">HOW IT WORKS</span>
          <h2>A simple path to a meaningful connection.</h2>
          <p>We keep the journey clear so members can focus on compatibility, not complexity.</p>
        </div>

        <div className="ss-real-how-grid">
          <article><span>01</span><h3>Create your profile</h3><p>Share who you are, what matters to you, and what you are looking for.</p></article>
          <article><span>02</span><h3>Discover matches</h3><p>Browse recommendations and search using thoughtful filters.</p></article>
          <article><span>03</span><h3>Express interest</h3><p>Send an interest privately and wait for a mutual connection.</p></article>
          <article><span>04</span><h3>Start a conversation</h3><p>Message, share contact details where allowed, or use Premium Plus calling tools.</p></article>
        </div>
      </section>

      <section className="ss-real-story-band" id="stories">
        <div className="ss-real-story-copy">
          <span className="ss-real-kicker">MEMBER EXPERIENCE</span>
          <h2>Built to feel calm, private and worth spending time in.</h2>
          <p>
            These sample review cards illustrate the kind of experience SoulSync is designed to provide.
          </p>
        </div>

        <div className="ss-real-reviews">
          {reviews.map(r => (
            <article key={r.name}>
              <div className="ss-real-review-head">
                <img src={r.img} alt={`${r.name} fictional demo reviewer`} />
                <div>
                  <strong>{r.name}</strong>
                  <span>{r.city}</span>
                </div>
                <b>DEMO</b>
              </div>
              <p>“{r.text}”</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ss-real-safety">
        <div>
          <span className="ss-real-kicker">PRIVACY & TRUST</span>
          <h2>Share thoughtfully. Stay in control.</h2>
        </div>
        <div className="ss-real-safety-grid">
          <article><strong>Photo visibility</strong><p>Choose public, connections-only, or private access.</p></article>
          <article><strong>Blocking & reporting</strong><p>Built-in safety controls help members manage uncomfortable interactions.</p></article>
          <article><strong>Mutual communication</strong><p>Messaging follows accepted connections rather than unsolicited outreach.</p></article>
        </div>
      </section>

      <section className="ss-real-premium">
        <div>
          <span className="ss-real-kicker">PREMIUM DISCOVERY</span>
          <h2>Go further when you want more control over discovery.</h2>
          <p>Advanced filters, profile visitors, enhanced discovery, contact visibility, profile boost and more.</p>
        </div>
        <div>
          <Link href="/premium" className="ss-real-light-btn">Explore Premium</Link>
          <Link href="/register" className="ss-real-outline-btn">Join SoulSync</Link>
        </div>
      </section>

      <footer className="ss-real-footer">
        <div>
          <Link href="/" className="brand"><span className="brand-mark">S</span><span>SoulSync</span></Link>
          <p>Meaningful matches, built with intention.</p>
        </div>
        <div>
          <Link href="/register">Create profile</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/premium">Premium</Link>
        </div>
        <span>© 2026 SoulSync</span>
      </footer>
    </main>
  )
}
