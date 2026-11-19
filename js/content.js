// ALL site content lives here. Text is taken verbatim from the supplied screen designs.
// Fields marked TEMPLATE reuse the design's own template copy — replace them with real details.

export const PROFILE = {
  name: 'Ashita Taneja',
  tagline: 'Designer. Observer. Researcher.',
  intro: 'Exploring everyday systems, designing for people, and building more inclusive futures.',
  aboutTagline: 'Designer • Dreamer • Always Exploring',
  aboutBubble: 'A designer, dreamer, and a perpetual learner.',
};

export const CONTACT = {
  email: 'ashita.taneja@gmail.com', // as shown in the Contact screen design
  // TODO: set your LinkedIn profile URL. Until then the button opens a LinkedIn people search for your name.
  linkedin: '',
  linkedinFallback: 'https://www.linkedin.com/search/results/people/?keywords=Ashita%20Taneja',
  // Drop your CV at this path. If it is missing, Resume actions fall back to an email request.
  resume: 'assets/Ashita-Taneja-Resume.pdf',
};

export const NAV = [
  { id: 'work', label: 'Work', icon: 'briefcase', icon2: 'folder-o', route: '#/work' },
  { id: 'archive', label: 'Archive', icon: 'folder', icon2: 'layers', route: '#/archive' },
  { id: 'notes', label: 'Notes', icon: 'notes', icon2: 'notes', route: '#/notes' },
  { id: 'about', label: 'About', icon: 'user', icon2: 'user', route: '#/about' },
  { id: 'contact', label: 'Contact', icon: 'mail', icon2: 'mail-o', route: '#/contact' },
];

const CATS = ['Product Design', 'UX Design', 'Wearable Design', 'Service Design', 'Research',
  'Interaction Design', 'Product Design', 'Digital Product', 'Graphic Design', 'Experience Design'];
const CLIPS = ['pink', 'hot', 'yellow', 'pink', 'hot', 'hot', 'pink', 'yellow', 'hot', 'pink'];
const TILTS = [-6, 2, 0, 3, -5, 4, 2, -3, 3, -4];

export const PROJECTS = CATS.map((category, i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    id: n,
    title: 'Project Title',            // TEMPLATE
    category,
    img: 'p' + n,
    clip: CLIPS[i],
    tilt: TILTS[i],
    year: '2025',
    description: 'A short description of the project goes here, highlighting the key idea, impact and your role in the process.', // TEMPLATE
    role: 'Designer & Researcher',
    duration: '3 Months',
    team: 'Team details',              // TEMPLATE
    overview: 'A short description of the project goes here, highlighting the key idea, impact and your role in the process.', // TEMPLATE
  };
});

// Case-study stages. Stage 01 content is taken from the Case Study screen design;
// later stages use the same structure with TEMPLATE copy to replace.
export const STAGES = [
  {
    key: 'context', name: 'Context', subtitle: 'Understanding the problem space and the users.',
    img: 'p06', cardTitle: 'Key Insights',
    text: 'Users, especially visually impaired individuals, often rely on informal methods to manage finances, leading to dependence and reduced independence.',
    facts: [
      { icon: 'users', label: 'User Group', value: 'Visually Impaired Entrepreneurs' },
      { icon: 'pin', label: 'Location', value: 'India' },
      { icon: 'search', label: 'Method', value: 'Interviews & Observations' },
    ],
    evidence: { title: 'Evidence', text: 'Interview excerpts from visually impaired users in Delhi.' },
  },
  ...['Research', 'Insights', 'Define', 'Ideation', 'Prototyping', 'Testing', 'Outcome'].map(name => ({
    key: name.toLowerCase(), name,
    subtitle: `What the ${name.toLowerCase()} stage set out to do.`,           // TEMPLATE
    cardTitle: 'Key Insights',
    text: `A short summary of the ${name.toLowerCase()} stage goes here — what was learnt, decided or made, and why it mattered.`, // TEMPLATE
    facts: null,
    evidence: { title: 'Evidence', text: `Research and process material from the ${name.toLowerCase()} stage.` }, // TEMPLATE
  })),
];

