'use client';

import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AGREEMENT_TEXT = [
  {
    title: 'I. Religious Practice & RFRA Acknowledgment',
    paragraphs: [
      'I, the undersigned Participant, affirm that I am a member in good standing of The JOB Church ("the Church"), a sincerely held religious organization. I understand that this ceremonial gathering ("The Magic Show") is conducted as a religious and spiritual practice of the Church, protected under the Religious Freedom Restoration Act (RFRA), 42 U.S.C. \u00a7 2000bb et seq., and the First Amendment to the United States Constitution.',
      'I acknowledge that the sacramental and ceremonial practices of the Church may include the use of entheogenic substances as part of its sincerely held religious beliefs and practices. My participation in these practices is voluntary, knowing, and an exercise of my religious freedom.',
      'I affirm that my participation in this ceremony is motivated by sincere religious and spiritual intent, not recreational purpose.',
    ],
  },
  {
    title: 'II. Assumption of Risk',
    paragraphs: [
      'I understand and acknowledge that participation in this ceremonial gathering involves inherent risks, including but not limited to: physical discomfort, nausea, emotional distress, psychological disturbance, altered states of consciousness, allergic reactions, interactions with medications, and other unforeseen physical or psychological effects.',
      'I understand that the ceremonial environment may include outdoor activities, remote locations, uneven terrain, exposure to weather, fire, and other natural elements. I voluntarily assume all risks, known and unknown, associated with my participation.',
      'I confirm that I have disclosed all relevant medical conditions, medications, mental health history, and other health information on my intake form. I understand that incomplete or inaccurate disclosure may endanger my health and safety. I affirm that all information I have provided is truthful and complete to the best of my knowledge.',
    ],
  },
  {
    title: 'III. Waiver of Liability & Indemnification',
    paragraphs: [
      'To the fullest extent permitted by law, I hereby release, waive, and forever discharge The JOB Church, its officers, directors, members, facilitators, volunteers, agents, and affiliates (collectively, "Released Parties") from any and all claims, demands, causes of action, liabilities, losses, damages, costs, and expenses (including attorney\'s fees) arising out of or related to my participation in this ceremony, including but not limited to claims of negligence, personal injury, emotional distress, property damage, or death.',
      'I agree to indemnify, defend, and hold harmless the Released Parties from any claims, lawsuits, or demands brought by me, my heirs, estate, or any third party arising from my participation in this ceremony.',
      'I understand that this waiver is intended to be as broad and inclusive as permitted by the laws of the State of Montana and that if any portion is held invalid, the remainder shall continue in full legal force and effect.',
    ],
  },
  {
    title: 'IV. Scope of Practice & Limitations',
    paragraphs: [
      'I understand that the facilitators of this ceremony are spiritual practitioners and ceremony holders. They are not licensed physicians, therapists, psychologists, psychiatrists, or medical professionals.',
      'Nothing in this ceremony constitutes medical advice, diagnosis, treatment, or a substitute for professional medical or mental health care. I take full responsibility for seeking appropriate professional support before, during, and after this experience as needed.',
      'I understand that facilitators may, in their sole discretion, limit or terminate my participation if they believe it is necessary for my safety or the safety of others.',
    ],
  },
  {
    title: 'V. Personal Responsibility & Sovereignty',
    paragraphs: [
      'I recognize myself as a sovereign being, fully responsible for my physical, emotional, mental, and spiritual experience before, during, and after the ceremony.',
      'I understand that my participation in any activity, conversation, or energetic process is my choice. I may opt in or out of any practice at any time without explanation.',
      'I understand that this experience may bring up discomfort, deep emotions, realizations, or growth edges. I commit to holding myself with compassion and agency throughout this process. I take full ownership of my actions, choices, and outcomes.',
    ],
  },
  {
    title: 'VI. Consent & Boundaries',
    paragraphs: [
      'I understand that all practices in this ceremony are voluntary. I give myself full permission to participate, pass, modify, or pause as needed.',
      'I will honor the boundaries of others and agree not to touch, counsel, or intervene in another participant\'s process without their clear and explicit consent.',
      'I understand that this is a space for presence and authenticity, not persuasion, performance, or fixing.',
    ],
  },
  {
    title: 'VII. Confidentiality',
    paragraphs: [
      'I understand that everything shared in the ceremonial space is strictly confidential. I will not share, disclose, record, or reproduce other participants\' stories, words, identities, or processes outside of this container, in any medium, at any time.',
      'I understand that the Church and its facilitators will maintain strict confidentiality about my participation and any information I have shared, except as required by law or as necessary to protect my safety or the safety of others.',
    ],
  },
  {
    title: 'VIII. Communication & Good Faith',
    paragraphs: [
      'I commit to expressing my needs, boundaries, and concerns with clarity and honesty. I will speak up if I need support.',
      'I enter this space in good faith, with openness to the unknown and respect for the wisdom unfolding in myself and others.',
      'If disagreements arise, I agree to seek resolution through honest communication and, if needed, mediation, before pursuing any other remedy.',
    ],
  },
  {
    title: 'IX. Media & Recording',
    paragraphs: [
      'I understand that I may not photograph, video, audio record, or otherwise capture any portion of the ceremony or other participants without the express written consent of the Church and all individuals depicted.',
      'Unless I explicitly opt out in writing, I consent to the Church capturing and using photographs or video of the gathering for internal and promotional purposes, understanding that my identity will not be disclosed without my separate written permission.',
    ],
  },
  {
    title: 'X. Governing Law & Dispute Resolution',
    paragraphs: [
      'This Agreement shall be governed by and construed in accordance with the laws of the State of Montana, without regard to its conflicts of law provisions.',
      'Any dispute arising out of or relating to this Agreement or my participation in the ceremony shall first be submitted to good-faith mediation. If mediation is unsuccessful, the dispute shall be resolved by binding arbitration in the State of Montana, in accordance with the rules of the American Arbitration Association. I waive my right to a jury trial.',
      'In the event any provision of this Agreement is found to be unenforceable or invalid, such provision shall be severed, and all remaining provisions shall remain in full force and effect.',
    ],
  },
  {
    title: 'XI. Acknowledgment & Electronic Signature',
    paragraphs: [
      'I have read this entire Ceremonial Agreement, Waiver of Liability, and Release of Claims. I understand its contents and sign it voluntarily. I am at least 18 years of age and legally competent to enter into this agreement.',
      'I understand that by typing my full legal name below and checking the agreement box, I am executing this document as an electronic signature, which carries the same legal force and effect as a handwritten signature pursuant to the Electronic Signatures in Global and National Commerce Act (ESIGN Act), 15 U.S.C. \u00a7 7001 et seq.',
      'I intend this Agreement to be binding upon myself, my heirs, executors, administrators, and assigns.',
    ],
  },
];

