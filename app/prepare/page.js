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
        text: 'The Magic Show is a multi-day experience that defies easy categorization. You\'ll move through ceremonies, play, stillness, weirdness, movement, laughter, and connection — some of it planned, some of it not. The whole thing is held by people who\'ve done this before. Your only job is to show up.',
      },
      {
        heading: 'The Container',
        text: 'From the moment you arrive until the moment you leave, you\'re inside the show. That doesn\'t mean everything is intense — it means everything is on purpose. The meals, the silence, the strange conversations at 2 AM, the walk you take alone — it\'s all part of it. Let it be.',
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
          'Minimize caffeine and alcohol',
          'Avoid pork and red meat for at least 7 days before',
          'Stay well hydrated — aim for half your body weight in ounces of water daily',
        ],
      },
      {
        heading: 'Diet — 3 Days Before',
        items: [
          'Eat light, simple meals — soups, rice, steamed vegetables, fruit',
          'Eliminate alcohol, cannabis, and all recreational substances',
          'Eliminate caffeine if possible, or reduce to minimal',
          'No heavy, rich, or spicy foods',
          'Fast or eat very lightly the day of (details provided by your guides)',
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
        text: 'Show up well-rested. Prioritize 7-9 hours of sleep in the nights leading up to the show. Your nervous system will thank you. You\'re going to need the bandwidth.',
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
        text: 'What are you actually here for? Not the polished answer — the real one. Spend some time before arrival journaling, sitting quietly, or just letting the question breathe: What am I ready to meet?',
      },
      {
        heading: 'Slow Down',
        text: 'In the week before, start unwinding. Less screen time. More nature. Fewer conversations, but more honest ones. Start arriving before you arrive.',
      },
      {
        heading: 'Release Expectations',
        text: 'You might have heard things. You might have a whole story built about what this will be. Drop it. The experience you need is almost never the one you imagined. That\'s kind of the point.',
      },
      {
        heading: 'Know Your Edges',
        text: 'Think about your boundaries before you get here. What feels safe? Where are your edges? You have full permission to participate, pause, or pass at any time — no explanation needed. Knowing your own limits is part of the magic, not a limitation of it.',
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
        text: 'Integration is what happens when the show ends and real life starts talking back. It\'s the process of weaving whatever you experienced — the insights, the feelings, the weird stuff you can\'t quite name — into your actual day-to-day. The show opens the door. Integration is walking through it.',
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
        text: 'If you\'re experiencing persistent anxiety, confusion, or difficulty functioning after the experience, reach out to us or to a mental health professional. This isn\'t a sign of failure — it\'s a sign you\'re processing something real and you deserve support doing it.',
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
