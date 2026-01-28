const API_BASE = 'http://localhost:4000/api';

const params = new URLSearchParams(window.location.search);
const eventId = Number(params.get('id'));

const eventTitle = document.getElementById('eventTitle');
const eventSummary = document.getElementById('eventSummary');
const eventCategory = document.getElementById('eventCategory');
const eventMeta = document.getElementById('eventMeta');
const eventBanner = document.getElementById('eventBanner');
const eventDescription = document.getElementById('eventDescription');
const eventDetails = document.getElementById('eventDetails');
const eventHighlights = document.getElementById('eventHighlights');
const infoGrid = document.getElementById('infoGrid');
const agendaList = document.getElementById('agendaList');
const resourceLinks = document.getElementById('resourceLinks');
const eventError = document.getElementById('eventError');
const themeToggle = document.getElementById('themeToggle');

const CATEGORY_IMAGES = {
  campus: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
  academics: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80',
  events: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  hackathon: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
  placements: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1600&q=80',
  seminar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
  competition: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80'
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80';

if(!eventId){
  showError('Missing event id. Use the news portal to open a specific event.');
} else {
  loadEvent();
}

function getImageForCategory(category){
  const key = category?.toLowerCase();
  return CATEGORY_IMAGES[key] || DEFAULT_IMAGE;
}

async function loadEvent(){
  try{
    const res = await fetch(`${API_BASE}/events/${eventId}`);
    if(!res.ok) throw new Error('Event not found');
    const data = await res.json();
    renderEvent(data);
  }catch(err){
    showError(err.message || 'Unable to load event. Make sure the backend server is running (npm start).');
  }
}

function renderEvent(item){
  eventTitle.textContent = item.title;
  eventSummary.textContent = item.excerpt || '';
  eventCategory.textContent = item.category || '';
  eventCategory.classList.add('pill');
  const heroImage = getImageForCategory(item.category);
  eventBanner.style.backgroundImage = `linear-gradient(135deg, rgba(4,16,32,0.8), rgba(8,28,48,0.55)), url(${heroImage})`;
  eventBanner.style.backgroundSize = 'cover';
  eventBanner.style.backgroundPosition = 'center';
  eventDescription.textContent = item.content;
  eventMeta.innerHTML = `
    <span class="pill">${formatDate(item.date)}</span>
    <span class="pill">${formatTimeRange(item.startTime, item.endTime)}</span>
    <span class="pill">${item.location || 'Location TBA'}</span>
  `;

  const detailItems = [
    {label:'Speakers', value:(item.speakers && item.speakers.length) ? item.speakers.join(', ') : 'To be announced'},
    {label:'Contact', value:item.contactEmail || 'events@mitmysore.edu'},
    {label:'Category', value:item.category}
  ];
  eventDetails.innerHTML = detailItems.map(detail => `
    <li>
      <span>${detail.label}</span>
      <strong>${escapeHtml(detail.value)}</strong>
    </li>
  `).join('');

  if(item.highlights && item.highlights.length){
    eventHighlights.innerHTML = `
      <h3>Highlights</h3>
      <ul>${item.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
    `;
  } else {
    eventHighlights.innerHTML = '';
  }

  if(infoGrid){
    infoGrid.innerHTML = buildInfoGrid(item);
  }

  if(agendaList){
    const agendaMarkup = buildAgendaMarkup(item);
    agendaList.innerHTML = agendaMarkup || '<li class="agenda-placeholder">Detailed agenda will be published shortly.</li>';
  }

  if(resourceLinks){
    resourceLinks.innerHTML = buildResourceMarkup(item);
  }
}

function showError(message){
  if(eventError){
    eventError.hidden = false;
    eventError.textContent = message;
  }
}

function formatDate(value){
  const date = new Date(value);
  if(isNaN(date)) return 'Date TBA';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimeRange(start, end){
  if(!start && !end) return 'Schedule coming soon';
  const fmt = (time)=>{
    const [h = 0, m = 0] = (time || '00:00').split(':').map(Number);
    const stamp = new Date();
    stamp.setHours(h, m, 0, 0);
    return stamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  if(start && end) return `${fmt(start)} – ${fmt(end)}`;
  return start ? `${fmt(start)} onwards` : `Until ${fmt(end)}`;
}

function escapeHtml(value = ''){
  return value.replace(/[&<>"]/g, (char)=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;'
  })[char] || char);
}

function buildInfoGrid(item){
  const cards = [
    { icon:'🎯', label:'Ideal for', value: inferAudience(item.category) },
    { icon:'🧭', label:'Session format', value: inferFormat(item.category) },
    { icon:'💡', label:'What you gain', value: summarizeHighlights(item.highlights) },
    { icon:'🧳', label:'Arrival prep', value: inferPrep(item.category) }
  ];
  return cards.map(card => `
    <article class="info-pill">
      <span class="info-icon" aria-hidden="true">${card.icon}</span>
      <div>
        <p class="info-label">${escapeHtml(card.label)}</p>
        <p class="info-value">${escapeHtml(card.value)}</p>
      </div>
    </article>
  `).join('');
}

function buildAgendaMarkup(item){
  const entries = generateAgendaEntries(item);
  if(!entries.length) return '';
  return entries.map(block => `
    <li>
      <span class="agenda-time">${escapeHtml(block.time)}</span>
      <div>
        <strong>${escapeHtml(block.title)}</strong>
        <p>${escapeHtml(block.detail)}</p>
      </div>
    </li>
  `).join('');
}

function generateAgendaEntries(item){
  const start = item.startTime || null;
  const template = [
    { offset: -30, title: 'Check-in & badge pickup', detail: 'Sign the attendance sheet, collect kits, and settle in.' },
    { offset: 0, title: `Kick-off: ${item.title}`, detail: 'Context, safety notes, and success criteria straight from the hosts.' },
    { offset: 45, title: 'Interactive block', detail: inferActivityDetail(item.category) },
    { offset: 120, title: 'Wrap + next steps', detail: 'Q&A, mentor connects, and pointers to recordings/resources.' }
  ];
  return template.map(block => ({
    time: start ? formatAgendaClock(start, block.offset) : 'TBD',
    title: block.title,
    detail: block.detail
  }));
}

function formatAgendaClock(base, offset = 0){
  const [hours, minutes] = base.split(':').map(Number);
  if(Number.isNaN(hours) || Number.isNaN(minutes)) return 'TBD';
  const date = new Date();
  const totalMinutes = Math.max(0, (hours * 60) + minutes + offset);
  date.setHours(0, 0, 0, 0);
  date.setMinutes(totalMinutes);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function buildResourceMarkup(item){
  const officialLink = safeUrl(item.registrationLink);
  const resources = [
    {
      title: 'Official microsite',
      detail: officialLink ? `<a href="${officialLink}" target="_blank" rel="noopener">Open event page</a>` : 'Link will be shared soon.',
      allowHtml: Boolean(officialLink)
    },
    {
      title: 'Primary contact',
      detail: item.contactEmail ? `${item.contactEmail} · replies 9 AM – 6 PM` : 'events@mitmysore.edu',
      allowHtml: false
    },
    {
      title: 'Venue & access',
      detail: item.location || 'Venue will be confirmed via email.',
      allowHtml: false
    },
    {
      title: 'Prep checklist',
      detail: inferChecklist(item.category),
      allowHtml: false
    }
  ];

  return resources.map(block => `
    <article class="resource-card">
      <h4>${escapeHtml(block.title)}</h4>
      <p>${block.allowHtml ? block.detail : escapeHtml(block.detail)}</p>
    </article>
  `).join('');
}

function safeUrl(url){
  if(!url) return null;
  try{
    const parsed = new URL(url);
    return parsed.href;
  }catch{
    return null;
  }
}

function inferAudience(category = ''){
  const key = category?.toLowerCase() || '';
  const map = {
    academics: 'Students needing schedule clarity',
    sports: 'Support squads and athletics council',
    hackathon: 'Builders, designers, and product thinkers',
    tech: 'Developers & research clubs',
    events: 'Campus community and guests',
    seminar: 'Faculty, research scholars, and seniors',
    competition: 'Interdisciplinary student teams',
    placements: 'Final-year students targeting roles'
  };
  return map[key] || 'Open to all interested students';
}

function inferFormat(category = ''){
  const key = category?.toLowerCase() || '';
  const map = {
    hackathon: 'Hands-on sprint with mentor huddles',
    sports: 'Live match experience + fan engagement',
    academics: 'Briefing with resource walkthroughs',
    seminar: 'Keynote + panel conversation',
    tech: 'Tech talk with demos',
    competition: 'Multi-round judged contest'
  };
  return map[key] || 'Interactive session with networking';
}

function inferActivityDetail(category = ''){
  const key = category?.toLowerCase() || '';
  const map = {
    hackathon: 'Sprint on challenge statements with mentor checkpoints every 60 minutes.',
    sports: 'Live commentary, cheer zone cues, and halftime contests.',
    academics: 'Detailed walkthrough of schedules, doubt-clearing desks, and documentation.',
    tech: 'Hands-on demos, sandbox access, and code-along snippets.',
    events: 'Workshop-style engagement with breakout pods.',
    seminar: 'Lightning talks followed by panel questions.',
    competition: 'Pitch practice, judging rubrics, and scoring briefings.'
  };
  return map[key] || 'Interactive discussions, showcases, and peer learning circles.';
}

function inferPrep(category = ''){
  const key = category?.toLowerCase() || '';
  const map = {
    hackathon: 'Laptop, charger, reusable bottle, and previous project notes.',
    sports: 'College ID, team colors, and hydration.',
    academics: 'Notebook, ID card, and updated timetable queries.',
    seminar: 'Notebook, questions for speakers, and business cards.',
    tech: 'Laptop for demos, GitHub profile, and resume highlights.',
    competition: 'Prototype files, pitch deck, and team rosters.'
  };
  return map[key] || 'College ID, notepad, and curiosity.';
}

function inferChecklist(category = ''){
  const key = category?.toLowerCase() || '';
  const map = {
    hackathon: 'Form teams of 4, update Devfolio profile, sync travel & food plans.',
    sports: 'Arrive 45 mins early, wear college jersey, review seating block assignments.',
    academics: 'Download timetable PDF, carry hall ticket, clear dues if any.',
    seminar: 'Register email for slides, prepare 1-2 questions, carry resume (optional).',
    tech: 'Sync laptop updates, test IDE extensions, bookmark repo links.',
    competition: 'Finalize submission files, print score sheets, align mentor availability.'
  };
  return map[key] || 'Carry ID, stay hydrated, and monitor email for last-minute cues.';
}

function summarizeHighlights(highlights){
  if(!Array.isArray(highlights) || !highlights.length) return 'Insights, resources, and campus networking.';
  return highlights.slice(0,3).join(' · ');
}


let light = false;
if(themeToggle){
  themeToggle.addEventListener('click', ()=>{
    light = !light;
    document.documentElement.style.setProperty('--bg', light? '#f7fbff' : '#0f1724');
    document.documentElement.style.setProperty('--text', light? '#021229' : '#e6f0ff');
    document.documentElement.style.setProperty('--muted', light? '#4b6278' : '#9fb2d6');
    document.documentElement.classList.toggle('light-theme', light);
    themeToggle.textContent = light? '☀️' : '🌙';
  });
}