function MembershipGate({ onConfirm }) {
  const [isMember, setIsMember] = useState(null);

  return (
    <div className="membership-gate">
      <div className="gate-header">
        <h2>Before you RSVP</h2>
        <p>The Magic Show is a ceremonial gathering of The JOB Church. Participation requires active church membership.</p>
      </div>
      {isMember === null && (
        <div className="gate-options">
          <p className="gate-question">Are you a member of The JOB Church?</p>
          <div className="gate-buttons">
            <button className="gate-btn gate-btn-yes" onClick={() => setIsMember(true)}>Yes, I&apos;m a member</button>
            <button className="gate-btn gate-btn-no" onClick={() => setIsMember(false)}>Not yet</button>
          </div>
        </div>
      )}
      {isMember === true && (
        <div className="gate-confirmed">
          <p>Welcome back.</p>
          <button className="rsvp-btn" onClick={onConfirm}>Continue to RSVP</button>
        </div>
      )}
      {isMember === false && (
        <div className="gate-redirect">
          <p>No worries. Membership is required before you can attend a Magic Show. Apply below, and once you&apos;re in, come back to this page to RSVP.</p>
          <a href="https://apply.itsthejob.com" target="_blank" rel="noopener noreferrer" className="gate-apply-btn">Apply for Membership</a>
          <button className="gate-link" onClick={() => setIsMember(null)}>I just became a member</button>
        </div>
      )}
    </div>
  );
}

function RSVPForm({ onComplete }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    const { data, error } = await supabase.from('magic_show_rsvp').insert([{
      event: 'big_sky_may_2026',
      name: form.name,
      email: form.email,
      phone: form.phone,
    }]).select();
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      onComplete({ ...form, id: data[0].id });
    }
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Full legal name *</label>
        <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="As it appears on your ID" />
      </div>
      <div className="form-field">
        <label>Email *</label>
        <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />
      </div>
      <div className="form-field">
        <label>Phone *</label>
        <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 555-5555" />
      </div>
      <button type="submit" className="rsvp-btn" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Confirming...' : status === 'error' ? 'Try again' : 'Accept the Invitation'}
      </button>
    </form>
  );
}

