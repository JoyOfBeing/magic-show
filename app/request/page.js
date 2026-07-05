'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RequestPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', heard: '', guess: '' });
  const [status, setStatus] = useState('idle');

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

  if (status === 'success') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="pregate">
          <div className="pregate-success">
            <h2>Request received.</h2>
            <p>If it&apos;s meant to be, the magic will find you.</p>
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
                placeholder="A friend, social media, etc."
              />
            </div>
            <div className="form-field">
              <label>What do you think the show even is?</label>
              <input
                type="text"
                value={form.guess}
                onChange={e => setForm(f => ({ ...f, guess: e.target.value }))}
                placeholder=""
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
