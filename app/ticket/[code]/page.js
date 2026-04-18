'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TicketPage({ params }) {
  const { code } = use(params);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveEvent, setLiveEvent] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('golden_tickets')
        .select('*')
        .eq('code', code)
        .single();
      setTicket(data);

      // Also fetch the live event for redirect
      const { data: ev } = await supabase
        .from('magic_show_events')
        .select('*')
        .eq('is_live', true)
        .single();
      setLiveEvent(ev);

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

  if (!ticket || ticket.status === 'redeemed') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="ticket-landing">
          <div className="ticket-landing-icon">&#10024;</div>
          <h1>This ticket has already been redeemed</h1>
          <p className="ticket-landing-sub">Golden tickets can only be used once. If you think this is an error, reach out to the person who sent it.</p>
          <a href="/" className="ticket-landing-cta">Visit The Magic Show</a>
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

  const isGift = ticket.type === 'gift' && ticket.stripe_payment_status === 'paid';
  const registerUrl = liveEvent ? `/big-sky?ticket=${ticket.code}` : '/';

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
          Something extraordinary is waiting for you. We can&apos;t tell you what it is &mdash; that would ruin the whole thing. All we can say is: it changed {ticket.sender_name.split(' ')[0]}, and {ticket.sender_name.split(' ')[0]} wants it for you.
        </p>

        {ticket.note && (
          <div className="ticket-landing-note">
            <div className="ticket-landing-note-label">A note from {ticket.sender_name.split(' ')[0]}:</div>
            <p>&ldquo;{ticket.note}&rdquo;</p>
          </div>
        )}

        {isGift && (
          <div className="ticket-landing-gift">
            Your seat has already been taken care of. All you have to do is show up.
          </div>
        )}

        <a href={registerUrl} className="ticket-landing-cta">
          Redeem Your Golden Ticket
        </a>

        <p className="ticket-landing-fine">
          This is a one-time, non-transferable invitation. By redeeming, you&apos;re stepping into something you can&apos;t fully understand until you&apos;re inside it. That&apos;s the point.
        </p>
      </div>
    </div>
  );
}