function IntakeForm({ rsvpData, onComplete }) {
  const [form, setForm] = useState({
    medical_conditions: '',
    medications: '',
    mental_health: '',
    plant_experience: '',
    emergency_name: '',
    emergency_phone: '',
  });
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('magic_show_rsvp')
      .update({
        medical_conditions: form.medical_conditions || null,
        medications: form.medications || null,
        mental_health: form.mental_health || null,
        plant_experience: form.plant_experience || null,
        emergency_name: form.emergency_name,
        emergency_phone: form.emergency_phone,
        intake_complete: true,
      })
      .eq('id', rsvpData.id);
    if (error) {
      setStatus('error');
    } else {
      onComplete();
    }
  }

  return (
    <div className="intake">
      <div className="intake-header">
        <h2>Health & Safety Disclosure</h2>
        <p>For your safety and the safety of all participants, we need the following information. Everything here is held in strict confidence.</p>
      </div>
      <form className="intake-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Medical conditions or physical limitations</label>
          <textarea
            value={form.medical_conditions}
            onChange={e => setForm(f => ({ ...f, medical_conditions: e.target.value }))}
            placeholder="Anything we should know about — allergies, chronic conditions, injuries, dietary needs..."
            rows={3}
          />
        </div>
        <div className="form-field">
          <label>Current medications</label>
          <textarea
            value={form.medications}
            onChange={e => setForm(f => ({ ...f, medications: e.target.value }))}
            placeholder="List any medications you're currently taking, including supplements..."
            rows={3}
          />
        </div>
        <div className="form-field">
          <label>Mental health history</label>
          <textarea
            value={form.mental_health}
            onChange={e => setForm(f => ({ ...f, mental_health: e.target.value }))}
            placeholder="Any diagnoses, current treatment, or things we should be aware of..."
            rows={3}
          />
        </div>
        <div className="form-field">
          <label>Experience with entheogenics</label>
          <select
            value={form.plant_experience}
            onChange={e => setForm(f => ({ ...f, plant_experience: e.target.value }))}
          >
            <option value="">Select your experience level</option>
            <option value="curious">Curious but haven&apos;t tried</option>
            <option value="once-or-twice">Once or twice</option>
            <option value="several">Several experiences</option>
            <option value="experienced-practitioner">An experienced practitioner</option>
            <option value="experienced-facilitator">An experienced facilitator</option>
          </select>
        </div>

        <div className="intake-divider">Emergency Contact</div>

        <div className="form-row">
          <div className="form-field">
            <label>Emergency contact name *</label>
            <input
              type="text"
              required
              value={form.emergency_name}
              onChange={e => setForm(f => ({ ...f, emergency_name: e.target.value }))}
              placeholder="Full name"
            />
          </div>
          <div className="form-field">
            <label>Emergency contact phone *</label>
            <input
              type="tel"
              required
              value={form.emergency_phone}
              onChange={e => setForm(f => ({ ...f, emergency_phone: e.target.value }))}
              placeholder="(555) 555-5555"
            />
          </div>
        </div>

        <button type="submit" className="intake-btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Saving...' : status === 'error' ? 'Try again' : 'Continue to Agreement'}
        </button>
      </form>
    </div>
  );
}

