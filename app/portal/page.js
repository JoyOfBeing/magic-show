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

    const cleanEmail = email.trim().toLowerCase();

    // Check if this email exists in our system
    const { data: rsvps } = await supabase
      .from('magic_show_rsvp')
      .select('id')
      .eq('email', cleanEmail)
      .limit(1);

    if (!rsvps || rsvps.length === 0) {
      setErrorMsg('No account found with that email. Register for a show first.');
      setStatus('error');
      return;
    }

    const { error } = await signIn(cleanEmail);
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
    const yearMatch = event.dates.match(/(\d{4})/);
    if (yearMatch) {
      const year = yearMatch[1];
      const parts = event.dates.split(/[–—-]/);
      const lastPart = parts[parts.length - 1].trim();
      const monthMatch = parts[0].trim().match(/([A-Za-z]+)/);
      const hasMonth = lastPart.match(/[A-Za-z]/);
      const dateStr = hasMonth ? lastPart : (monthMatch ? monthMatch[1] + ' ' + lastPart : lastPart);
      const fullDateStr = dateStr.match(/\d{4}/) ? dateStr : dateStr + ', ' + year;
      const endDate = new Date(fullDateStr);
      if (!isNaN(endDate) && endDate < now) {
        timeStatus = 'completed';
      }
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

function GoldenTickets({ user, displayName, hasCompletedShow, rsvps }) {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hasCompletedShow || !rsvps?.length) return;

    async function ensureReferralSlug() {
      // Find first RSVP with a referral slug, or create one
      const withSlug = rsvps.find(r => r.referral_slug);
      if (withSlug) {
        setReferralLink(`${window.location.origin}/request?ref=${withSlug.referral_slug}`);
        return;
      }

      // Generate from name on first RSVP
      const rsvp = rsvps[0];
      const slug = (rsvp.name || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let finalSlug = slug;
      const { error } = await supabase
        .from('magic_show_rsvp')
        .update({ referral_slug: finalSlug })
        .eq('id', rsvp.id);

      if (error) {
        finalSlug = slug + '-' + Math.random().toString(36).substring(2, 6);
        await supabase
          .from('magic_show_rsvp')
          .update({ referral_slug: finalSlug })
          .eq('id', rsvp.id);
      }

      setReferralLink(`${window.location.origin}/request?ref=${finalSlug}`);
    }
    ensureReferralSlug();
  }, [hasCompletedShow, rsvps]);

  if (!hasCompletedShow) return null;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="portal-golden-ticket">
      <h2>Golden Tickets</h2>
      <p>Send your Golden Ticket link to people who are ready for this kind of experience — people who show up with an open heart, hold space for others, and can be trusted with what happens in the room.</p>

      {referralLink && (
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)', fontWeight: 600 }}>Your Golden Ticket Link</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={referralLink}
              style={{ flex: 1, fontSize: '0.9rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', color: 'var(--text-muted)' }}
              onClick={e => e.target.select()}
            />
            <button
              type="button"
              className="rsvp-btn"
              onClick={handleCopy}
              style={{ whiteSpace: 'nowrap' }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.6 }}>Share this link however you want — text, DM, email. There&apos;s no limit.</p>
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
          hasCompletedShow={shows.some(s => s.rsvp.waiver_signed || s.rsvp.intake_complete)}
          rsvps={shows.map(s => s.rsvp)}
        />
      </section>

      <section className="portal-section">
        {loading && <p className="portal-loading">Loading your shows...</p>}
        {!loading && shows.length === 0 && (
          <div className="portal-empty">
            <p>No shows yet. <Link href="/">Find a Magic Show</Link> to get started.</p>
          </div>
        )}
        {!loading && (() => {
          const now = new Date();
          const upcoming = shows.filter(({ event }) => {
            if (!event?.dates) return true;
            const yearMatch = event.dates.match(/(\d{4})/);
            if (!yearMatch) return true;
            const year = yearMatch[1];
            const parts = event.dates.split(/[–—-]/);
            const lastPart = parts[parts.length - 1].trim();
            // Extract month from the first part (e.g. "June 25" → "June")
            const monthMatch = parts[0].trim().match(/([A-Za-z]+)/);
            // If lastPart is just "28, 2025" (no month), prepend the month
            const hasMonth = lastPart.match(/[A-Za-z]/);
            const dateStr = hasMonth ? lastPart : (monthMatch ? monthMatch[1] + ' ' + lastPart : lastPart);
            // Ensure year is included
            const fullDateStr = dateStr.match(/\d{4}/) ? dateStr : dateStr + ', ' + year;
            const endDate = new Date(fullDateStr);
            return isNaN(endDate) || endDate >= now;
          });
          const past = shows.filter(s => !upcoming.includes(s));
          return (
            <>
              {upcoming.length > 0 && (
                <>
                  <h2>Upcoming Shows</h2>
                  {upcoming.map(({ rsvp, event }) => (
                    <ShowCard key={rsvp.id} rsvp={rsvp} event={event} />
                  ))}
                </>
              )}
              {past.length > 0 && (
                <>
                  <h2 style={{ marginTop: upcoming.length > 0 ? '2rem' : 0 }}>Past Shows</h2>
                  {past.map(({ rsvp, event }) => (
                    <ShowCard key={rsvp.id} rsvp={rsvp} event={event} />
                  ))}
                </>
              )}
            </>
          );
        })()}
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
