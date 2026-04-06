'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

const PAST_SHOWS = [
  {
    id: 'nashville',
    city: 'Nashville',
    name: 'The Magic Show',
    image: '/nashville.jpeg',
  },
  {
    id: 'minneapolis',
    city: 'Minneapolis',
    name: 'The Magic Show',
    image: '/minneapolis.jpg',
  },
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
          {interestType === 'invite'
            ? "We'll be in touch when the next door opens."
            : "We'll reach out about hosting your own."}
        </p>
        <button className="lead-close" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <h3>{interestType === 'invite' ? 'Request an Invite' : 'Host Your Own'}</h3>
      <p className="lead-sub">
        {interestType === 'invite'
          ? 'Magic Shows are invite-only. Tell us who you are and we’ll be in touch.'
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
  const [openForm, setOpenForm] = useState(null); // 'invite' | 'host' | null

  return (
    <div className="page home-page">
      <div className="stars" />

      <header className="home-hero">
        <div className="home-eyebrow">By invitation only</div>
        <h1 className="home-title">The Magic Show</h1>
        <p className="home-tagline">Surprise, you’re the magic.</p>
        <p className="home-sub">
          A multi-day emergent ceremony for the curious, the cracked-open, and the ones quietly looking for the next door. Each show is small. Each one is different. Each one finds the people who are meant to be there.
        </p>
      </header>

      <section className="home-section">
        <div className="home-section-label">Currently Open</div>
        <a href="/big-sky" className="show-card show-card-open">
          <img src="/big-sky.jpg" alt="Big Sky" className="show-card-image" />
          <div className="show-card-body">
            <div className="show-card-city">Big Sky, Montana</div>
            <div className="show-card-name">The Magic Show</div>
            <div className="show-card-cta">Enter &rarr;</div>
          </div>
        </a>
      </section>

      <section className="home-section">
        <div className="home-section-label">Past Shows</div>
        <div className="show-grid">
          {PAST_SHOWS.map(show => (
            <div key={show.id} className="show-card show-card-past">
              <img src={show.image} alt={show.city} className="show-card-image" />
              <div className="show-card-body">
                <div className="show-card-city">{show.city}</div>
                <div className="show-card-name">{show.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <h2>Want in?</h2>
        <p>
          We don’t sell tickets. Magic Shows happen when the right people find each other. If something here is pulling at you, tell us.
        </p>
        <div className="home-cta-buttons">
          <button className="cta-btn cta-btn-primary" onClick={() => setOpenForm('invite')}>
            Request an Invite
          </button>
          <button className="cta-btn cta-btn-secondary" onClick={() => setOpenForm('host')}>
            Host Your Own
          </button>
        </div>
        <p className="home-cta-fine">
          Hosting requires a J.O.B. elder. Attend a show first — that’s how you become one.
        </p>
      </section>

      {openForm && (
        <div className="lead-modal" onClick={() => setOpenForm(null)}>
          <div className="lead-modal-inner" onClick={e => e.stopPropagation()}>
            <LeadForm interestType={openForm} onClose={() => setOpenForm(null)} />
          </div>
        </div>
      )}

      <footer className="footer">
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
