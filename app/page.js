'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

function PastShowCard({ image, city, name, dates, secret }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={`show-card show-card-past ${secret ? 'show-card-clickable' : ''}`}
      onClick={() => secret && setRevealed(r => !r)}
    >
      <img src={image} alt={city} className="show-card-image" />
      <div className="show-card-body">
        <div className="show-card-city">{city}</div>
        <div className="show-card-name">{name}</div>
        {dates && <div className="show-card-dates">{dates}</div>}
        {revealed && secret && (
          <div className="show-card-secret">{secret}</div>
        )}
      </div>
    </div>
  );
}

const LOCAL_IMAGES = {
  'nashville': '/nashville.jpeg',
  'minneapolis': '/minneapolis.jpg',
  'big sky': '/big-sky.jpg',
};

function getShowImage(show) {
  if (show.card_image) return show.card_image;
  // Match location to local images
  const loc = (show.location || '').toLowerCase();
  for (const [key, path] of Object.entries(LOCAL_IMAGES)) {
    if (loc.includes(key)) return path;
  }
  return show.venue_image || '';
}

const PAST_SHOWS_FALLBACK = [
  { id: 'nashville', city: 'Nashville', name: 'The Magic Show', image: '/nashville.jpeg' },
  { id: 'minneapolis', city: 'Minneapolis', name: 'The Magic Show', image: '/minneapolis.jpg' },
];

