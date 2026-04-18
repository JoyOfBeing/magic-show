'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

function StatusBadge({ label, done, date }) {
  return (
    <div className={`history-badge ${done ? 'history-badge-done' : 'history-badge-pending'}`}>
      <span className="history-badge-icon">{done ? '\u2713' : '\u2013'}</span>
      <span className="history-badge-label">{label}</span>
      {done && date && <span className="history-badge-date">{new Date(date).toLocaleDateString()}</span>}
    </div>
  );
}

function ShowCard({ rsvp, event }) {
  let overallStatus = 'In Progress';
  if (rsvp.waiver_signed) overallStatus = 'Confirmed';
  else if (rsvp.intake_complete) overallStatus = 'Intake Complete';
  else if (rsvp.program_agreement_signed) overallStatus = 'Agreement Signed';

  return (
    <div className="history-card">
      <div className="history-card-header">
        <div>
          <h3>{event ? event.name : 'Magic Show'}</h3>
          {event && <p className="history-card-meta">{event.dates} &mdash; {event.location}</p>}
          {!event && <p className="history-card-meta">{rsvp.event}</p>}
        </div>
        <span className={`history-status ${overallStatus === 'Confirmed' ? 'history-status-confirmed' : 'history-status-progress'}`}>
          {overallStatus}
        </span>
      </div>

      <div className="history-badges">
        <StatusBadge
          label="Program Agreement"
          done={rsvp.program_agreement_signed}
          date={rsvp.program_agreement_signed_at}
        />
        <StatusBadge
          label="Church Waiver"
          done={rsvp.waiver_signed}
          date={rsvp.waiver_signed_at}
        />
        <StatusBadge
          label="Health Intake"
          done={rsvp.intake_complete}
          date={null}
        />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    const { data: rsvps, error } = await supabase
      .from('magic_show_rsvp')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      setStatus('error');
      return;
    }

    if (!rsvps || rsvps.length === 0) {
      setResults([]);
      setStatus('done');
      return;
    }

    // Get unique event IDs and fetch event details
    const eventIds = [...new Set(rsvps.map(r => r.event))];
    const { data: events } = await supabase
      .from('magic_show_events')
      .select('*')
      .in('id', eventIds);

    const eventMap = {};
    if (events) {
      events.forEach(ev => { eventMap[ev.id] = ev; });
    }

    setResults(rsvps.map(r => ({ rsvp: r, event: eventMap[r.event] || null })));
    setStatus('done');
  }

  return (
    <div className="page">
      <div className="stars" />

      <div className="history-header">
        <a href="/" className="portal-home-link">&larr; Home</a>
        <h1>My History</h1>
        <p className="history-sub">Look up your Magic Show participation history.</p>
      </div>

      <form className="history-lookup" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="Enter the email you registered with"
            autoFocus
          />
        </div>
        <button type="submit" className="rsvp-btn" disabled={status === 'loading'}>
          {status === 'loading' ? 'Looking up...' : status === 'error' ? 'Try again' : 'Look Up'}
        </button>
      </form>

      {status === 'done' && results && results.length === 0 && (
        <div className="history-empty">
          <p>No registrations found for that email.</p>
        </div>
      )}

      {status === 'done' && results && results.length > 0 && (
        <div className="history-results">
          <h2>{results.length} {results.length === 1 ? 'Show' : 'Shows'}</h2>
          {results.map(({ rsvp, event }) => (
            <ShowCard key={rsvp.id} rsvp={rsvp} event={event} />
          ))}
        </div>
      )}

      <footer className="footer">
        <a href="/" className="footer-home">Home</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
