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
        text: 'The Magic Show is a multi-day ceremonial gathering. You\'ll move through structured ceremonies, group integration, stillness, movement, and connection — all held within a sacred container by experienced facilitators.',
      },
      {
        heading: 'The Container',
        text: 'From the moment you arrive until the moment you leave, you are in ceremony. This doesn\'t mean everything is intense — it means everything is intentional. Meals, rest, conversation, silence — all of it is part of the experience.',
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
          'Begin shifting toward clean, whole foods — vegetables, fruits, grains, lean proteins',
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
          'Fast or eat very lightly the day of ceremony (details provided by facilitators)',
        ],
      },
      {
        heading: 'Medications — Important',
        items: [
          'SSRIs and MAOIs can have dangerous interactions with certain entheogenics. If you are on SSRIs, you MUST disclose this on your intake form and discuss with facilitators before attending',
          'Do not stop or adjust any prescribed medication without consulting your doctor',
          'Disclose ALL supplements, even those that seem harmless — St. John\'s Wort, 5-HTP, and others can interact',
          'If in doubt, ask. We would rather have the conversation than have a preventable incident',
        ],
      },
      {
        heading: 'Sleep & Rest',
        text: 'Arrive well-rested. Prioritize 7-9 hours of sleep in the nights leading up to the gathering. Your nervous system will thank you.',
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
        text: 'What are you here for? Not the surface answer — the real one. Spend time in the days before arrival journaling, meditating, or simply sitting with the question: What am I ready to meet?',
      },
      {
        heading: 'Slow Down',
        text: 'In the week before, begin to slow your pace. Reduce screen time. Spend time in nature. Have fewer conversations, but make them more honest. Start arriving before you arrive.',
      },
      {
        heading: 'Release Expectations',
        text: 'You may have heard stories. You may have ideas about what this will be. Let them go. The experience you need is rarely the one you planned for. Trust the process and your own inner wisdom.',
      },
      {
        heading: 'Boundaries & Consent',
        text: 'Think about your boundaries before you arrive. What feels safe? What are your edges? You have full permission to participate, pause, or pass at any time. Knowing your own limits is a sign of strength, not weakness.',
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
          'A warm blanket or sleeping bag liner for ceremony space',
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
          'A personal sacred object or talisman',
          'Eye mask for rest and ceremony',
          'Earplugs (for sleep, not ceremony)',
          'Warm socks and slippers',
          'Art supplies if that\'s how you process',
        ],
      },
      {
        heading: 'Leave Behind',
        items: [
          'Laptops and work devices',
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
        text: 'Integration is the process of bringing the insights, emotions, and experiences from ceremony into your daily life. It\'s where the real work happens. The ceremony opens the door — integration is walking through it.',
      },
      {
        heading: 'The First 48 Hours',
        items: [
          'Move slowly. Give yourself permission to do less',
          'Avoid making major life decisions immediately',
          'Stay off social media — protect the space you\'ve opened',
          'Eat nourishing, simple food',
          'Drink plenty of water',
          'Journal or record voice memos about your experience while it\'s fresh',
        ],
      },
      {
        heading: 'The First Two Weeks',
        items: [
          'Maintain the dietary awareness from preparation',
          'Continue journaling',
          'Spend time in nature',
          'Talk to people who understand — your Signal group is a resource',
          'Notice what has shifted in how you see, feel, and respond to daily life',
          'Be patient with yourself. Integration is not linear',
        ],
      },
      {
        heading: 'Ongoing',
        items: [
          'Consider working with a therapist or integration coach who understands entheogenic experiences',
          'Stay connected to the community — you don\'t have to do this alone',
          'Revisit your journal entries from time to time',
          'Pay attention to your dreams',
          'Practice what you learned. The ceremony was the spark — your life is the fire',
        ],
      },
      {
        heading: 'When to Seek Support',
        text: 'If you are experiencing persistent anxiety, depression, confusion, or difficulty functioning after the experience, please reach out to a facilitator or mental health professional. This is not a sign of failure — it\'s a sign that you\'re processing something significant and deserve support.',
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
        <p>Everything you need to arrive ready and integrate fully.</p>
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
