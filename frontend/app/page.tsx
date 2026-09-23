import Link from 'next/link';
import BackendWakeup from '@/components/BackendWakeup';
import HomepageMatchFinder from '@/components/HomepageMatchFinder';

const previewProfiles = [
  {name:'Ananya',age:26,city:'Austin, TX',role:'Data Analyst',language:'Telugu',religion:'Hindu',match:'94%',img:'/demo-profiles/demo-001.jpg'},
  {name:'Arjun',age:28,city:'Dallas, TX',role:'Software Engineer',language:'Telugu',religion:'Hindu',match:'92%',img:'/demo-profiles/demo-010.jpg'},
  {name:'Kavya',age:27,city:'Seattle, WA',role:'Product Designer',language:'Tamil',religion:'Hindu',match:'90%',img:'/demo-profiles/demo-002.jpg'},
  {name:'Rahul',age:29,city:'San Jose, CA',role:'Cloud Engineer',language:'Hindi',religion:'Hindu',match:'88%',img:'/demo-profiles/demo-011.jpg'},
];

const communities = [
  ['Telugu','Language & culture'],['Tamil','Language & culture'],
  ['Hindi','Language & culture'],['Christian','Faith'],
  ['Hindu','Faith'],['USA NRI','Location'],
  ['Professionals','Career'],['Recently active','Activity'],
];

const faqs = [
  ['Is SoulSync a dating app?','SoulSync is designed for marriage-minded introductions and intentional matchmaking. Profiles, preferences, interests and communication are structured around serious relationship discovery.'],
  ['How does matching work?','Your profile and partner preferences are used to surface compatible members. You can also search by location, education, profession, language, religion and other profile details.'],
  ['Can anyone message me?','No. Messaging is designed around mutual connection. An interest needs to be accepted before a conversation becomes available.'],
  ['Can I control who sees my information?','SoulSync includes profile and photo visibility controls, blocking and reporting. Contact visibility is further restricted by connection and membership rules.'],
  ['What does Premium add?','Premium expands discovery with advanced search, profile visitors, enhanced discovery and eligible contact visibility. Premium Plus adds profile boost, video-call entitlement and priority support.'],
];

