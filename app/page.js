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

function LeadForm({ interestType, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email,
      phone: form.phone,
      interest_type: interestType,
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
        <h3>Got it.</h3>
        <p>
          {interestType === 'waitlist'
            ? "We'll be in touch when a door opens."
            : "We'll reach out about hosting your own."}
        </p>
        <button className="lead-close" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h3>{interestType === 'waitlist' ? 'Get on the Waitlist' : 'Host a Show'}</h3>
      <p className="lead-sub">
        {interestType === 'waitlist'
          ? "Drop your info and we'll reach out when a door opens."
          : 'Want to bring a Magic Show to your people, your company, or your community? Start here.'}
      </p>
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
        <button type="submit" className="rsvp-btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : status === 'error' ? 'Try again' : 'Send'}
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
          The Magic Show is a living, immersive experience you can&apos;t fully understand until you&apos;re inside it. Not knowing what it is is part of the trick. It either calls you or it doesn&apos;t.
        </p>
      </header>

      {user && (
        <section className="home-welcome">
          <a href="/portal" className="cta-btn cta-btn-primary">Enter Your Portal</a>
        </section>
      )}

      {!eventsLoading && liveEvent && (
        <section className="home-section">
          <div className="home-section-label">Currently Open</div>
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
            Magic Shows are invite-only. Get on the waitlist and we&apos;ll reach out when a door opens. You can also host your own.
          </p>
          <div className="home-cta-buttons">
            <button className="cta-btn cta-btn-primary" onClick={() => setOpenForm('waitlist')}>
              Get on the Waitlist
            </button>
            <button className="cta-btn cta-btn-secondary" onClick={() => setOpenForm('host')}>
              Host a Show
            </button>
          </div>
        </section>
      )}

      {openForm && (
        <div className="lead-modal" onClick={() => setOpenForm(null)}>
          <div className="lead-modal-inner" onClick={e => e.stopPropagation()}>
            <LeadForm interestType={openForm} onClose={() => setOpenForm(null)} />
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
