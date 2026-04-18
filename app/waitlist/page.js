'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';

function WaitlistContent() {
  const searchParams = useSearchParams();
  const ticketCode = searchParams.get('ticket');

  const [ticket, setTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(!!ticketCode);
  const [ticketError, setTicketError] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState('idle');
  const [position, setPosition] = useState(null);
  const [totalWaiting, setTotalWaiting] = useState(null);

  // Load social proof count on mount
  useEffect(() => {
    async function loadCount() {
      const { count } = await supabase
        .from('magic_show_leads')
        .select('*', { count: 'exact', head: true })
        .eq('interest_type', 'waitlist')
        .is('invited_at', null);
      setTotalWaiting(count || 0);
    }
    loadCount();
  }, []);

  // Validate golden ticket if present
  useEffect(() => {
    if (!ticketCode) return;

    async function validateTicket() {
      const { data } = await supabase
        .from('golden_tickets')
        .select('*')
        .eq('code', ticketCode)
        .single();

      if (!data) {
        setTicketError('not_found');
      } else if (data.status === 'redeemed') {
        setTicketError('redeemed');
      } else if (data.status === 'available') {
        setTicketError('not_ready');
      } else if (data.status === 'expired') {
        setTicketError('expired');
      } else {
        // Check expiration (90 days)
        const age = Date.now() - new Date(data.created_at).getTime();
        if (age > 90 * 24 * 60 * 60 * 1000) {
          await supabase
            .from('golden_tickets')
            .update({ status: 'expired' })
            .eq('id', data.id);
          setTicketError('expired');
        } else {
          setTicket(data);
          setForm(f => ({
            ...f,
            name: data.recipient_name || '',
            email: data.recipient_email || '',
          }));
        }
      }
      setTicketLoading(false);
    }
    validateTicket();
  }, [ticketCode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    const isGoldenTicket = !!ticket;

    // Insert into waitlist
    const { error } = await supabase.from('magic_show_leads').insert([{
      name: form.name,
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      interest_type: 'waitlist',
      source: isGoldenTicket ? 'golden_ticket' : 'organic',
      ticket_code: isGoldenTicket ? ticket.code : null,
    }]);

    if (error) {
      setStatus('error');
      return;
    }

    // Mark golden ticket as redeemed
    if (isGoldenTicket) {
      await supabase
        .from('golden_tickets')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', ticket.id);
    }

    // Calculate position
    const { data: waitlist } = await supabase
      .from('magic_show_leads')
      .select('email, source, created_at')
      .eq('interest_type', 'waitlist')
      .is('invited_at', null)
      .order('created_at', { ascending: true });

    if (waitlist) {
      // Sort: golden ticket holders first, then by date
      const sorted = waitlist.sort((a, b) => {
        if (a.source === 'golden_ticket' && b.source !== 'golden_ticket') return -1;
        if (a.source !== 'golden_ticket' && b.source === 'golden_ticket') return 1;
        return new Date(a.created_at) - new Date(b.created_at);
      });

      const idx = sorted.findIndex(w => w.email === form.email.trim().toLowerCase());
      setPosition(idx + 1);
      setTotalWaiting(sorted.length);
    }

    setStatus('success');
  }

  if (ticketLoading) {
    return (
      <div className="page">
        <div className="stars" />
      </div>
    );
  }

  // Ticket error states
  if (ticketError) {
    const messages = {
      not_found: { title: 'Ticket not found', sub: 'This golden ticket doesn\u2019t exist. Check the link and try again.' },
      redeemed: { title: 'Already claimed', sub: 'This golden ticket has already been used to join the waitlist.' },
      not_ready: { title: 'Not ready yet', sub: 'This ticket hasn\u2019t been sent to anyone yet. Check back soon.' },
      expired: { title: 'This ticket has expired', sub: 'Golden tickets are valid for 3 months. This one has returned to the person who sent it.' },
    };
    const msg = messages[ticketError] || messages.not_found;

    return (
      <div className="page">
        <div className="stars" />
        <div className="waitlist-error">
          <div className="waitlist-error-icon">&#10024;</div>
          <h1>{msg.title}</h1>
          <p>{msg.sub}</p>
          <a href="/" className="waitlist-home-link">Visit The Magic Show</a>
        </div>
      </div>
    );
  }

  // Success state — show position
  if (status === 'success') {
    return (
      <div className="page">
        <div className="stars" />
        <div className="waitlist-success">
          <div className="waitlist-success-glow" />
          <div className="waitlist-success-icon">&#10024;</div>
          <h1>You&apos;re on the list</h1>
          {position && totalWaiting && (
            <div className="waitlist-position">
              <div className="waitlist-position-number">#{position}</div>
              <p>{totalWaiting} {totalWaiting === 1 ? 'person is' : 'people are'} waiting for an invitation.</p>
            </div>
          )}
          {ticket && (
            <p className="waitlist-priority">
              {ticket.sender_name.split(' ')[0]} gave you priority access. You&apos;re ahead of the line.
            </p>
          )}
          <p className="waitlist-next">
            We&apos;ll reach out when a door opens. Until then, the less you know, the better.
          </p>
          <a href="/" className="waitlist-home-link">&larr; Back to The Magic Show</a>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="page">
      <div className="stars" />
      <a href="/" className="portal-home-link">&larr; Home</a>

      <div className="waitlist-form-container">
        <div className="waitlist-form-glow" />

        {ticket ? (
          <>
            <div className="waitlist-eyebrow">Golden Ticket</div>
            <h1 className="waitlist-title">Claim Your Spot</h1>
            <p className="waitlist-sub">
              {ticket.sender_name.split(' ')[0]} chose you for something extraordinary. Confirm your details to join the waitlist with priority access.
            </p>
          </>
        ) : (
          <>
            <div className="waitlist-eyebrow">By invitation only</div>
            <h1 className="waitlist-title">Get on the Waitlist</h1>
            <p className="waitlist-sub">
              The Magic Show is invite-only. Join the waitlist and we&apos;ll reach out when a door opens. The less you know, the better.
            </p>
          </>
        )}

        {totalWaiting > 0 && (
          <p className="waitlist-social-proof">
            {totalWaiting} {totalWaiting === 1 ? 'person is' : 'people are'} already waiting.
          </p>
        )}

        <form className="waitlist-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="First and Last"
            />
          </div>
          <div className="form-field">
            <label>Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com"
            />
          </div>
          <div className="form-field">
            <label>Phone *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="(555) 555-5555"
            />
          </div>
          <button type="submit" className="rsvp-btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Joining...' : status === 'error' ? 'Try again' : ticket ? 'Claim Your Spot' : 'Join the Waitlist'}
          </button>
        </form>

        <p className="waitlist-fine">
          By joining, you&apos;re stepping toward something you can&apos;t fully understand until you&apos;re inside it. That&apos;s the point.
        </p>
      </div>

      <footer className="footer">
        <a href="/" className="footer-home">Home</a>
        <span className="footer-sep">&middot;</span>
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="page"><div className="stars" /></div>}>
      <WaitlistContent />
    </Suspense>
  );
}
