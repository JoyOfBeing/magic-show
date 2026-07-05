'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RedeemPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
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

    // Valid — redirect to the ticket landing page
    window.location.href = `/ticket/${data.code}`;
  }

  return (
    <div className="page">
      <div className="stars" />
      <a href="/" className="portal-home-link">&larr; Home</a>

      <div className="pregate">
        <div className="pregate-form-section">
          <h2>Redeem Your Golden Ticket</h2>
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
              {status === 'checking' ? 'Checking...' : 'Redeem'}
            </button>
            {error && <p className="pregate-error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
