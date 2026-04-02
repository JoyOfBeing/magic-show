'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

function RSVPForm({ onComplete }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('deck_waitlist').insert([{
      name: form.name,
      email: form.email,
      phone: form.phone,
      investment_level: 'magic_show_bigsky_rsvp',
    }]);
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      onComplete(form);
    }
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Name *</label>
        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
      </div>
      <div className="form-field">
        <label>Email *</label>
        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
      </div>
      <div className="form-field">
        <label>Phone *</label>
        <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" />
      </div>
      <button type="submit" className="rsvp-btn" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Confirming...' : status === 'error' ? 'Try again' : 'Accept the Invitation'}
      </button>
    </form>
  );
}

function IntakeForm({ rsvpData }) {
  const [form, setForm] = useState({
    medical_conditions: '',
    medications: '',
    mental_health: '',
    plant_experience: '',
    emergency_name: '',
    emergency_phone: '',
    consent: false,
  });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('deck_waitlist').insert([{
      name: `${rsvpData.name} — INTAKE`,
      email: rsvpData.email,
      phone: `EC: ${form.emergency_name} ${form.emergency_phone}`,
      investment_level: `exp:${form.plant_experience} | medical:${form.medical_conditions} | meds:${form.medications} | mental:${form.mental_health}`,
    }]);
    setStatus(error ? 'error' : 'success');
  }

  if (status === 'success') {
    return (
      <div className="intake-complete">
        <div className="ticket ticket-mini">
          <div className="ticket-confirmed">CONFIRMED</div>
        </div>
        <h2>You&apos;re in.</h2>
        <p>We&apos;ll be in touch with everything you need before May 1.</p>
        <p className="intake-note">Check your email. Prepare accordingly.</p>
      </div>
    );
  }

  return (
    <div className="intake">
      <div className="intake-header">
        <h2>One more step.</h2>
        <p>For your safety and ours, we need some information before the show. Everything here is confidential.</p>
      </div>
      <form className="intake-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Medical conditions or physical limitations</label>
          <textarea
            value={form.medical_conditions}
            onChange={e => setForm(f => ({ ...f, medical_conditions: e.target.value }))}
            placeholder="Anything we should know about — allergies, chronic conditions, injuries, dietary needs..."
            rows={3}
          />
        </div>
        <div className="form-field">
          <label>Current medications</label>
          <textarea
            value={form.medications}
            onChange={e => setForm(f => ({ ...f, medications: e.target.value }))}
            placeholder="List any medications you're currently taking, including supplements..."
            rows={3}
          />
        </div>
        <div className="form-field">
          <label>Mental health history</label>
          <textarea
            value={form.mental_health}
            onChange={e => setForm(f => ({ ...f, mental_health: e.target.value }))}
            placeholder="Any diagnoses, current treatment, or things we should be aware of..."
            rows={3}
          />
        </div>
        <div className="form-field">
          <label>Experience with plant medicine</label>
          <select
            value={form.plant_experience}
            onChange={e => setForm(f => ({ ...f, plant_experience: e.target.value }))}
          >
            <option value="">Select your experience level</option>
            <option value="none">No prior experience</option>
            <option value="curious">Curious but haven&apos;t tried</option>
            <option value="beginner">1–2 experiences</option>
            <option value="intermediate">Several experiences</option>
            <option value="experienced">Experienced practitioner</option>
          </select>
        </div>

        <div className="intake-divider">Emergency Contact</div>

        <div className="form-row">
          <div className="form-field">
            <label>Emergency contact name *</label>
            <input
              type="text"
              required
              value={form.emergency_name}
              onChange={e => setForm(f => ({ ...f, emergency_name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div className="form-field">
            <label>Emergency contact phone *</label>
            <input
              type="tel"
              required
              value={form.emergency_phone}
              onChange={e => setForm(f => ({ ...f, emergency_phone: e.target.value }))}
              placeholder="(555) 555-5555"
            />
          </div>
        </div>

        <div className="form-field consent-field">
          <label className="consent-label">
            <input
              type="checkbox"
              required
              checked={form.consent}
              onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
            />
            <span>
              I understand that this experience may involve plant medicine and altered states of consciousness. I confirm that the information I&apos;ve provided is accurate and complete. I accept full responsibility for my participation and release the organizers from liability.
            </span>
          </label>
        </div>

        <button type="submit" className="intake-btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting...' : status === 'error' ? 'Try again' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  const [rsvpComplete, setRsvpComplete] = useState(false);
  const [rsvpData, setRsvpData] = useState(null);

  function handleRSVP(data) {
    setRsvpData(data);
    setRsvpComplete(true);
  }

  return (
    <div className="page">
      <div className="stars" />

      {!rsvpComplete ? (
        <>
          {/* ===== GOLDEN TICKET ===== */}
          <div className="ticket-wrapper">
            <div className="ticket">
              <div className="ticket-edge ticket-edge-left" />
              <div className="ticket-inner">
                <div className="ticket-eyebrow">You&apos;ve been invited to</div>
                <h1 className="ticket-title">The Magic Show</h1>
                <div className="ticket-details">
                  <div className="ticket-detail">
                    <span className="detail-label">When</span>
                    <span className="detail-value">May 1–3, 2026</span>
                  </div>
                  <div className="ticket-detail">
                    <span className="detail-label">Where</span>
                    <span className="detail-value">Big Sky, Montana</span>
                  </div>
                </div>
                <div className="ticket-tagline">This is not a retreat. This is not a conference.<br />This is something else entirely.</div>
                <div className="ticket-admit">ADMIT ONE</div>
              </div>
              <div className="ticket-edge ticket-edge-right" />
            </div>
          </div>

          {/* ===== RSVP ===== */}
          <div className="rsvp-section">
            <h2 className="rsvp-heading">RSVP</h2>
            <p className="rsvp-sub">Spots are limited. This invitation is non-transferable.</p>
            <RSVPForm onComplete={handleRSVP} />
          </div>
        </>
      ) : (
        <IntakeForm rsvpData={rsvpData} />
      )}

      <footer className="footer">
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
