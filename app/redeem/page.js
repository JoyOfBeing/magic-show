'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function RedeemContent() {
  const searchParams = useSearchParams();
  const prefillCode = searchParams.get('code') || '';

  const [code, setCode] = useState(prefillCode);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [upcomingShows, setUpcomingShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showInterestSaved, setShowInterestSaved] = useState(false);

  // Auto-submit if code came from URL
  useEffect(() => {
    if (prefillCode) {
      validateCode(prefillCode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load upcoming shows after validation
  useEffect(() => {
    if (!ticket) return;
    async function loadShows() {
      const { data } = await supabase
        .from('magic_show_events')
        .select('id, name, dates, location')
        .eq('is_live', true);
      setUpcomingShows(data || []);
    }
    loadShows();
  }, [ticket]);

  async function validateCode(codeVal) {
    const trimmed = (codeVal || code).trim().toUpperCase();
    if (!trimmed) return;
    setStatus('checking');
    setError('');

    const { data } = await supabase
      .from('golden_tickets')
      .select('*')
      .eq('code', trimmed)
      .single();

    if (!data) {
      setStatus('idle');
      setError('That code wasn\u2019t found. Double-check and try again.');
      return;
    }

    if (data.status === 'redeemed') {
      setStatus('idle');
      setError('This Golden Ticket has already been used.');
      return;
    }

    if (data.status === 'expired') {
      setStatus('idle');
      setError('This Golden Ticket has expired.');
      return;
    }

    if (data.status === 'available') {
      setStatus('idle');
      setError('This Golden Ticket hasn\u2019t been activated yet.');
      return;
    }

    // Check 90-day expiration
    const age = Date.now() - new Date(data.created_at).getTime();
    if (age > 90 * 24 * 60 * 60 * 1000) {
      await supabase
        .from('golden_tickets')
        .update({ status: 'expired' })
        .eq('id', data.id);
      setStatus('idle');
      setError('This Golden Ticket has expired.');
      return;
    }

    // Valid — redeem ticket and show stepper
    await supabase.from('magic_show_leads').insert([{
      name: data.recipient_name || '',
      email: data.recipient_email || '',
      interest_type: 'reservation',
      source: 'golden_ticket',
      ticket_code: data.code,
    }]);

    await supabase
      .from('golden_tickets')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    setTicket(data);
    setStatus('validated');
  }

  async function handleShowInterest(show) {
    setSelectedShow(show.id);
    await supabase.from('magic_show_leads').insert([{
      name: ticket.recipient_name || '',
      email: ticket.recipient_email || '',
      interest_type: 'reservation',
      source: 'golden_ticket',
      ticket_code: ticket.code,
      details: `event_id: ${show.id}`,
    }]);
    setShowInterestSaved(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    validateCode();
  }

  // Stepper view after valid ticket
  if (status === 'validated' && ticket) {
    const firstName = ticket.sender_name ? ticket.sender_name.split(' ')[0] : 'Someone';
    return (
      <div className="page">
        <div className="stars" />
        <div className="pregate">
          <div className="stepper-success">
            <h2>{firstName} chose well.</h2>
            <p className="stepper-sub">Your Golden Ticket is activated. Here&apos;s what happens next.</p>

            <div className="stepper">
              <div className="stepper-step stepper-step-done">
                <div className="stepper-number">1</div>
                <div className="stepper-content">
                  <div className="stepper-label">Get Your Golden Ticket</div>
                  <div className="stepper-desc">Done. You&apos;re in.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-active">
                <div className="stepper-number">2</div>
                <div className="stepper-content">
                  <div className="stepper-label">Choose Your Show</div>
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
                  <div className="stepper-label">Get Approved</div>
                  <div className="stepper-desc">We&apos;ll reach out to confirm your spot and contribution.</div>
                </div>
              </div>

              <div className="stepper-step stepper-step-upcoming">
                <div className="stepper-number">4</div>
                <div className="stepper-content">
                  <div className="stepper-label">Enter the Show</div>
                  <div className="stepper-desc">Complete your registration and prepare for the experience.</div>
                </div>
              </div>
            </div>

            <a href="/" className="pregate-home-link">&larr; Back to homepage</a>
          </div>
        </div>
      </div>
    );
  }

  // Code entry view
  return (
    <div className="page">
      <div className="stars" />
      <a href="/" className="portal-home-link">&larr; Home</a>

      <div className="pregate">
        <div className="pregate-form-section">
          <h2>Use Your Golden Ticket</h2>
          <p>Enter the code from your Golden Ticket.</p>
          <form onSubmit={handleSubmit} className="pregate-form">
            <div className="form-field">
              <input
                type="text"
                required
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                placeholder="GT-XXXXXX"
                autoFocus
                style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
            </div>
            <button type="submit" className="rsvp-btn" disabled={status === 'checking'}>
              {status === 'checking' ? 'Checking...' : 'Use My Ticket'}
            </button>
            {error && <p className="pregate-error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="page"><div className="stars" /></div>}>
      <RedeemContent />
    </Suspense>
  );
}
