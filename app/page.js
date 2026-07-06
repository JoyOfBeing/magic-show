'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';

function PastShowCard({ image, city, name, dates, secret }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={`show-card show-card-past ${secret ? 'show-card-clickable' : ''}`}
      onClick={() => secret && setRevealed(r => !r)}
    >
      <img src={image} alt={city} className="show-card-image" />
      <div className="show-card-body">
        <div className="show-card-city">{city}</div>
        <div className="show-card-name">{name}</div>
        {dates && <div className="show-card-dates">{dates}</div>}
        {revealed && secret && (
          <div className="show-card-secret">{secret}</div>
        )}
      </div>
    </div>
  );
}

const LOCAL_IMAGES = {
  'nashville': '/nashville.jpeg',
  'minneapolis': '/minneapolis.jpg',
  'big sky': '/big-sky.jpg',
};

function getShowImage(show) {
  if (show.card_image) return show.card_image;
  // Match location to local images
  const loc = (show.location || '').toLowerCase();
  for (const [key, path] of Object.entries(LOCAL_IMAGES)) {
    if (loc.includes(key)) return path;
  }
  return show.venue_image || '';
}

function getEventEndDate(dates) {
  if (!dates) return null;
  const yearMatch = dates.match(/(\d{4})/);
  if (!yearMatch) return null;
  const year = yearMatch[1];
  const parts = dates.split(/[–—-]/);
  const lastPart = parts[parts.length - 1].trim();
  const monthMatch = parts[0].trim().match(/([A-Za-z]+)/);
  const hasMonth = lastPart.match(/[A-Za-z]/);
  const dateStr = hasMonth ? lastPart : (monthMatch ? monthMatch[1] + ' ' + lastPart : lastPart);
  const fullDateStr = dateStr.match(/\d{4}/) ? dateStr : dateStr + ', ' + year;
  const d = new Date(fullDateStr);
  return isNaN(d) ? null : d;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from('magic_show_events')
          .select('*');
        if (error) console.error('Events error:', error);
        const all = data || [];
        const now = new Date();

        const upcoming = all.filter(ev => {
          const end = getEventEndDate(ev.dates);
          return !end || end >= now;
        });
        const past = all.filter(ev => {
          const end = getEventEndDate(ev.dates);
          return end && end < now;
        });

        // Sort upcoming by date ascending (soonest first)
        upcoming.sort((a, b) => (getEventEndDate(a.dates)?.getTime() || 0) - (getEventEndDate(b.dates)?.getTime() || 0));
        // Sort past by date descending (most recent first)
        past.sort((a, b) => (getEventEndDate(b.dates)?.getTime() || 0) - (getEventEndDate(a.dates)?.getTime() || 0));

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (err) {
        console.error('Failed to load events:', err);
      }
      setEventsLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <div className="page home-page">
      <div className="stars" />

      <nav className="home-nav">
        <a href="/host" className="home-nav-link">Host a Show</a>
        {!authLoading && (
          <a href="/portal" className="home-nav-link">Login</a>
        )}
      </nav>

      <header className="home-hero">
        <div className="home-eyebrow">By invitation only</div>
        <h1 className="home-title">The Magic Show</h1>
        <p className="home-sub">
          The Magic Show is an immersive, transformational container. You must have a Golden Ticket to enter.
        </p>
        <div className="home-hero-ctas">
          <a href="/request" className="cta-btn cta-btn-secondary">Request a Golden Ticket</a>
          <a href="/redeem" className="cta-btn cta-btn-primary">Use Your Golden Ticket</a>
        </div>
      </header>



      {!eventsLoading && upcomingEvents.length > 0 && (
        <section className="home-section">
          <div className="home-section-label">Upcoming Shows</div>
          {upcomingEvents.map(ev => (
            <a key={ev.id} href={`/show/${ev.id}`} className="show-card show-card-open">
              <img src={getShowImage(ev)} alt={ev.location} className="show-card-image" />
              <div className="show-card-body">
                <div className="show-card-city">{ev.location}</div>
                <div className="show-card-name">{ev.name}</div>
                <div className="show-card-dates">{ev.dates}</div>
                <div className="show-card-cta">Enter &rarr;</div>
              </div>
            </a>
          ))}
        </section>
      )}

      {!eventsLoading && pastEvents.length > 0 && (
        <section className="home-section">
          <div className="home-section-label">Past Shows</div>
          <div className="show-grid">
            {pastEvents.map(show => (
              <PastShowCard
                key={show.id}
                image={getShowImage(show)}
                city={show.location}
                name={show.name}
                dates={show.dates}
                secret={show.secret}
              />
            ))}
          </div>
        </section>
      )}

      {!user && (
        <section className="home-cta">
          <h2>Want in on the magic?</h2>
          <p>
            The only way in is a Golden Ticket from someone who&apos;s been. Don&apos;t know anyone? Join the waitlist &mdash; if it&apos;s meant to be, the magic will find you.
          </p>
          <div className="home-cta-buttons">
            <a href="/waitlist" className="cta-btn cta-btn-primary">
              Get on the Waitlist
            </a>
            <a href="/host" className="cta-btn cta-btn-secondary">
              Host a Show
            </a>
          </div>
        </section>
      )}

      <footer className="footer">
        <a href="/portal">Login</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