function WaiverForm({ rsvpData }) {
  const [signatureName, setSignatureName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('idle');
  const docRef = useRef(null);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (signatureName.trim().toLowerCase() !== rsvpData.name.trim().toLowerCase()) {
      alert('Your signature must match the full legal name you provided during RSVP: ' + rsvpData.name);
      return;
    }
    setStatus('submitting');
    const { error } = await supabase.from('magic_show_rsvp')
      .update({
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signature_name: signatureName.trim(),
        consent: true,
      })
      .eq('id', rsvpData.id);
    setStatus(error ? 'error' : 'success');
  }

  if (status === 'success') {
    return (
      <div className="intake-complete">
        <div className="ticket ticket-mini">
          <div className="ticket-confirmed">CONFIRMED</div>
        </div>
        <h2>You&apos;re in.</h2>
        <p>Your agreement has been signed and recorded.</p>
        <p>We&apos;ll be in touch with everything you need before May 1.</p>
        <p className="intake-note">Check your email. Prepare accordingly.</p>
      </div>
    );
  }

  return (
    <div className="waiver">
      <div className="waiver-header">
        <h2>Ceremonial Agreement</h2>
        <p>Waiver of Liability, Assumption of Risk & Release of Claims</p>
        <div className="waiver-parties">
          <span>The JOB Church &mdash; Big Sky, Montana &mdash; May 1&ndash;3, 2026</span>
        </div>
      </div>

      <div className="waiver-preamble">
        <p>This Agreement is entered into between <strong>The JOB Church</strong> (&ldquo;the Church&rdquo;) and <strong>{rsvpData.name}</strong> (&ldquo;Participant&rdquo;) as a condition of participation in the ceremonial gathering known as The Magic Show.</p>
        <p>This Agreement is a co-created foundation for the ceremonial container we are entering together. It is rooted in mutual respect, trust, sovereignty, shared intention, and the sincerely held religious beliefs and practices of the Church.</p>
      </div>

      <div className="waiver-document" ref={docRef}>
        {AGREEMENT_TEXT.map((section, i) => (
          <div key={i} className="waiver-section">
            <h3>{section.title}</h3>
            {section.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        ))}
      </div>

      <form className="waiver-sign-form" onSubmit={handleSubmit}>
        <div className="waiver-sign-header">
          <h3>Sign Below</h3>
          <p>By typing your full legal name exactly as provided during RSVP, you are executing this agreement as a legally binding electronic signature.</p>
        </div>

        <div className="form-field">
          <label>Participant: {rsvpData.name}</label>
          <div className="waiver-meta">Date: {today}</div>
        </div>

        <div className="form-field">
          <label>Type your full legal name to sign *</label>
          <input
            type="text"
            required
            value={signatureName}
            onChange={e => setSignatureName(e.target.value)}
            placeholder={rsvpData.name}
            className="signature-input"
          />
        </div>

        <div className="form-field consent-field">
          <label className="consent-label">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span>
              I have read this entire Ceremonial Agreement, Waiver of Liability, and Release of Claims in full. I understand its terms, I agree to be bound by them, and I sign voluntarily. I am at least 18 years of age.
            </span>
          </label>
        </div>

        <button type="submit" className="intake-btn" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Recording signature...' : status === 'error' ? 'Try again' : 'Sign & Complete Registration'}
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState('gate'); // gate → rsvp → intake → waiver
  const [rsvpData, setRsvpData] = useState(null);

  function handleMemberConfirm() {
    setStep('rsvp');
  }

  function handleRSVP(data) {
    setRsvpData(data);
    setStep('intake');
  }

  function handleIntakeComplete() {
    setStep('waiver');
  }

  return (
    <div className="page">
      <div className="stars" />

      {/* ===== GOLDEN TICKET (shows on gate + rsvp) ===== */}
      {(step === 'gate' || step === 'rsvp') && (
        <div className="ticket-wrapper">
          <div className="ticket">
            <div className="ticket-edge ticket-edge-left" />
            <div className="ticket-inner">
              <div className="ticket-eyebrow">You&apos;ve been invited to</div>
              <h1 className="ticket-title">The Magic Show</h1>
              <div className="ticket-details">
                <div className="ticket-detail">
                  <span className="detail-label">When</span>
                  <span className="detail-value">May 1&ndash;3, 2026</span>
                </div>
                <div className="ticket-detail">
                  <span className="detail-label">Where</span>
                  <span className="detail-value">Big Sky, Montana</span>
                </div>
              </div>
              <div className="ticket-tagline">This is not a retreat. This is not a conference.<br />This is something else entirely.</div>
              <div className="ticket-admit">ADMIT ONE</div>
            </div>
            <div className="ticket-edge ticket-edge-right" />
          </div>
        </div>
      )}

      {/* ===== STEP INDICATOR ===== */}
      {step !== 'gate' && (
        <div className="step-indicator">
          <div className={`step-dot ${step === 'rsvp' ? 'active' : 'done'}`}><span>1</span></div>
          <div className="step-line" />
          <div className={`step-dot ${step === 'intake' ? 'active' : step === 'waiver' ? 'done' : ''}`}><span>2</span></div>
          <div className="step-line" />
          <div className={`step-dot ${step === 'waiver' ? 'active' : ''}`}><span>3</span></div>
        </div>
      )}

      {/* ===== MEMBERSHIP GATE ===== */}
      {step === 'gate' && <MembershipGate onConfirm={handleMemberConfirm} />}

      {/* ===== RSVP ===== */}
      {step === 'rsvp' && (
        <div className="rsvp-section">
          <h2 className="rsvp-heading">RSVP</h2>
          <p className="rsvp-sub">Spots are limited. This invitation is non-transferable.</p>
          <RSVPForm onComplete={handleRSVP} />
        </div>
      )}

      {/* ===== INTAKE ===== */}
      {step === 'intake' && <IntakeForm rsvpData={rsvpData} onComplete={handleIntakeComplete} />}

      {/* ===== WAIVER ===== */}
      {step === 'waiver' && <WaiverForm rsvpData={rsvpData} />}

      <footer className="footer">
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