export default function Home() {
  return (
    <main className="ss-home3">
      <BackendWakeup />

      <nav className="ss-home3-nav">
        <Link href="/" className="ss-home3-brand"><span>S</span><b>SoulSync</b></Link>

        <div className="ss-home3-nav-links">
          <a href="#matches">Matches</a>
          <a href="#communities">Communities</a>
          <a href="#safety">Safety</a>
          <a href="#stories">Stories</a>
          <Link href="/premium">Premium</Link>
        </div>

        <div className="ss-home3-nav-actions">
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="ss-home3-nav-primary">Create profile</Link>
        </div>
      </nav>

      <section className="ss-home3-hero">
        <div className="ss-home3-hero-copy">
          <span className="ss-home3-kicker">MATRIMONY FOR SERIOUS, MEANINGFUL CONNECTIONS</span>
          <h1>Your search for a life partner can feel <em>simpler, safer and more personal.</em></h1>
          <p>
            Create a detailed matrimonial profile, discover compatible members,
            express interest privately and start conversations only when the connection is mutual.
          </p>

          <div className="ss-home3-hero-proof">
            <div><b>✓</b><span><strong>Detailed profiles</strong><small>Education, career, lifestyle, family context and interests</small></span></div>
            <div><b>✓</b><span><strong>Preference-led search</strong><small>Age, location, language, religion, education and profession</small></span></div>
            <div><b>✓</b><span><strong>Private communication</strong><small>Mutual interests before conversations begin</small></span></div>
          </div>
        </div>

        <HomepageMatchFinder />
      </section>

      <section className="ss-home3-trust">
        <div><span>◉</span><strong>Email-verified accounts</strong><small>Identity signals built into member profiles.</small></div>
        <div><span>♡</span><strong>Mutual-interest messaging</strong><small>Conversations start with shared intent.</small></div>
        <div><span>⌁</span><strong>Privacy controls</strong><small>Manage profile and photo visibility.</small></div>
        <div><span>⚑</span><strong>Block & report</strong><small>Safety controls remain within reach.</small></div>
      </section>

      <section className="ss-home3-matches" id="matches">
        <div className="ss-home3-section-head">
          <div>
            <span className="ss-home3-kicker">PROFILE PREVIEW</span>
            <h2>See the kind of detail that makes matrimonial discovery useful.</h2>
            <p>SoulSync combines photos with the information people actually use when considering a life partner.</p>
          </div>
          <Link href="/register">Create profile to explore →</Link>
        </div>

        <div className="ss-home3-profile-grid">
          {previewProfiles.map(profile => (
            <article key={profile.name} className="ss-home3-profile-card">
              <div className="ss-home3-profile-photo">
                <img src={profile.img} alt={`${profile.name} fictional demo profile`} />
                <span>{profile.match} match</span>
              </div>
              <div className="ss-home3-profile-body">
                <h3>{profile.name}, {profile.age}</h3>
                <p>{profile.city}</p>
                <div className="ss-home3-profile-facts">
                  <span>{profile.role}</span><span>{profile.language}</span><span>{profile.religion}</span>
                </div>
                <Link href="/register">View similar profiles →</Link>
              </div>
            </article>
          ))}
        </div>
        <small className="ss-home3-demo-note">Fictional demo profiles shown only to preview the SoulSync experience.</small>
      </section>

      <section className="ss-home3-communities" id="communities">
        <div className="ss-home3-section-head centered">
          <div>
            <span className="ss-home3-kicker">DISCOVER YOUR WAY</span>
            <h2>Start with what matters to your family and your future.</h2>
            <p>Matrimonial discovery is rarely one-size-fits-all. Search can be shaped around cultural, personal and practical preferences.</p>
          </div>
        </div>

        <div className="ss-home3-community-grid">
          {communities.map(([name,type]) => (
            <Link href={`/register?explore=${encodeURIComponent(name)}`} key={name}>
              <span>{type}</span><strong>{name}</strong><b>→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="ss-home3-how">
        <div className="ss-home3-how-visual">
          <div className="ss-home3-how-photo large"><img src="/demo-profiles/demo-005.jpg" alt="Fictional demo member" /></div>
          <div className="ss-home3-how-photo small"><img src="/demo-profiles/demo-012.jpg" alt="Fictional demo member" /></div>
          <div className="ss-home3-how-badge"><span>♡</span><strong>Mutual connection</strong><small>Conversation unlocked</small></div>
        </div>

        <div className="ss-home3-how-copy">
          <span className="ss-home3-kicker">HOW SOULSYNC WORKS</span>
          <h2>From profile to conversation in three clear steps.</h2>

          <div className="ss-home3-steps">
            <div><b>1</b><span><strong>Build a meaningful profile</strong><small>Add photos, education, profession, lifestyle, preferences and hobbies.</small></span></div>
            <div><b>2</b><span><strong>Discover and shortlist</strong><small>Use recommendations or search by the criteria that matter to you.</small></span></div>
            <div><b>3</b><span><strong>Connect when interest is mutual</strong><small>Accept an interest, then move into private messaging and eligible video calling.</small></span></div>
          </div>

          <Link href="/register" className="ss-home3-primary">Start my profile</Link>
        </div>
      </section>

      <section className="ss-home3-safety" id="safety">
        <div className="ss-home3-safety-copy">
          <span className="ss-home3-kicker">TRUST & PRIVACY</span>
          <h2>Built to help you stay in control of your matrimonial journey.</h2>
          <p>Serious matchmaking needs more than attractive profiles. SoulSync keeps visibility, contact access and communication intentional.</p>
        </div>

        <div className="ss-home3-safety-grid">
          <article><span>01</span><h3>Profile visibility</h3><p>Choose how discoverable your profile should be.</p></article>
          <article><span>02</span><h3>Photo visibility</h3><p>Choose which photos are public, connection-only or private.</p></article>
          <article><span>03</span><h3>Contact protection</h3><p>Contact information is not automatically exposed to every member.</p></article>
          <article><span>04</span><h3>Safety actions</h3><p>Block or report profiles directly whenever something feels wrong.</p></article>
        </div>
      </section>

      <section className="ss-home3-premium">
        <div>
          <span className="ss-home3-kicker">SOULSYNC MEMBERSHIP</span>
          <h2>More control when you want to take your search further.</h2>
          <p>Start free, then upgrade only if you want deeper search, visibility insights or additional connection tools.</p>
        </div>

        <div className="ss-home3-plan-grid">
          <article>
            <span>FREE</span><h3>Start your search</h3>
            <ul><li>Create your matrimonial profile</li><li>Standard profile discovery</li><li>Compatibility recommendations</li><li>Mutual-interest messaging</li></ul>
            <Link href="/register">Create free profile</Link>
          </article>
          <article className="featured">
            <span>PREMIUM</span><h3>Go deeper</h3>
            <ul><li>Advanced search filters</li><li>Unlimited interests</li><li>Profile visitors</li><li>Enhanced discovery</li></ul>
            <Link href="/premium">Explore Premium</Link>
          </article>
          <article>
            <span>PREMIUM+</span><h3>Stand out & connect</h3>
            <ul><li>Profile boost</li><li>Video-call entitlement</li><li>Priority support</li><li>Everything in Premium</li></ul>
            <Link href="/premium-plus">Explore Premium+</Link>
          </article>
        </div>
      </section>

      <section className="ss-home3-stories" id="stories">
        <div className="ss-home3-section-head">
          <div>
            <span className="ss-home3-kicker">SAMPLE MEMBER STORIES</span>
            <h2>A matrimony website should feel human, not transactional.</h2>
            <p>These illustrative stories show the kind of member experience SoulSync is designed to support.</p>
          </div>
        </div>

        <div className="ss-home3-story-grid">
          <article>
            <div><img src="/demo-profiles/demo-006.jpg" alt="Fictional demo member" /><img src="/demo-profiles/demo-013.jpg" alt="Fictional demo member" /></div>
            <span>DEMO STORY</span>
            <h3>“We started by talking about family, work and what home meant to us.”</h3>
            <p>A sample story about two fictional members who connected after noticing shared values and similar expectations for the future.</p>
          </article>
          <article>
            <div><img src="/demo-profiles/demo-007.jpg" alt="Fictional demo member" /><img src="/demo-profiles/demo-014.jpg" alt="Fictional demo member" /></div>
            <span>DEMO STORY</span>
            <h3>“The detailed profile made the first conversation much easier.”</h3>
            <p>A sample member experience showing how education, hobbies and lifestyle context can create a more natural introduction.</p>
          </article>
          <article>
            <div><img src="/demo-profiles/demo-008.jpg" alt="Fictional demo member" /><img src="/demo-profiles/demo-015.jpg" alt="Fictional demo member" /></div>
            <span>DEMO STORY</span>
            <h3>“There was no pressure to rush into a conversation.”</h3>
            <p>A sample story illustrating a slower, mutual-interest approach to serious matchmaking.</p>
          </article>
        </div>

        <small className="ss-home3-demo-note">These are fictional product-preview stories, not real customer reviews or endorsements.</small>
      </section>

      <section className="ss-home3-faq">
        <div>
          <span className="ss-home3-kicker">QUESTIONS</span>
          <h2>Know what to expect before you join.</h2>
        </div>
        <div className="ss-home3-faq-list">
          {faqs.map(([question,answer]) => (
            <details key={question}><summary>{question}</summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <section className="ss-home3-final">
        <div>
          <span className="ss-home3-kicker">READY TO BEGIN?</span>
          <h2>Build a profile that says more than a photograph can.</h2>
          <p>Join SoulSync and start discovering people through compatibility, context and mutual intent.</p>
        </div>
        <div>
          <Link href="/register" className="ss-home3-primary">Create my profile</Link>
          <Link href="/login" className="ss-home3-secondary">I already have an account</Link>
        </div>
      </section>

      <footer className="ss-home3-footer">
        <div className="ss-home3-brand"><span>S</span><b>SoulSync</b></div>
        <p>A modern matrimonial platform for meaningful, marriage-minded connections.</p>
        <div><Link href="/register">Create profile</Link><Link href="/login">Sign in</Link><Link href="/premium">Premium</Link></div>
      </footer>
    </main>
  );
}
