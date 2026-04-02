'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const EMPTY_EVENT = {
  id: '',
  name: 'The Magic Show',
  dates: '',
  location: '',
  church: 'J.O.B. Church',
  venue_name: '',
  venue_address: '',
  venue_image: '',
  arrival: '',
  departure: '',
  signal_group: '',
  prep_notes: '',
  is_live: false,
};

function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
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
          venue_name: form.venue_name,
          venue_address: form.venue_address,
          venue_image: form.venue_image,
          arrival: form.arrival,
          departure: form.departure,
          signal_group: form.signal_group,
          prep_notes: form.prep_notes,
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
          <input type="text" value={form.church} onChange={e => set('church', e.target.value)} placeholder="J.O.B. Church" />
        </div>
      </div>

      <div className="admin-divider">Venue Details</div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label>Venue Name</label>
          <input type="text" value={form.venue_name} onChange={e => set('venue_name', e.target.value)} placeholder="e.g. Lone Mountain Ranch" />
        </div>
        <div className="admin-field">
          <label>Venue Address</label>
          <input type="text" value={form.venue_address} onChange={e => set('venue_address', e.target.value)} placeholder="Full address" />
        </div>
        <div className="admin-field full-width">
          <label>Venue Image URL</label>
          <input type="text" value={form.venue_image} onChange={e => set('venue_image', e.target.value)} placeholder="https://..." />
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

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null); // event object or 'new'
  const [toggling, setToggling] = useState(false);

  const loadEvents = useCallback(async () => {
    const { data } = await supabase
      .from('magic_show_events')
      .select('*')
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
        <h1>Magic Show Admin</h1>
        <button className="admin-new-btn" onClick={() => setEditing('new')}>+ New Show</button>
      </div>

      {editing ? (
        <EventForm
          event={editing === 'new' ? { ...EMPTY_EVENT } : editing}
          isNew={editing === 'new'}
          onSave={() => { setEditing(null); loadEvents(); }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="admin-grid">
          {events.map(ev => (
            <div key={ev.id} className={`admin-card ${ev.is_live ? 'admin-card-live' : ''}`}>
              <div className="admin-card-header">
                <div>
                  <h3>{ev.name}</h3>
                  <p className="admin-card-id">{ev.id}</p>
                </div>
                {ev.is_live && <span className="admin-live-badge">LIVE</span>}
              </div>
              <div className="admin-card-details">
                <span>{ev.dates}</span>
                <span>{ev.location}</span>
              </div>
              <div className="admin-card-meta">
                {ev.venue_name && <span>Venue: {ev.venue_name}</span>}
                {ev.arrival && <span>Arrival: {ev.arrival}</span>}
                {ev.signal_group && <span>Signal: set</span>}
              </div>
              <div className="admin-card-actions">
                <button className="admin-edit-btn" onClick={() => setEditing(ev)}>Edit</button>
                {ev.is_live ? (
                  <button className="admin-unlive-btn" onClick={() => setNotLive(ev.id)} disabled={toggling}>
                    Take Offline
                  </button>
                ) : (
                  <button className="admin-live-btn" onClick={() => toggleLive(ev.id)} disabled={toggling}>
                    Make Live
                  </button>
                )}
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="admin-empty">No events yet. Create your first Magic Show.</p>
          )}
        </div>
      )}
    </div>
  );
}
