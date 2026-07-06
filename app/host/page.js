'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function HostPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    guests: '', isCompany: '', budget: '',
    hasLocation: '', location: '', vision: '',
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
      form.vision ? `Vision: ${form.vision}` : null,
    ].filter(Boolean).join(' | ');

    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      interest_type: 'host',
      source: 'organic',
      details,
    }]);

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
    }
  }

  return (
    <div className="page">
      <div className="stars" />
      <a href="/" className="portal-home-link">&larr; Home</a>

      <div className="host-page">
        <div className="host-hero">
          <div className="home-eyebrow">Bring the magic to your people</div>
          <h1>Host a Magic Show</h1>
          <p className="host-sub">
            The Magic Show is a multi-day immersive experience that transforms how people connect &mdash; with themselves and each other. We bring everything: facilitation, programming, a private chef, and the container. You bring the people.
          </p>
        </div>

        <div className="host-details">
          <div className="host-detail-card">
            <h3>For Friends &amp; Families</h3>
            <p>Gather your closest people for an experience none of you will forget. Birthdays, reunions, or just because.</p>
          </div>
          <div className="host-detail-card">
            <h3>For Companies &amp; Teams</h3>
            <p>Skip the trust falls. This is real team building &mdash; the kind that actually changes how people show up for each other.</p>
          </div>
          <div className="host-detail-card">
            <h3>For Communities</h3>
            <p>Churches, retreats, organizations. If you have a group that&apos;s ready to go deeper, we&apos;ll meet you there.</p>
          </div>
        </div>

        <div className="host-how">
          <h2>How it works</h2>
          <div className="host-steps">
            <div className="host-step">
              <div className="host-step-num">1</div>
              <div>
                <strong>Tell us about your group</strong>
                <p>Fill out the form below. We&apos;ll get back to you within 48 hours.</p>
              </div>
            </div>
            <div className="host-step">
              <div className="host-step-num">2</div>
              <div>
                <strong>We design it together</strong>
                <p>We&apos;ll talk through your vision, group size, venue, and budget to create the right container.</p>
              </div>
            </div>
            <div className="host-step">
              <div className="host-step-num">3</div>
              <div>
                <strong>We bring the magic</strong>
                <p>Our team handles facilitation, programming, food, and everything in between. You just show up.</p>
              </div>
            </div>
          </div>
        </div>

        {status === 'success' ? (
          <div className="host-success">
            <h2>We&apos;ll be in touch.</h2>
            <p>We&apos;ll reach out within 48 hours to talk about bringing a Magic Show to your people.</p>
            <a href="/" className="cta-btn cta-btn-secondary">&larr; Back to homepage</a>
          </div>
        ) : (
          <form className="host-form" onSubmit={handleSubmit}>
            <h2>Let&apos;s talk</h2>

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

            <div className="form-field">
              <label>How many people? *</label>
              <input type="number" required min="4" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))} placeholder="Minimum 4" />
            </div>

            <div className="form-field">
              <label>Is this for a company or organization? *</label>
              <div className="form-toggle">
                <button type="button" className={`form-toggle-btn ${form.isCompany === 'yes' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, isCompany: 'yes' }))}>Yes</button>
                <button type="button" className={`form-toggle-btn ${form.isCompany === 'no' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, isCompany: 'no' }))}>No</button>
              </div>
            </div>

            <div className="form-field">
              <label>Do you have a location in mind? *</label>
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
              <label>Budget range</label>
              <input type="text" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="Optional" />
            </div>

            <div className="form-field">
              <label>What&apos;s your vision for this experience?</label>
              <textarea value={form.vision} onChange={e => setForm(f => ({ ...f, vision: e.target.value }))} placeholder="Tell us anything — the occasion, the vibe, what you're hoping for..." rows={3} />
            </div>

            <button type="submit" className="rsvp-btn" disabled={status === 'submitting' || !form.isCompany || !form.hasLocation}>
              {status === 'submitting' ? 'Sending...' : status === 'error' ? 'Try again' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </div>

      <footer className="footer">
        <a href="/">Home</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