// Photography — every image comes from the supplied designs.
export const PHOTOS = [
  { id: 'sunset', img: 'sunset', alt: 'Sun setting behind trees and street lamps over the city' },
  { id: 'palace', img: 'palace', alt: 'White domed palace behind gardens of pink flowers' },
  { id: 'flowers', img: 'flowers', alt: 'Pink bougainvillea against a blue sky' },
  { id: 'park', img: 'park', alt: 'Tree-lined path through a green park' },
  { id: 'college', img: 'college', alt: 'Cream heritage building with a central dome' },
  { id: 'cat', img: 'cat', alt: 'A tabby cat peeking over a ledge' },
];
export const MEMORY_LABEL = 'Places & Experiences';
export const POSTCARD_PHOTOS = ['palace', 'flowers', 'sunset', 'park', 'cat'];

export const ARTICLES = [
  {
    slug: 'designing-for-joy', title: 'Designing for Joy', subtitle: 'A little note on how colour shapes emotions.',
    date: '12 Jun, 2025', read: '5 min read', img: 'palace', caption: 'Colours in harmony, always.', img2: 'flowers',
    body: [
      'Colour has always been more than just a visual element for me — it’s a feeling. A way to communicate, to express, and to bring life to even the simplest of ideas.',
      'In design, colour can set the mood, guide the eye and create a connection. Whether it’s the bold energy of bright tones or the calm of muted shades, the right palette can completely change how something feels.',
      'This is why I always return to colour — not just as a design element, but as a storyteller.',
    ],
  },
  { slug: 'in-the-details', title: 'In the Details', subtitle: 'Finding beauty in the little things.', date: '28 May, 2025', read: '4 min read', img: 'flowers', body: [] },
  { slug: 'chasing-sunsets', title: 'Chasing Sunsets', subtitle: 'A collection of golden hours.', date: '14 Apr, 2025', read: '6 min read', img: 'sunset', body: [] },
  { slug: 'the-art-of-places', title: 'The Art of Places', subtitle: 'Spaces that inspire.', date: '10 Mar, 2025', read: '5 min read', img: 'palace', body: [] },
  { slug: 'everyday-aesthetics', title: 'Everyday Aesthetics', subtitle: 'Beauty in the ordinary.', date: '22 Feb, 2025', read: '4 min read', img: 'leaves', body: [] },
];

// About — scratch tiles. Titles/subtitles from the design; notes drawn from the About Details screen.
export const ABOUT_TILES = [
  { id: 'education', title: 'Education', sub: 'Learning, always.', img: 'college', frame: 'pink', note: 'Learning, always — studying design and how people live with it.' },
  { id: 'me', title: 'About Me', sub: 'A little about me.', img: 'portrait_about', frame: 'yellow', note: 'Hi! I’m Ashita Taneja, a designer with a keen interest in creating meaningful and engaging experiences through design.' },
  { id: 'do', title: 'Things I Do', sub: 'Create. Explore. Design.', img: 'p05', frame: 'hot', note: 'Product design, Interaction Design, Design Research, Prototyping and more.' },
  { id: 'like', title: 'Things I Like', sub: 'A mix of interests.', img: 'flowers', frame: 'yellow', note: 'Photography, music, travel and more.' },
  { id: 'experience', title: 'Experience', sub: 'My journey so far.', img: 'p08', frame: 'pink', note: 'Exploring design, technology and human behaviour through research and writing.' },
  { id: 'facts', title: 'Random Facts', sub: 'Little fun facts.', img: 'cat', frame: 'yellow', note: 'A designer, dreamer, and a perpetual learner.' },
];

// About details (Screen 17). Placeholders are kept exactly as in the design — replace with real details.
export const ABOUT_SECTIONS = [
  { id: 'introduction', n: '01', name: 'Introduction' },
  { id: 'education', n: '02', name: 'Education', items: [
    { title: 'Degree Name', meta: 'Institution Name  •  Year – Year' },
    { title: 'Degree Name', meta: 'Institution Name  •  Year – Year' } ] },
  { id: 'experience', n: '03', name: 'Experience', items: [
    { title: 'Organisation Name', meta: 'Role Title  •  Duration', text: 'A brief description of your role, responsibilities and impact.' } ] },
  { id: 'practice', n: '04', name: 'Design Practice', text: 'Product design, Interaction Design, Design Research, Prototyping and more.' },
  { id: 'skills', n: '05', name: 'Skills and Tools', text: 'Figma, Adobe Creative Suite, Design Research, Prototyping Tools and more.' },
  { id: 'research', n: '06', name: 'Research & Publications', text: 'Exploring design, technology and human behaviour through research and writing.' },
  { id: 'beyond', n: '07', name: 'Beyond Work', text: 'Photography, music, travel and more.' },
];