function HostForm({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    guests: '', isCompany: '', budget: '',
    hasLocation: '', location: '',
  });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    const details = [
      `Guests: ${form.guests}`,
      `Company: ${form.isCompany}`,
      form.budget ? `Budget: ${form.budget}` : null,
      form.hasLocation === 'yes' ? `Location: ${form.location}` : 'Location: No preference',
    ].filter(Boolean).join(' | ');

    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email,
      phone: form.phone,
      interest_type: 'host',
      details,
    }]);
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
    }
  }

  if (status === 'success') {
    return (
      <div className="lead-success">
        <h3>We&apos;ll be in touch.</h3>
        <p>We&apos;ll reach out to talk about bringing a Magic Show to your people.</p>
        <button className="lead-close" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h3>Host a Magic Show</h3>
      <p className="lead-sub">Bring the magic to your people. Tell us a little about what you&apos;re imagining.</p>

      <div className="form-field">
        <label>How many people will you invite? *</label>
        <input type="number" required min="5" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))} placeholder="Minimum 5" />
      </div>

      <div className="form-field">
        <label>Is this for a company? *</label>
        <div className="form-toggle">
          <button type="button" className={`form-toggle-btn ${form.isCompany === 'yes' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, isCompany: 'yes' }))}>Yes</button>
          <button type="button" className={`form-toggle-btn ${form.isCompany === 'no' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, isCompany: 'no' }))}>No</button>
        </div>
      </div>

      <div className="form-field">
        <label>Do you have a budget in mind?</label>
        <input type="text" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="Optional" />
      </div>

      <div className="form-field">
        <label>Do you have a preferred location? *</label>
        <div className="form-toggle">
          <button type="button" className={`form-toggle-btn ${form.hasLocation === 'yes' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, hasLocation: 'yes' }))}>Yes</button>
          <button type="button" className={`form-toggle-btn ${form.hasLocation === 'no' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, hasLocation: 'no' }))}>No</button>
        </div>
      </div>

      {form.hasLocation === 'yes' && (
        <div className="form-field">
          <label>Where?</label>
          <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, venue, or general area" />
        </div>
      )}

      <div className="form-field">
        <label>Name *</label>
        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First and Last" />
      </div>
      <div className="form-field">
        <label>Email *</label>
        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
      </div>
      <div className="form-field">
        <label>Phone *</label>
        <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" />
      </div>

      <div className="lead-actions">
        <button type="submit" className="rsvp-btn" disabled={status === 'submitting' || !form.isCompany || !form.hasLocation}>
          {status === 'submitting' ? 'Sending...' : status === 'error' ? 'Try again' : 'Submit'}
        </button>
        <button type="button" className="lead-cancel" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [openForm, setOpenForm] = useState(null);
  const [liveEvent, setLiveEvent] = useState(null);
  const [pastEvents, setPastEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    async function loadEvents() {
      // Fetch live event
      const { data: live } = await supabase
        .from('magic_show_events')
        .select('*')
        .eq('is_live', true)
        .single();
      setLiveEvent(live);

      // Fetch past events (not live)
      const { data: past } = await supabase
        .from('magic_show_events')
        .select('*')
        .eq('is_live', false)
        .order('created_at', { ascending: false });
      setPastEvents(past || []);

      // Fetch waitlist count
      const { count } = await supabase
        .from('magic_show_leads')
        .select('*', { count: 'exact', head: true })
        .eq('interest_type', 'waitlist')
        .is('invited_at', null);
      setWaitlistCount(count || 0);

      setEventsLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <div className="page home-page">
      <div className="stars" />

      <nav className="home-nav">
        {!authLoading && (
          user
            ? <a href="/portal" className="home-nav-link">My Portal</a>
            : <a href="/portal" className="home-nav-link">Sign In</a>
        )}
      </nav>

      <header className="home-hero">
        <div className="home-eyebrow">By invitation only</div>
        <h1 className="home-title">The Magic Show</h1>
        <p className="home-tagline">Surprise, you&apos;re the magic.</p>
        <p className="home-sub">
          The Magic Show is a living, immersive experience you can&apos;t fully understand until you&apos;re inside it. We can&apos;t tell you what it is &mdash; that&apos;s the whole point.
        </p>
      </header>

      {user && (
        <section className="home-welcome">
          <a href="/portal" className="cta-btn cta-btn-primary">Enter Your Portal</a>
        </section>
      )}

      {!eventsLoading && liveEvent && (
        <section className="home-section">
          <div className="home-section-label">Upcoming Shows</div>
          <a href="/big-sky" className="show-card show-card-open">
            <img src={getShowImage(liveEvent)} alt={liveEvent.location} className="show-card-image" />
            <div className="show-card-body">
              <div className="show-card-city">{liveEvent.location}</div>
              <div className="show-card-name">{liveEvent.name}</div>
              <div className="show-card-dates">{liveEvent.dates}</div>
              <div className="show-card-cta">Enter &rarr;</div>
            </div>
          </a>
        </section>
      )}

      <section className="home-section">
        <div className="home-section-label">Past Shows</div>
        <div className="show-grid">
          {pastEvents.length > 0
            ? pastEvents.map(show => (
                <PastShowCard
                  key={show.id}
                  image={getShowImage(show)}
                  city={show.location}
                  name={show.name}
                  dates={show.dates}
                  secret={show.secret}
                />
              ))
            : PAST_SHOWS_FALLBACK.map(show => (
                <PastShowCard
                  key={show.id}
                  image={show.image}
                  city={show.city}
                  name={show.name}
                />
              ))
          }
        </div>
      </section>

      {!user && (
        <section className="home-cta">
          <h2>Want in on the magic?</h2>
          <p>
            The only way in is a Golden Ticket from someone who&apos;s been. Don&apos;t know anyone? Join the waitlist &mdash; if it&apos;s meant to be, the magic will find you.
          </p>
          <div className="home-cta-buttons">
            <a href="/waitlist" className="cta-btn cta-btn-primary">
              Get on the Waitlist
            </a>
            <button className="cta-btn cta-btn-secondary" onClick={() => setOpenForm('host')}>
              Host a Show
            </button>
          </div>
        </section>
      )}

      {openForm === 'host' && (
        <div className="lead-modal" onClick={() => setOpenForm(null)}>
          <div className="lead-modal-inner" onClick={e => e.stopPropagation()}>
            <HostForm onClose={() => setOpenForm(null)} />
          </div>
        </div>
      )}

      <footer className="footer">
        <a href="/portal">{user ? 'My Portal' : 'Sign In'}</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
