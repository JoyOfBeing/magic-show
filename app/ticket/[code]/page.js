'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TicketPage({ params }) {
  const { code } = use(params);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('golden_tickets')
        .select('*')
        .eq('code', code)
        .single();

      // Check expiration (90 days)
      if (data && data.status === 'sent') {
        const age = Date.now() - new Date(data.created_at).getTime();
        if (age > 90 * 24 * 60 * 60 * 1000) {
          await supabase
            .from('golden_tickets')
            .update({ status: 'expired' })
            .eq('id', data.id);
          setExpired(true);
        }
      }
      if (data && data.status === 'expired') {
        setExpired(true);
      }

      setTicket(data);
      setLoading(false);
    }
    load();
  }, [code]);

  if (loading) {
    return (
      <div className="page">
        <div className="stars" />
      </div>
    );
  }

  if (expired) {
    return (
      <div className="page">
        <div className="stars" />
        <div className="ticket-landing">
          <div className="ticket-landing-icon">&#10024;</div>
          <h1>This ticket has expired</h1>
          <p className="ticket-landing-sub">Golden tickets are valid for 3 months. This one has returned to the person who sent it. You can still join the waitlist.</p>
          <a href="/waitlist" className="ticket-landing-cta">Join the Waitlist</a>
        </div>
      </div>
    );
  }

  if (!ticket || ticket.status === 'redeemed') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="ticket-landing">
          <div className="ticket-landing-icon">&#10024;</div>
          <h1>This ticket has already been claimed</h1>
          <p className="ticket-landing-sub">Golden tickets can only be used once. If you think this is an error, reach out to the person who sent it.</p>
          <a href="/waitlist" className="ticket-landing-cta">Join the Waitlist</a>
        </div>
      </div>
    );
  }

  if (ticket.status === 'available') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="ticket-landing">
          <div className="ticket-landing-icon">&#10024;</div>
          <h1>This ticket isn&apos;t ready yet</h1>
          <p className="ticket-landing-sub">It looks like someone is still deciding who to send this to. Check back soon.</p>
          <a href="/" className="ticket-landing-cta">Visit The Magic Show</a>
        </div>
      </div>
    );
  }

  const firstName = ticket.sender_name.split(' ')[0];

  return (
    <div className="page">
      <div className="stars" />
      <div className="ticket-landing">
        <div className="ticket-landing-glow" />

        <div className="ticket-landing-eyebrow">You&apos;ve been chosen</div>

        <h1 className="ticket-landing-title">
          {ticket.sender_name} sent you<br />a Golden Ticket
        </h1>

        <div className="ticket-landing-divider">&#10022;</div>

        <p className="ticket-landing-mystery">
          Something extraordinary is waiting for you. We can&apos;t tell you what it is &mdash; that would ruin the whole thing. All we can say is: it changed {firstName}, and {firstName} wants it for you.
        </p>

        {ticket.note && (
          <div className="ticket-landing-note">
            <div className="ticket-landing-note-label">A note from {firstName}:</div>
            <p>&ldquo;{ticket.note}&rdquo;</p>
          </div>
        )}

        <a href={`/waitlist?ticket=${ticket.code}`} className="ticket-landing-cta">
          Claim Your Spot
        </a>

        <p className="ticket-landing-fine">
          This is a one-time invitation. By claiming your spot, you&apos;ll get priority access to the waitlist for the next Magic Show.
        </p>
      </div>
    </div>
  );
}
