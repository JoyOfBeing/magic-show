'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '../../lib/supabase';

function GoldenTicketRedeem({ referrer }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', event_id: '' });
  const [status, setStatus] = useState('idle');
  const [upcomingShows, setUpcomingShows] = useState([]);

  useEffect(() => {
    async function loadShows() {
      const { data } = await supabase
        .from('magic_show_events')
        .select('id, name, dates, location')
        .eq('is_live', true);
      setUpcomingShows(data || []);
    }
    loadShows();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      interest_type: 'waitlist',
      source: 'referral',
      event_id: form.event_id || null,
      details: `Referred by: ${referrer}`,
    }]);

    if (error) {
      setStatus('error');
      return;
    }
    setStatus('success');
  }

  if (status === 'success') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="pregate">
          <div className="stepper-success">
            <h2>You&apos;re in.</h2>
            <p className="stepper-sub">We&apos;ll find you when the time is right. Keep an eye on your inbox.</p>
            <a href="/" className="pregate-home-link">&larr; Back to homepage</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="stars" />

      <div className="ticket-wrapper">
        <div className="ticket">
          <div className="ticket-edge ticket-edge-left" />
          <div className="ticket-inner">
            <div className="ticket-eyebrow">You&apos;ve been chosen</div>
            <h1 className="ticket-title">Golden Ticket</h1>
            <div className="ticket-tagline">The Magic Show is a multi-day immersive experience &mdash; invite only, no two are alike, and no one can really explain it until you&apos;ve been.</div>
            <div className="ticket-admit">THE MAGIC SHOW</div>
          </div>
          <div className="ticket-edge ticket-edge-right" />
        </div>
      </div>

      <div className="pregate">
        <div className="pregate-form-section">
          <h2>Claim Your Ticket</h2>
          <p>Someone who&apos;s been through the magic thought you were ready. Claim your ticket and we&apos;ll take it from here.</p>
          <form onSubmit={handleSubmit} className="pregate-form">
            <div className="form-field">
              <label>Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="First and Last"
              />
            </div>
            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
              />
            </div>
            <div className="form-field">
              <label>Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 555-5555"
              />
            </div>
            {upcomingShows.length > 0 && (
              <div className="form-field">
                <label>Which show are you interested in?</label>
                <select
                  value={form.event_id}
                  onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
                >
                  <option value="">Not sure yet</option>
                  {upcomingShows.map(show => (
                    <option key={show.id} value={show.id}>
                      {show.name} — {show.dates}, {show.location}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="rsvp-btn" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Claiming...' : status === 'error' ? 'Try again' : 'Claim My Ticket'}
            </button>
          </form>
        </div>
      </div>

      <footer className="footer">
        <a href="/">Home</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}

function RequestForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', heard: '', guess: '', event_id: '' });
  const [status, setStatus] = useState('idle');
  const [upcomingShows, setUpcomingShows] = useState([]);

  useEffect(() => {
    async function loadShows() {
      const { data } = await supabase
        .from('magic_show_events')
        .select('id, name, dates, location')
        .eq('is_live', true);
      setUpcomingShows(data || []);
    }
    loadShows();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      interest_type: 'waitlist',
      source: 'organic',
      event_id: form.event_id || null,
      details: [
        form.heard && `How they heard: ${form.heard}`,
        form.guess && `What they think it is: ${form.guess}`,
      ].filter(Boolean).join(' | ') || null,
    }]);

    if (error) {
      setStatus('error');
      return;
    }
    setStatus('success');
  }

  if (status === 'success') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="pregate">
          <div className="stepper-success">
            <h2>You&apos;re on your way.</h2>
            <p className="stepper-sub">Here&apos;s how the magic unfolds.</p>

            <div className="stepper">
              <div className="stepper-step stepper-step-done">
                <div className="stepper-number">1</div>
                <div className="stepper-content">
                  <div className="stepper-label">Request a Golden Ticket</div>
                  <div className="stepper-desc">Done. We&apos;ll be in touch.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-upcoming">
                <div className="stepper-number">2</div>
                <div className="stepper-content">
                  <div className="stepper-label">Get Your Invite</div>
                  <div className="stepper-desc">We&apos;ll reach out when a spot opens up.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-upcoming">
                <div className="stepper-number">3</div>
                <div className="stepper-content">
                  <div className="stepper-label">Register for a Show</div>
                  <div className="stepper-desc">Complete your intake and confirm your spot.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-upcoming">
                <div className="stepper-number">4</div>
                <div className="stepper-content">
                  <div className="stepper-label">Prepare for the Show</div>
                  <div className="stepper-desc">Everything you need to show up ready.</div>
                </div>
              </div>
            </div>

            <a href="/" className="pregate-home-link">&larr; Back to homepage</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="stars" />
      <a href="/" className="portal-home-link">&larr; Home</a>

      <div className="pregate">
        <div className="pregate-form-section">
          <h2>Request a Golden Ticket</h2>
          <p>The Magic Show is invite-only. Tell us a little about yourself and we&apos;ll be in touch if a spot opens up.</p>
          <form onSubmit={handleSubmit} className="pregate-form">
            <div className="form-field">
              <label>Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="First and Last"
              />
            </div>
            <div className="form-field">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@email.com"
              />
            </div>
            <div className="form-field">
              <label>Phone *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="(555) 555-5555"
              />
            </div>
            {upcomingShows.length > 0 && (
              <div className="form-field">
                <label>Which show are you interested in?</label>
                <select
                  value={form.event_id}
                  onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
                >
                  <option value="">Not sure yet</option>
                  {upcomingShows.map(show => (
                    <option key={show.id} value={show.id}>
                      {show.name} — {show.dates}, {show.location}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-field">
              <label>How did you hear about The Magic Show?</label>
              <input
                type="text"
                value={form.heard}
                onChange={e => setForm(f => ({ ...f, heard: e.target.value }))}
                placeholder="Who told you?"
              />
            </div>
            <div className="form-field">
              <label>What do you think the show even is?</label>
              <input
                type="text"
                value={form.guess}
                onChange={e => setForm(f => ({ ...f, guess: e.target.value }))}
                placeholder="Hint: You're the show"
              />
            </div>
            <button type="submit" className="rsvp-btn" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting...' : status === 'error' ? 'Try again' : 'Request a Ticket'}
            </button>
          </form>
        </div>
      </div>

      <footer className="footer">
        <a href="/">Home</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}

function RequestContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || '';

  if (ref) {
    return <GoldenTicketRedeem referrer={ref} />;
  }

  return <RequestForm />;
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="page"><div className="stars" /></div>}>
      <RequestContent />
    </Suspense>
  );
}
