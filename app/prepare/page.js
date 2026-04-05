'use client';

import { useState } from 'react';

const SECTIONS = [
  {
    id: 'overview',
    icon: '~',
    title: 'Overview',
    content: [
      {
        heading: 'What to Expect',
        text: 'The Magic Show is a multi-day emergent experience. Your only job is to show up.',
      },
      {
        heading: 'The Container',
        text: 'From the moment you arrive until the moment you leave, you\'re the show. Just be yourself, it\'s not that hard. Or is it? We\'ll be in a beautiful space with a private chef. We\'ll explore the intersection of creativity, community, and consciousness. How you participate is completely up to you.',
      },
    ],
  },
  {
    id: 'body',
    icon: '~',
    title: 'Prepare Your Body',
    content: [
      {
        heading: 'Diet — 2 Weeks Before',
        text: 'Cut: Minimize caffeine and alcohol',
      },
      {
        heading: 'Diet — 3 Days Before',
        items: [
          'Cut: Eliminate caffeine if possible, or reduce to minimal',
          'Cut: Fast or eat very lightly the day of (details provided by your guides)',
        ],
      },
      {
        heading: 'Sleep & Rest',
        text: 'Cut: You\'re going to need the bandwidth.',
      },
    ],
  },
  {
    id: 'spirit',
    icon: '~',
    title: 'Prepare Your Spirit',
    content: [
      {
        heading: 'Set Your Intention',
        text: 'Even though you hardly know what the Magic Show is \u2013 you said yes. Why did you say yes? What are you open to? What are you looking for?',
      },
      {
        heading: 'Slow Down',
        text: 'Leading up to the event, give yourself permission to start unwinding. Less screen time. More nature. Start arriving before you arrive, ya feel?',
      },
      {
        heading: 'Release Expectations',
        text: 'Maybe you\'ve heard someone else\'s experience of the Magic Show. Maybe you\'ve built a whole story around what it\'ll be. Drop it. The experience you need is almost never the one you imagined.',
      },
      {
        heading: 'Know Your Edges',
        text: 'Think about your boundaries before you get here. What feels safe? Where are your edges? You have full permission to participate, pause, or pass at any time. No explanation needed. Knowing your own limits is part of the magic, not a limitation of it.',
      },
    ],
  },
  {
    id: 'bring',
    icon: '~',
    title: 'What to Bring',
    content: [
      {
        heading: 'Essentials',
        items: [
          'Comfortable, layered clothing (temperatures may vary)',
          'A journal and pen',
          'Toiletries and any personal care items',
          'Any prescribed medications you need',
          'A water bottle',
          'An open heart',
        ],
      },
      {
        heading: 'Optional',
        items: [
          'A personal object that means something to you',
          'Eye mask for rest',
          'Earplugs for sleep',
          'Warm socks and slippers',
          'Art supplies if that\'s how you process',
        ],
      },
      {
        heading: 'Leave Behind',
        items: [
          'Work devices',
          'Expectations and timelines',
          'The need to document everything — be present, not performing',
        ],
      },
    ],
  },
  {
    id: 'integration',
    icon: '~',
    title: 'Integration',
    content: [
      {
        heading: 'What is Integration?',
        text: 'Integration is what happens when the show ends and real life sets back in. It\'s the process of how you weave together what you experienced \u2014 the existential insights, the unexpected feelings, and the stuff you can\'t quite name \u2014 into your actual day-to-day. The show kicks open the door. Integration is how you walk through it.',
      },
      {
        heading: 'The First 48 Hours',
        items: [
          'Move slowly. Give yourself permission to do absolutely nothing',
          'Avoid making major life decisions (seriously)',
          'Stay off social media — protect the space you\'ve opened',
          'Eat nourishing, simple food',
          'Drink plenty of water',
          'Journal or record voice memos while it\'s fresh — you\'ll forget more than you think',
        ],
      },
      {
        heading: 'The First Two Weeks',
        items: [
          'Keep eating clean — your body is still processing',
          'Continue journaling, even when it feels repetitive',
          'Spend time outside',
          'Talk to people who get it — your Signal group is there for a reason',
          'Notice what\'s shifted in how you see, feel, and respond to daily life',
          'Be patient with yourself. Integration is not linear. Some days feel like breakthroughs, some feel like backslides. Both are the work.',
        ],
      },
      {
        heading: 'Ongoing',
        items: [
          'Consider working with a therapist or integration coach who understands these experiences',
          'Stay connected to the community — you don\'t have to figure this out alone',
          'Revisit your journal entries from time to time — you\'ll see things you missed',
          'Pay attention to your dreams',
          'Practice what you learned. The show was the spark — your life is the magic',
        ],
      },
      {
        heading: 'When to Reach Out',
        text: 'Outside of our group Signal thread, if you\'re experiencing persistent anxiety, confusion, or difficulty functioning after the experience, reach out to us or to a mental health professional. Everyone processes transformation differently. If this happens, think of it as a sign you\'re processing something significant and that you deserve support doing it.',
      },
    ],
  },
];

export default function PreparePage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="page prep-page">
      <div className="stars" />

      <div className="prep-header">
        <a href="/" className="prep-back">&larr; Back</a>
        <h1>Preparation & Integration</h1>
        <p>Everything you need to show up ready and take it home with you.</p>
      </div>

      <nav className="prep-nav">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`prep-nav-btn ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.title}
          </button>
        ))}
      </nav>

      <div className="prep-content">
        {SECTIONS.filter(s => s.id === activeSection).map(section => (
          <div key={section.id} className="prep-section">
            {section.content.map((block, i) => (
              <div key={i} className="prep-block">
                <h3>{block.heading}</h3>
                {block.text && <p>{block.text}</p>}
                {block.items && (
                  <ul>
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <footer className="footer">
        <a href="https://itsthejob.vercel.app" target="_blank" rel="noopener noreferrer">J.O.B.</a>
      </footer>
    </div>
  );
}
