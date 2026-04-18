'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState('signing-in');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
        window.location.href = '/portal';
      } else {
        setStatus('error');
      }
    });
  }, []);

  return (
    <div className="page">
      <div className="stars" />
      <div style={{ textAlign: 'center', paddingTop: '6rem' }}>
        {status === 'signing-in' && (
          <>
            <h1 style={{ color: 'var(--gold-light)', marginBottom: '1rem' }}>Signing you in...</h1>
            <p style={{ color: 'var(--muted)' }}>One moment.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 style={{ color: 'var(--gold-light)', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: 'var(--muted)' }}>That link may have expired. <a href="/portal" style={{ color: 'var(--gold)' }}>Try again</a>.</p>
          </>
        )}
      </div>
    </div>
  );
}
