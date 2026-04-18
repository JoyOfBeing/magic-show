'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await signIn(email.trim().toLowerCase());
    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  if (status === 'sent') {
    return (
      <div className="portal-login">
        <div className="portal-sent">
          <h2>Check your email</h2>
          <p>We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
          <p className="portal-sent-note">Don&apos;t see it? Check your spam folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-login">
      <h2>Sign In</h2>
      <p className="portal-login-sub">Enter the email you registered with and we&apos;ll send you a magic link.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoFocus
          />
        </div>
        <button type="submit" className="rsvp-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : status === 'error' ? 'Try again' : 'Send Magic Link'}
        </button>
      </form>
      <p className="portal-register-note">
        Don&apos;t have an account? <Link href="/">Register for a show first</Link>.
      </p>
    </div>
  );
}

function ShowCard({ rsvp, event }) {
  const isConfirmed = rsvp.waiver_signed;

  let timeStatus = 'upcoming';
  if (event && event.dates) {
    const now = new Date();
    const parts = event.dates.split(/[–—-]/);
    const lastPart = parts[parts.length - 1].trim();
    const tryDate = lastPart.match(/\d{4}/) ? new Date(lastPart) : new Date(lastPart + ', ' + now.getFullYear());
    if (!isNaN(tryDate) && tryDate < now) {
      timeStatus = 'completed';
    }
  }

  const statusLabel = !isConfirmed ? 'Registration In Progress' : timeStatus === 'completed' ? 'Completed' : 'Upcoming';
  const statusClass = !isConfirmed ? 'history-status-progress' : timeStatus === 'completed' ? 'history-status-completed' : 'history-status-upcoming';
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

function GoldenTicket() {
  const [liveEvent, setLiveEvent] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase
      .from('magic_show_events')
      .select('*')
      .eq('is_live', true)
      .single()
      .then(({ data }) => setLiveEvent(data));
  }, []);

  if (!liveEvent || !liveEvent.invite_code) return null;

  const inviteUrl = `${window.location.origin}/big-sky?code=${liveEvent.invite_code}`;

  function handleCopy() {
    const message = `You've been invited to The Magic Show.\n\n${liveEvent.name} — ${liveEvent.dates}, ${liveEvent.location}\n\nUse this link to register:\n${inviteUrl}`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="portal-golden-ticket">
      <h2>Send a Friend a Golden Ticket</h2>
      <p>Know someone who should experience this? Copy the invite and send it however feels right — text, DM, carrier pigeon.</p>
      <div className="golden-ticket-card">
        <div className="golden-ticket-show">
          <strong>{liveEvent.name}</strong>
          <span>{liveEvent.dates} — {liveEvent.location}</span>
        </div>
        <div className="golden-ticket-link">
          <input type="text" readOnly value={inviteUrl} />
          <button onClick={handleCopy} className="golden-ticket-copy">
            {copied ? 'Copied!' : 'Copy Invite'}
          </button>
        </div>
        <p className="golden-ticket-hint">This copies a ready-to-send message with the invite link.</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    async function loadShows() {
      // Auto-link any unlinked RSVPs
      await supabase
        .from('magic_show_rsvp')
        .update({ user_id: user.id })
        .eq('email', user.email)
        .is('user_id', null);

      // Fetch all RSVPs for this user
      const { data: rsvps } = await supabase
        .from('magic_show_rsvp')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!rsvps || rsvps.length === 0) {
        setLoading(false);
        return;
      }

      // Use first RSVP name as display name
      setDisplayName(rsvps[0].name);

      // Fetch events
      const eventIds = [...new Set(rsvps.map(r => r.event))];
      const { data: events } = await supabase
        .from('magic_show_events')
        .select('*')
        .in('id', eventIds);

      const eventMap = {};
      if (events) events.forEach(ev => { eventMap[ev.id] = ev; });

      setShows(rsvps.map(r => ({ rsvp: r, event: eventMap[r.event] || null })));
      setLoading(false);
    }

    loadShows();
  }, [user]);

  return (
    <div className="portal-dashboard">
      <div className="portal-header">
        <div>
          <h1>My Portal</h1>
          {displayName && <p className="portal-welcome">Welcome back, {displayName}</p>}
        </div>
        <button onClick={signOut} className="portal-signout">Sign Out</button>
      </div>

      <section className="portal-section">
        <h2>Your Shows</h2>
        {loading && <p className="portal-loading">Loading your shows...</p>}
        {!loading && shows.length === 0 && (
          <div className="portal-empty">
            <p>No shows yet. <Link href="/">Find a Magic Show</Link> to get started.</p>
          </div>
        )}
        {!loading && shows.map(({ rsvp, event }) => (
          <ShowCard key={rsvp.id} rsvp={rsvp} event={event} />
        ))}
      </section>

      <section className="portal-section">
        <GoldenTicket />
      </section>
    </div>
  );
}

export default function PortalPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <div className="stars" />
        <div style={{ textAlign: 'center', paddingTop: '6rem' }}>
          <p style={{ color: 'var(--muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="stars" />
      <a href="/" className="portal-home-link">&larr; Home</a>
      {user ? <Dashboard /> : <LoginForm />}
      <footer className="footer">
        <a href="/" className="footer-home">Home</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
