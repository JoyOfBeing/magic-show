'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';

function ShowCard({ rsvp, event }) {
  const isConfirmed = rsvp.waiver_signed;

  // Determine time-based status
  let timeStatus = 'upcoming';
  if (event && event.dates) {
    // Simple heuristic: if the dates string contains a year in the past, mark as completed
    const now = new Date();
    const dateStr = event.dates;
    // Try to parse the end date (after the dash/hyphen)
    const parts = dateStr.split(/[–—-]/);
    const lastPart = parts[parts.length - 1].trim();
    // Add year if not present
    const tryDate = lastPart.match(/\d{4}/) ? new Date(lastPart) : new Date(lastPart + ', ' + now.getFullYear());
    if (!isNaN(tryDate) && tryDate < now) {
      timeStatus = 'completed';
    }
  }

  const statusLabel = !isConfirmed ? 'Registration In Progress' : timeStatus === 'completed' ? 'Completed' : 'Upcoming';
  const statusClass = !isConfirmed ? 'history-status-progress' : timeStatus === 'completed' ? 'history-status-completed' : 'history-status-upcoming';

  // Determine the portal link
  const portalHref = event ? `/show/${event.id}` : '/big-sky';

  return (
    <div className="history-show-card">
      {event && event.venue_image && (
        <div className="history-show-image">
          <img src={event.venue_image} alt={event.name || 'Magic Show venue'} />
        </div>
      )}
      <div className="history-show-body">
        <div className="history-show-top">
          <div>
            <h3>{event ? event.name : 'The Magic Show'}</h3>
            {event && <p className="history-show-dates">{event.dates}</p>}
            {event && event.location && <p className="history-show-location">{event.location}</p>}
          </div>
          <span className={`history-status ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
        <Link href={portalHref} className="history-portal-btn">
          {isConfirmed ? 'Enter Portal' : 'Continue Registration'}
        </Link>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = '/portal';
    }
  }, [user, authLoading]);

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
        <h1>My Shows</h1>
        <p className="history-sub">Look up your Magic Show history and re-enter your portal.</p>
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
          <p>No shows found for that email.</p>
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
