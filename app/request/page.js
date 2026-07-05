'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function RequestPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', heard: '', guess: '' });
  const [status, setStatus] = useState('idle');
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showInterestSaved, setShowInterestSaved] = useState(false);

  // Load upcoming shows for step 2
  useEffect(() => {
    if (status !== 'success') return;
    async function loadShows() {
      const { data } = await supabase
        .from('magic_show_events')
        .select('id, name, dates, location, card_image')
        .eq('is_live', true);
      setUpcomingShows(data || []);
    }
    loadShows();
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      interest_type: 'waitlist',
      source: 'organic',
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

  async function handleShowInterest(show) {
    setSelectedShow(show.id);
    await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      interest_type: 'waitlist',
      source: 'organic',
      details: `event_id: ${show.id} | Interested via request flow`,
    }]);
    setShowInterestSaved(true);
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
                  <div className="stepper-label">Get Your Golden Ticket</div>
                  <div className="stepper-desc">We&apos;ll be in touch when a spot opens up.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-active">
                <div className="stepper-number">2</div>
                <div className="stepper-content">
                  <div className="stepper-label">Choose an Upcoming Show</div>
                  <div className="stepper-desc">Pick a date and location that calls to you.</div>
                  {upcomingShows.length > 0 ? (
                    <div className="stepper-shows">
                      {upcomingShows.map(show => (
                        <button
                          key={show.id}
                          className={`stepper-show-card ${selectedShow === show.id ? 'stepper-show-selected' : ''}`}
                          onClick={() => !showInterestSaved && handleShowInterest(show)}
                          disabled={showInterestSaved}
                        >
                          <div className="stepper-show-location">{show.location}</div>
                          <div className="stepper-show-dates">{show.dates}</div>
                          {selectedShow === show.id && <div className="stepper-show-check">Interested</div>}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="stepper-no-shows">No shows announced yet. We&apos;ll notify you when one opens.</div>
                  )}
                </div>
              </div>

              <div className="stepper-step stepper-step-upcoming">
                <div className="stepper-number">3</div>
                <div className="stepper-content">
                  <div className="stepper-label">Grab a Spot</div>
                  <div className="stepper-desc">We&apos;ll reach out to confirm your spot and contribution.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-upcoming">
                <div className="stepper-number">4</div>
                <div className="stepper-content">
                  <div className="stepper-label">Prepare for the Show</div>
                  <div className="stepper-desc">Everything you need to prepare for the experience.</div>
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
    </div>
  );
}
