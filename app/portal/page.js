'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';

function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const { error } = await signIn(email.trim().toLowerCase());
    if (error) {
      setErrorMsg(error.message || 'Something went wrong');
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
        {errorMsg && <p style={{ color: '#e57373', fontSize: '0.85rem', marginTop: '0.75rem' }}>{errorMsg}</p>}
      </form>
      <p className="portal-register-note">
        Don&apos;t have an account? <Link href="/">Register for a show first</Link>.
      </p>
    </div>
  );
}

const LOCAL_IMAGES = {
  'nashville': '/nashville.jpeg',
  'minneapolis': '/minneapolis.jpg',
  'big sky': '/big-sky.jpg',
};

function getShowImage(event) {
  if (!event) return '';
  if (event.card_image) return event.card_image;
  const loc = (event.location || '').toLowerCase();
  for (const [key, path] of Object.entries(LOCAL_IMAGES)) {
    if (loc.includes(key)) return path;
  }
  return event.venue_image || '';
}

function ShowCard({ rsvp, event }) {
  const isConfirmed = rsvp.waiver_signed;
  const image = getShowImage(event);

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
      {image && (
        <div className="history-show-image">
          <img src={image} alt={event?.name || 'Magic Show venue'} />
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

const TICKETS_PER_SHOW = 3;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GT-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function SendTicketForm({ ticket, user, displayName, onSent }) {
  const [form, setForm] = useState({ name: '', email: '', note: '' });
  const [status, setStatus] = useState('idle');
  const [copied, setCopied] = useState(false);
  const [sentCode, setSentCode] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');

    const code = generateCode();

    const { error } = await supabase
      .from('golden_tickets')
      .update({
        code,
        recipient_name: form.name,
        recipient_email: form.email.trim().toLowerCase(),
        note: form.note || null,
        sender_name: displayName,
        sender_email: user.email,
        status: 'sent',
      })
      .eq('id', ticket.id);

    if (error) {
      setStatus('error');
    } else {
      setSentCode(code);
      setStatus('sent');
      onSent();
    }
  }

  if (status === 'sent' && sentCode) {
    const ticketUrl = `${window.location.origin}/ticket/${sentCode}`;
    const message = `Something extraordinary is waiting for you. I can't tell you what it is — that would ruin the whole thing. But I chose you.\n\n${ticketUrl}`;

    function handleCopy() {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }

    return (
      <div className="gt-sent-confirmation">
        <div className="gt-sent-icon">&#10024;</div>
        <h3>Golden Ticket sent to {form.name}</h3>
        <p>Share this link with them however feels right:</p>
        <div className="golden-ticket-link">
          <input type="text" readOnly value={ticketUrl} />
          <button onClick={handleCopy} className="golden-ticket-copy">
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="gt-send-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Their Name *</label>
        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First and Last" />
      </div>
      <div className="form-field">
        <label>Their Email *</label>
        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="friend@email.com" />
      </div>
      <div className="form-field">
        <label>Personal Note (they&apos;ll see this)</label>
        <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Why you chose them..." rows={2} />
      </div>
      <div className="gt-send-actions">
        <button type="submit" className="rsvp-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : status === 'error' ? 'Try again' : 'Send Golden Ticket'}
        </button>
        <button type="button" className="gt-gift-btn" disabled>
          Gift a Golden Ticket ($2,500) — Coming Soon
        </button>
      </div>
    </form>
  );
}

function GoldenTickets({ user, displayName, hasCompletedShow }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTicket, setSendingTicket] = useState(null);

  async function loadTickets() {
    const { data } = await supabase
      .from('golden_tickets')
      .select('*')
      .eq('sender_user_id', user.id)
      .order('created_at', { ascending: true });

    // Auto-expire and return sent tickets older than 90 days
    if (data) {
      for (const t of data) {
        if (t.status === 'sent') {
          const age = Date.now() - new Date(t.created_at).getTime();
          if (age > 90 * 24 * 60 * 60 * 1000) {
            await supabase.from('golden_tickets')
              .update({
                status: 'available',
                recipient_name: null,
                recipient_email: null,
                note: null,
                code: generateCode(),
              })
              .eq('id', t.id);
            t.status = 'available';
            t.recipient_name = null;
          }
        }
      }
    }

    setTickets(data || []);
    setLoading(false);
  }

  async function seedTickets() {
    // Check if user already has tickets
    const { count } = await supabase
      .from('golden_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('sender_user_id', user.id);

    if ((count === 0 || count === null) && hasCompletedShow) {
      // Seed 3 available tickets
      const newTickets = [];
      for (let i = 0; i < TICKETS_PER_SHOW; i++) {
        newTickets.push({
          code: generateCode(),
          sender_user_id: user.id,
          sender_name: displayName,
          sender_email: user.email,
          status: 'available',
          type: 'invite',
        });
      }
      await supabase.from('golden_tickets').insert(newTickets);
    }
    await loadTickets();
  }

  useEffect(() => {
    seedTickets();
  }, [user.id]);

  if (loading) return null;
  if (!hasCompletedShow) return null;

  const available = tickets.filter(t => t.status === 'available');
  const spent = tickets.filter(t => ['sent', 'redeemed', 'gifted'].includes(t.status));
  const earnedBack = tickets.filter(t => t.earned_back).length;
  const balance = available.length;

  return (
    <div className="portal-golden-ticket">
      <h2>Your Golden Tickets</h2>

      <div className="gt-balance">
        <div className="gt-ticket-icons">
          {tickets.map((t, i) => (
            <div key={t.id} className={`gt-ticket-icon ${t.status === 'available' ? 'gt-ticket-available' : 'gt-ticket-spent'}`}>
              &#9733;
            </div>
          ))}
        </div>
        <p className="gt-balance-text">
          {balance} {balance === 1 ? 'ticket' : 'tickets'} remaining
          {earnedBack > 0 && <span className="gt-earned"> (+{earnedBack} earned back)</span>}
        </p>
      </div>

      {balance > 0 && !sendingTicket && (
        <div className="gt-choose">
          <p>Choose wisely. Each ticket is an invitation into something extraordinary.</p>
          <button className="rsvp-btn" onClick={() => setSendingTicket(available[0])}>
            Send a Golden Ticket
          </button>
        </div>
      )}

      {sendingTicket && (
        <SendTicketForm
          ticket={sendingTicket}
          user={user}
          displayName={displayName}
          onSent={() => { setSendingTicket(null); loadTickets(); }}
        />
      )}

      {balance === 0 && (
        <p className="gt-empty">You&apos;ve sent all your golden tickets. When someone you invited completes a show, you&apos;ll earn one back.</p>
      )}

      {spent.length > 0 && (
        <div className="gt-sent-list">
          <h3>Sent Tickets</h3>
          {spent.map(t => (
            <div key={t.id} className="gt-sent-item">
              <div className="gt-sent-info">
                <strong>{t.recipient_name}</strong>
                <span className={`gt-sent-status gt-status-${t.status}`}>
                  {t.status === 'sent' ? 'Pending' : t.status === 'redeemed' ? 'Redeemed' : 'Gifted'}
                </span>
              </div>
              <div className="gt-sent-email">{t.recipient_email}</div>
            </div>
          ))}
        </div>
      )}
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

      // Fetch RSVPs by user_id first, fall back to email
      let { data: rsvps } = await supabase
        .from('magic_show_rsvp')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!rsvps || rsvps.length === 0) {
        // Fallback: query by email if user_id linking hasn't taken effect
        const { data: emailRsvps } = await supabase
          .from('magic_show_rsvp')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });
        rsvps = emailRsvps;
      }

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
        <GoldenTickets
          user={user}
          displayName={displayName}
          hasCompletedShow={shows.some(s => s.rsvp.waiver_signed)}
        />
      </section>

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
