'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const EMPTY_EVENT = {
  id: '',
  name: 'The Magic Show',
  dates: '',
  location: '',
  church: 'Joy of Being',
  venue_address: '',
  venue_image: '',
  arrival: '',
  departure: '',
  signal_group: '',
  prep_notes: '',
  invite_code: '',
  capacity: 12,
  is_live: false,
  secret: '',
  card_image: '',
};

function getFlowStatus(r) {
  if (r.program_agreement) return 'Confirmed';
  if (r.intake_complete) return 'Intake done';
  return 'Registered';
}

function getFlowStatusClass(r) {
  if (r.program_agreement) return 'roster-status-confirmed';
  if (r.intake_complete) return 'roster-status-intake';
  return 'roster-status-registered';
}

function RosterRow({ r, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const has = (v) => v && v.trim && v.trim().length > 0;
  return (
    <div className={`roster-row ${expanded ? 'roster-row-open' : ''}`}>
      <div className="roster-row-top">
        <button className="roster-row-info" onClick={() => setExpanded(e => !e)}>
          <div className="roster-name">{r.name} {expanded ? '▾' : '▸'}</div>
          <div className="roster-contact">{r.email} · {r.phone}</div>
        </button>
        <span className={`roster-status-badge ${getFlowStatusClass(r)}`}>{getFlowStatus(r)}</span>
        <button className="invite-delete" onClick={() => onDelete(r)} title="Remove">×</button>
      </div>
      {expanded && (
        <div className="roster-detail">
          {!r.intake_complete && <p className="roster-detail-empty">Intake not yet completed.</p>}
          {has(r.medical_conditions) && (
            <div className="roster-field"><strong>Medical conditions:</strong> {r.medical_conditions}</div>
          )}
          {has(r.medications) && (
            <div className="roster-field"><strong>Medications:</strong> {r.medications}</div>
          )}
          {has(r.mental_health) && (
            <div className="roster-field"><strong>Mental health:</strong> {r.mental_health}</div>
          )}
          {has(r.plant_experience) && (
            <div className="roster-field"><strong>Entheogen experience:</strong> {r.plant_experience}</div>
          )}
          {has(r.dietary) && (
            <div className="roster-field"><strong>Dietary:</strong> {r.dietary}</div>
          )}
          {has(r.emergency_name) && (
            <div className="roster-field"><strong>Emergency contact:</strong> {r.emergency_name} · {r.emergency_phone}</div>
          )}
        </div>
      )}
    </div>
  );
}

function RosterView({ event, onClose }) {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [providerCopied, setProviderCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = event.invite_code ? `${baseUrl}/show/${event.id}?code=${event.invite_code}` : null;

  async function load() {
    const { data } = await supabase
      .from('magic_show_rsvp')
      .select('*')
      .eq('event', event.id)
      .order('created_at', { ascending: false });
    setRsvps(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function copyForProvider() {
    const lines = confirmed
      .filter(r => r.intake_complete)
      .map(r => {
        const fields = [
          r.medical_conditions && `Medical: ${r.medical_conditions}`,
          r.medications && `Medications: ${r.medications}`,
          r.mental_health && `Mental health: ${r.mental_health}`,
          r.plant_experience && `Plant experience: ${r.plant_experience}`,
          r.dietary && `Dietary: ${r.dietary}`,
        ].filter(Boolean);
        return `${r.name}\n${fields.length ? fields.map(f => `  - ${f}`).join('\n') : '  - No disclosures'}`;
      })
      .join('\n\n');
    const header = `${event.name} — ${event.dates}\n${confirmed.filter(r => r.intake_complete).length} participants\n${'—'.repeat(30)}\n\n`;
    navigator.clipboard.writeText(header + lines);
    setProviderCopied(true);
    setTimeout(() => setProviderCopied(false), 2000);
  }

  async function deleteRsvp(r) {
    if (!confirm(`Remove ${r.name} (${r.email}) from this show? This frees up their spot.`)) return;
    await supabase.from('magic_show_rsvp').delete().eq('id', r.id);
    await load();
  }

  const confirmed = rsvps.filter(r => r.program_agreement);
  const inProgress = rsvps.filter(r => !r.program_agreement);

  return (
    <div className="invite-manager">
      <div className="invite-manager-header">
        <h2>Roster — {event.name}</h2>
        <button className="admin-cancel" onClick={onClose}>Close</button>
      </div>

      <div className="roster-stats">
        <div className="roster-stat">
          <div className="roster-stat-num">{confirmed.length}{event.capacity ? ` / ${event.capacity}` : ''}</div>
          <div className="roster-stat-label">Confirmed (agreement signed)</div>
        </div>
        <div className="roster-stat">
          <div className="roster-stat-num">{inProgress.length}</div>
          <div className="roster-stat-label">In progress</div>
        </div>
      </div>

      {inviteLink && (
        <div className="roster-link-row">
          <span className="invite-code">{inviteLink}</span>
          <button className="invite-copy" onClick={copyLink}>{copied ? 'Copied!' : 'Copy link'}</button>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="roster-link-row">
          <button className="invite-copy" onClick={copyForProvider}>
            {providerCopied ? 'Copied!' : 'Copy Intake for Provider'}
          </button>
        </div>
      )}

      <h3 className="roster-section-title">Confirmed</h3>
      {loading ? (
        <p>Loading...</p>
      ) : confirmed.length === 0 ? (
        <p className="admin-empty">No one confirmed yet.</p>
      ) : (
        <div className="roster-list">
          {confirmed.map(r => (
            <RosterRow key={r.id} r={r} onDelete={deleteRsvp} />
          ))}
        </div>
      )}

      {inProgress.length > 0 && (
        <>
          <h3 className="roster-section-title">In Progress</h3>
          <div className="roster-list">
            {inProgress.map(r => (
              <RosterRow key={r.id} r={r} onDelete={deleteRsvp} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === 'P@cM@n123') {
      onAuth();
    } else {
      setError(true);
    }
  }

  return (
    <div className="admin-password">
      <h1>Admin</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
        />
        <button type="submit">Enter</button>
      </form>
      {error && <p className="admin-error">Wrong password</p>}
    </div>
  );
}

function EventForm({ event, isNew, onSave, onCancel }) {
  const [form, setForm] = useState(event);
  const [status, setStatus] = useState('idle');

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.id || !form.dates || !form.location) return;
    setStatus('saving');

    if (isNew) {
      const { error } = await supabase.from('magic_show_events').insert([{
        ...form,
        invite_code: form.invite_code ? form.invite_code.toUpperCase() : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        is_live: false,
      }]);
      if (error) {
        setStatus('error');
        return;
      }
    } else {
      const { error } = await supabase.from('magic_show_events')
        .update({
          name: form.name,
          dates: form.dates,
          location: form.location,
          church: form.church,
          venue_address: form.venue_address,
          venue_image: form.venue_image,
          arrival: form.arrival,
          departure: form.departure,
          signal_group: form.signal_group,
          prep_notes: form.prep_notes,
          invite_code: form.invite_code ? form.invite_code.toUpperCase() : null,
          capacity: form.capacity ? Number(form.capacity) : null,
          secret: form.secret || null,
          card_image: form.card_image || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', form.id);
      if (error) {
        setStatus('error');
        return;
      }
    }
    setStatus('idle');
    onSave();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h2>{isNew ? 'New Magic Show' : `Edit: ${form.name}`}</h2>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label>Event ID *</label>
          <input
            type="text"
            required
            value={form.id}
            onChange={e => set('id', e.target.value)}
            placeholder="e.g. big_sky_may_2026"
            disabled={!isNew}
          />
          <span className="admin-hint">Unique slug, no spaces. Can&apos;t change after creation.</span>
        </div>
        <div className="admin-field">
          <label>Name</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="The Magic Show" />
        </div>
        <div className="admin-field">
          <label>Dates *</label>
          <input type="text" required value={form.dates} onChange={e => set('dates', e.target.value)} placeholder="May 1–3, 2026" />
        </div>
        <div className="admin-field">
          <label>Location *</label>
          <input type="text" required value={form.location} onChange={e => set('location', e.target.value)} placeholder="Big Sky, Montana" />
        </div>
        <div className="admin-field">
          <label>Church Partner</label>
          <input type="text" value={form.church} onChange={e => set('church', e.target.value)} placeholder="Joy of Being" />
        </div>
      </div>

      <div className="admin-divider">Access</div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label>Invite Code</label>
          <input type="text" value={form.invite_code} onChange={e => set('invite_code', e.target.value.toUpperCase())} placeholder="MAGIC-BIGSKY" />
          <span className="admin-hint">Shared with invited guests. Link: /show/EVENT_ID?code=CODE</span>
        </div>
        <div className="admin-field">
          <label>Capacity</label>
          <input type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="12" />
          <span className="admin-hint">Registration closes when this many people confirm.</span>
        </div>
      </div>

      <div className="admin-divider">Venue Details</div>

      <div className="admin-form-grid">
        <div className="admin-field full-width">
          <label>Venue Address</label>
          <input type="text" value={form.venue_address} onChange={e => set('venue_address', e.target.value)} placeholder="Full address" />
        </div>
        <div className="admin-field full-width">
          <label>Venue Link (Airbnb, Inspirato, etc.)</label>
          <input type="text" value={form.venue_image} onChange={e => set('venue_image', e.target.value)} placeholder="https://www.airbnb.com/rooms/..." />
        </div>
        <div className="admin-field full-width">
          <label>Card Image URL (for homepage — direct image link)</label>
          <input type="text" value={form.card_image} onChange={e => set('card_image', e.target.value)} placeholder="https://example.com/photo.jpg" />
        </div>
      </div>

      <div className="admin-divider">Schedule</div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label>Arrival</label>
          <input type="text" value={form.arrival} onChange={e => set('arrival', e.target.value)} placeholder="Thursday May 1, check-in at 2:00 PM" />
        </div>
        <div className="admin-field">
          <label>Departure</label>
          <input type="text" value={form.departure} onChange={e => set('departure', e.target.value)} placeholder="Sunday May 3, closes at 12:00 PM" />
        </div>
      </div>

      <div className="admin-divider">Communication</div>

      <div className="admin-form-grid">
        <div className="admin-field full-width">
          <label>Signal Group Link</label>
          <input type="text" value={form.signal_group} onChange={e => set('signal_group', e.target.value)} placeholder="https://signal.group/..." />
        </div>
        <div className="admin-field full-width">
          <label>Additional Prep Notes</label>
          <textarea value={form.prep_notes} onChange={e => set('prep_notes', e.target.value)} placeholder="Anything else participants should know..." rows={3} />
        </div>
        <div className="admin-field full-width">
          <label>Secret (easter egg on past show card)</label>
          <input type="text" value={form.secret} onChange={e => set('secret', e.target.value)} placeholder="One line that only reveals when someone clicks..." />
        </div>
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-save" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving...' : status === 'error' ? 'Error — Try again' : isNew ? 'Create Event' : 'Save Changes'}
        </button>
        <button type="button" className="admin-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function EventUrlRow({ eventId }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/show/${eventId}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="admin-card-url">
      <code>{url}</code>
      <button onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
    </div>
  );
}

function InviteLinkRow({ eventId, inviteCode }) {
  const [copied, setCopied] = useState(false);
  if (!inviteCode) return null;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/show/${eventId}?code=${inviteCode}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="admin-card-url">
      <code>{url}</code>
      <button onClick={copy}>{copied ? 'Copied!' : 'Copy invite link'}</button>
    </div>
  );
}

function ShowCard({ ev, onEdit, onRoster, onToggleLive, onSetNotLive, toggling }) {
  const [collapsed, setCollapsed] = useState(!ev.is_live);

  return (
    <div className={`admin-card ${ev.is_live ? 'admin-card-live' : ''}`}>
      <div className="admin-card-header" onClick={() => setCollapsed(c => !c)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="admin-collapse-arrow">{collapsed ? '▸' : '▾'}</span>
          <div>
            <h3>{ev.name}</h3>
            <div className="admin-card-details" style={{ marginTop: '0.25rem' }}>
              <span>{ev.dates}</span>
              <span>{ev.location}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {ev.is_live && <span className="admin-live-badge">LIVE</span>}
        </div>
      </div>
      {!collapsed && (
        <div className="admin-card-body">
          <p className="admin-card-id">{ev.id}</p>
          <EventUrlRow eventId={ev.id} />
          <InviteLinkRow eventId={ev.id} inviteCode={ev.invite_code} />
          <div className="admin-card-meta">
            {ev.venue_address && <span>Venue: {ev.venue_address}</span>}
            {ev.arrival && <span>Arrival: {ev.arrival}</span>}
            {ev.signal_group && <span>Signal: set</span>}
          </div>
          <div className="admin-card-actions">
            <button className="admin-edit-btn" onClick={() => onEdit(ev)}>Edit</button>
            <button className="admin-edit-btn" onClick={() => onRoster(ev)}>Roster</button>
            {ev.is_live ? (
              <button className="admin-unlive-btn" onClick={() => onSetNotLive(ev.id)} disabled={toggling}>
                Take Offline
              </button>
            ) : (
              <button className="admin-live-btn" onClick={() => onToggleLive(ev.id)} disabled={toggling}>
                Make Live
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PastShowRow({ ev, onEdit, onRoster }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="admin-past-row">
      <button className="admin-past-row-header" onClick={() => setExpanded(e => !e)}>
        <span className="admin-collapse-arrow">{expanded ? '▾' : '▸'}</span>
        <span className="admin-past-name">{ev.name}</span>
        <span className="admin-past-meta">{ev.dates} · {ev.location}</span>
      </button>
      {expanded && (
        <div className="admin-past-actions">
          <button className="admin-edit-btn" onClick={() => onEdit(ev)}>Edit</button>
          <button className="admin-edit-btn" onClick={() => onRoster(ev)}>Roster</button>
        </div>
      )}
    </div>
  );
}

function isEventPast(ev) {
  if (!ev.dates) return false;
  const yearMatch = ev.dates.match(/(\d{4})/);
  if (!yearMatch) return false;
  const year = yearMatch[1];
  const parts = ev.dates.split(/[–—-]/);
  const lastPart = parts[parts.length - 1].trim();
  const monthMatch = parts[0].trim().match(/([A-Za-z]+)/);
  const hasMonth = lastPart.match(/[A-Za-z]/);
  const dateStr = hasMonth ? lastPart : (monthMatch ? monthMatch[1] + ' ' + lastPart : lastPart);
  const fullDateStr = dateStr.match(/\d{4}/) ? dateStr : dateStr + ', ' + year;
  const endDate = new Date(fullDateStr);
  return !isNaN(endDate) && endDate < new Date();
}

function PipelineSection({ events }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('referrals');
  const [statusFilter, setStatusFilter] = useState('waiting');
  const [loading, setLoading] = useState(true);

  const eventMap = {};
  if (events) events.forEach(ev => { eventMap[ev.id] = ev; });

  async function loadPipeline() {
    const { data } = await supabase
      .from('magic_show_leads')
      .select('*')
      .eq('interest_type', 'waitlist')
      .order('created_at', { ascending: true });

    setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => { loadPipeline(); }, []);

  async function markInvited(id) {
    await supabase.from('magic_show_leads')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', id);
    loadPipeline();
  }

  function parseReferrer(details) {
    if (!details) return null;
    const match = details.match(/Referred by:\s*(.+?)(\s*\||$)/);
    return match ? match[1].trim() : null;
  }

  const referrals = entries.filter(e => e.source === 'referral');
  const general = entries.filter(e => e.source !== 'referral');
  const pool = filter === 'referrals' ? referrals : general;
  const filtered = pool.filter(e => statusFilter === 'waiting' ? !e.invited_at : !!e.invited_at);

  const waitingReferrals = referrals.filter(e => !e.invited_at).length;
  const waitingGeneral = general.filter(e => !e.invited_at).length;

  return (
    <div className="admin-pipeline">
      <div className="admin-pipeline-header">
        <h2>Incoming Requests</h2>
        <span className="admin-pipeline-count">{waitingReferrals + waitingGeneral} waiting</span>
      </div>
      <div className="admin-waitlist-filters">
        <button
          className={`admin-waitlist-filter ${filter === 'referrals' ? 'active' : ''}`}
          onClick={() => setFilter('referrals')}
        >
          Referrals ({referrals.length})
        </button>
        <button
          className={`admin-waitlist-filter ${filter === 'general' ? 'active' : ''}`}
          onClick={() => setFilter('general')}
        >
          General ({general.length})
        </button>
      </div>
      <div className="admin-waitlist-filters" style={{ marginTop: '0.25rem' }}>
        <button
          className={`admin-waitlist-filter admin-waitlist-filter-sm ${statusFilter === 'waiting' ? 'active' : ''}`}
          onClick={() => setStatusFilter('waiting')}
        >
          Waiting
        </button>
        <button
          className={`admin-waitlist-filter admin-waitlist-filter-sm ${statusFilter === 'invited' ? 'active' : ''}`}
          onClick={() => setStatusFilter('invited')}
        >
          Invited
        </button>
      </div>
      {loading && <p className="admin-waitlist-empty">Loading...</p>}
      {!loading && filtered.length === 0 && (
        <p className="admin-waitlist-empty">
          {statusFilter === 'waiting' ? 'No one waiting.' : 'No one invited yet.'}
        </p>
      )}
      {filtered.map((entry, i) => {
        const referrer = parseReferrer(entry.details);
        const ev = entry.event_id ? eventMap[entry.event_id] : null;
        return (
          <div key={entry.id} className="admin-waitlist-row">
            <div className="admin-waitlist-info">
              <div className="admin-waitlist-name">
                {statusFilter === 'waiting' && <span style={{ color: 'var(--muted)', marginRight: '0.5rem' }}>#{i + 1}</span>}
                {entry.name}
              </div>
              <div className="admin-waitlist-email">
                {entry.email} {entry.phone && `· ${entry.phone}`}
              </div>
              {ev && (
                <div className="admin-waitlist-show">Interested in: {ev.name} — {ev.dates}</div>
              )}
              {referrer && (
                <div className="admin-waitlist-referrer">via {referrer}</div>
              )}
              {entry.details && (
                <div className="admin-waitlist-details">{entry.details}</div>
              )}
            </div>
            <div className="admin-waitlist-meta">
              {statusFilter === 'waiting' && (
                <button className="admin-waitlist-invite" onClick={() => markInvited(entry.id)}>
                  Mark Invited
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmailLists() {
  const [attendeeEmails, setAttendeeEmails] = useState(null);
  const [leadEmails, setLeadEmails] = useState(null);
  const [copiedAttendees, setCopiedAttendees] = useState(false);
  const [copiedLeads, setCopiedLeads] = useState(false);

  async function loadAttendees() {
    const { data } = await supabase
      .from('magic_show_rsvp')
      .select('email')
      .order('created_at', { ascending: false });
    const unique = [...new Set((data || []).map(r => r.email))];
    setAttendeeEmails(unique);
  }

  async function loadLeads() {
    const { data } = await supabase
      .from('magic_show_leads')
      .select('email')
      .is('invited_at', null)
      .order('created_at', { ascending: false });
    const unique = [...new Set((data || []).map(r => r.email))];
    setLeadEmails(unique);
  }

  function copyAttendees() {
    navigator.clipboard.writeText(attendeeEmails.join(', '));
    setCopiedAttendees(true);
    setTimeout(() => setCopiedAttendees(false), 2000);
  }

  function copyLeads() {
    navigator.clipboard.writeText(leadEmails.join(', '));
    setCopiedLeads(true);
    setTimeout(() => setCopiedLeads(false), 2000);
  }

  return (
    <div className="admin-email-lists">
      <h2>Email Lists</h2>
      <div className="admin-email-row">
        {attendeeEmails === null ? (
          <button className="admin-edit-btn" onClick={loadAttendees}>Load Past Attendees</button>
        ) : (
          <>
            <span className="admin-email-count">{attendeeEmails.length} past attendees</span>
            <button className="admin-edit-btn" onClick={copyAttendees}>
              {copiedAttendees ? 'Copied!' : 'Copy Emails'}
            </button>
          </>
        )}
      </div>
      <div className="admin-email-row">
        {leadEmails === null ? (
          <button className="admin-edit-btn" onClick={loadLeads}>Load Pending Requests</button>
        ) : (
          <>
            <span className="admin-email-count">{leadEmails.length} pending requests</span>
            <button className="admin-edit-btn" onClick={copyLeads}>
              {copiedLeads ? 'Copied!' : 'Copy Emails'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [viewingRoster, setViewingRoster] = useState(null);
  const [toggling, setToggling] = useState(false);

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from('magic_show_events')
      .select('*')
      .order('is_live', { ascending: false })
      .order('created_at', { ascending: false });
    setEvents(data || []);
  }, []);

  useEffect(() => {
    if (authed) loadEvents();
  }, [authed, loadEvents]);

  async function toggleLive(eventId) {
    setToggling(true);
    await supabase.from('magic_show_events').update({ is_live: false }).eq('is_live', true);
    await supabase.from('magic_show_events').update({ is_live: true, updated_at: new Date().toISOString() }).eq('id', eventId);
    await loadEvents();
    setToggling(false);
  }

  async function setNotLive(eventId) {
    setToggling(true);
    await supabase.from('magic_show_events').update({ is_live: false, updated_at: new Date().toISOString() }).eq('id', eventId);
    await loadEvents();
    setToggling(false);
  }

  if (!authed) {
    return (
      <div className="page">
        <div className="stars" />
        <PasswordGate onAuth={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="stars" />

      <div className="admin-header">
        <div>
          <h1>Magic Show Admin</h1>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-preview-link">View live site &rarr;</a>
        </div>
        <button className="admin-new-btn" onClick={() => setEditing('new')}>+ New Show</button>
      </div>

      {editing ? (
        <EventForm
          event={editing === 'new' ? { ...EMPTY_EVENT } : editing}
          isNew={editing === 'new'}
          onSave={() => { setEditing(null); loadEvents(); }}
          onCancel={() => setEditing(null)}
        />
      ) : viewingRoster ? (
        <RosterView event={viewingRoster} onClose={() => setViewingRoster(null)} />
      ) : (
        <>
          {(() => {
            const current = events.filter(ev => ev.is_live || !isEventPast(ev));
            const past = events.filter(ev => !ev.is_live && isEventPast(ev));
            return (
              <>
                <div className="admin-grid">
                  {current.map(ev => (
                    <ShowCard
                      key={ev.id}
                      ev={ev}
                      onEdit={setEditing}
                      onRoster={setViewingRoster}
                      onToggleLive={toggleLive}
                      onSetNotLive={setNotLive}
                      toggling={toggling}
                    />
                  ))}
                  {events.length === 0 && (
                    <p className="admin-empty">No events yet. Create your first Magic Show.</p>
                  )}
                </div>
                {past.length > 0 && (
                  <div className="admin-past-section">
                    <h2 className="admin-past-heading">Past Shows</h2>
                    {past.map(ev => (
                      <PastShowRow
                        key={ev.id}
                        ev={ev}
                        onEdit={setEditing}
                        onRoster={setViewingRoster}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
          <PipelineSection events={events} />
          <EmailLists />
        </>
      )}
    </div>
  );
}
