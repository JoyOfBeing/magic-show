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
        items: [
          'Start shifting toward clean, whole foods — vegetables, fruits, grains, lean proteins',
          'Reduce or eliminate processed foods, refined sugar, and fried foods',
          'Avoid pork and red meat for at least 7 days before',
          'Stay well hydrated — aim for half your body weight in ounces of water daily',
        ],
      },
      {
        heading: 'Diet — 3 Days Before',
        items: [
          'Eat light, simple meals — soups, rice, steamed vegetables, fruit',
          'Eliminate alcohol, cannabis, and all recreational substances',
          'No heavy, rich, or spicy foods',
        ],
      },
      {
        heading: 'Medications — Important',
        items: [
          'SSRIs and MAOIs can have dangerous interactions with certain entheogenics. If you are on SSRIs, you MUST disclose this on your intake form and talk to us before attending',
          'Do not stop or adjust any prescribed medication without consulting your doctor',
          'Disclose ALL supplements, even those that seem harmless — St. John\'s Wort, 5-HTP, and others can interact',
          'If in doubt, ask. We\'d rather have the conversation than have a preventable incident',
        ],
      },
      {
        heading: 'Sleep & Rest',
        text: 'Show up well-rested. Prioritize 7-9 hours of sleep in the nights leading up to the show. Your nervous system will thank you.',
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
];

export default function PreparePage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="page prep-page">
      <div className="stars" />

      <div className="prep-header">
        <button className="prep-back" onClick={() => window.history.back()}>&larr; Back</button>
        <h1>Prepare for the Show</h1>
        <p>Everything you need to show up ready.</p>
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
