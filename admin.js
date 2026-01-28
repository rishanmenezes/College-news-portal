const API_BASE = 'http://localhost:4000/api';

const eventForm = document.getElementById('eventForm');
const eventFormStatus = document.getElementById('eventFormStatus');
const eventsList = document.getElementById('eventsList');
const refreshEventsBtn = document.getElementById('refreshEvents');
const themeToggle = document.getElementById('themeToggle');
const adminProfileNameEl = document.getElementById('adminProfileName');
const adminProfileEmailEl = document.getElementById('adminProfileEmail');
const adminAvatarEl = document.getElementById('adminAvatar');
const adminProfileRoleEl = document.getElementById('adminProfileRole');
const metricEventsEl = document.getElementById('metricEvents');
const metricUpcomingEl = document.getElementById('metricUpcoming');
const metricPendingEl = document.getElementById('metricPending');

let events = [];
let registrations = [];

init();

function init(){
  const name = sessionStorage.getItem('portalName') || 'Admin User';
  const email = sessionStorage.getItem('portalEmail') || 'admin@mitmysore.edu';
  const role = sessionStorage.getItem('portalRole') || 'admin';
  if(adminProfileNameEl) adminProfileNameEl.textContent = name;
  if(adminProfileEmailEl) adminProfileEmailEl.textContent = email;
  if(adminProfileRoleEl) adminProfileRoleEl.textContent = role === 'admin' ? 'Admin' : role;
  if(adminAvatarEl){
    const initial = name.trim().charAt(0).toUpperCase() || 'A';
    adminAvatarEl.textContent = initial;
  }
  loadEvents();
  loadRegistrations();
}

eventForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = eventForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  setFormStatus('Saving event…');

  const data = new FormData(eventForm);
  const payload = {
    title: data.get('title')?.trim(),
    category: data.get('category')?.trim(),
    date: data.get('date'),
    startTime: data.get('startTime') || undefined,
    endTime: data.get('endTime') || undefined,
    location: data.get('location')?.trim(),
    contactEmail: data.get('contactEmail')?.trim(),
    registrationLink: data.get('registrationLink')?.trim(),
    speakers: splitList(data.get('speakers')),
    highlights: splitList(data.get('highlights')),
    excerpt: data.get('excerpt')?.trim(),
    content: data.get('content')?.trim()
  };

  try{
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      const err = await res.json().catch(()=>({ message: 'Unable to save event' }));
      throw new Error(err.message);
    }
    setFormStatus('Event saved successfully.', false, true);
    eventForm.reset();
    loadEvents();
  }catch(err){
    setFormStatus(err.message || 'Unable to save event.', true);
  }finally{
    submitBtn.disabled = false;
  }
});

refreshEventsBtn?.addEventListener('click', loadEvents);

themeToggle?.addEventListener('click', ()=>{
  const root = document.documentElement;
  const light = !root.classList.contains('light-theme');
  root.style.setProperty('--bg', light? '#f7fbff' : '#0f1724');
  root.style.setProperty('--text', light? '#021229' : '#e6f0ff');
  root.style.setProperty('--muted', light? '#4b6278' : '#9fb2d6');
  root.classList.toggle('light-theme', light);
  themeToggle.textContent = light ? '☀️' : '🌙';
});

async function loadEvents(){
  try{
    if(eventsList) eventsList.innerHTML = '<p class="status-note">Loading events…</p>';
    const res = await fetch(`${API_BASE}/events`);
    if(!res.ok) throw new Error('Failed to fetch events');
    events = await res.json();
    renderEvents();
    updateMetrics();
  }catch(err){
    events = [];
    if(eventsList) eventsList.innerHTML = `<p class="status-note error">${err.message}</p>`;
    updateMetrics();
  }
}

function renderEvents(){
  if(!eventsList) return;
  if(!Array.isArray(events) || events.length === 0){
    eventsList.innerHTML = '<p class="status-note">No events created yet.</p>';
    return;
  }
  const rows = events.map(event => `
    <tr>
      <td>
        <strong>${escapeHtml(event.title)}</strong>
        <small>${escapeHtml(event.category)} • ${escapeHtml(new Date(event.date).toLocaleDateString())}</small>
      </td>
      <td>${escapeHtml(event.location || 'TBA')}</td>
      <td>
        <button class="pill-link danger" data-action="delete" data-id="${event.id}">Delete</button>
      </td>
    </tr>
  `).join('');
  eventsList.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Event</th>
          <th>Location</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  eventsList.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      if(!confirm('Delete this event?')) return;
      deleteEvent(id);
    });
  });
}

async function loadRegistrations(){
  try{
    const res = await fetch(`${API_BASE}/registrations`);
    if(!res.ok) throw new Error('Failed to fetch registrations');
    registrations = await res.json();
    updateMetrics();
  }catch(err){
    registrations = [];
    updateMetrics();
  }
}

async function deleteEvent(id){
  try{
    const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
    if(!res.ok){
      const err = await res.json().catch(()=>({ message: 'Unable to delete event' }));
      throw new Error(err.message);
    }
    loadEvents();
  }catch(err){
    alert(err.message || 'Unable to delete event');
  }
}

function splitList(value){
  if(!value) return [];
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function setFormStatus(message, isError = false, isSuccess = false){
  if(!eventFormStatus) return;
  eventFormStatus.textContent = message;
  eventFormStatus.classList.remove('error','success');
  if(isError) eventFormStatus.classList.add('error');
  if(isSuccess) eventFormStatus.classList.add('success');
}

function updateMetrics(){
  const totalEvents = Array.isArray(events) ? events.length : 0;
  const now = new Date();
  const upcoming = Array.isArray(events)
    ? events.filter(evt => {
        const date = evt.date ? new Date(evt.date) : null;
        if(!date || Number.isNaN(date.getTime())) return false;
        const diff = date - now;
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }).length
    : 0;
  const pending = Array.isArray(registrations)
    ? registrations.filter(reg => (reg.status || 'pending') === 'pending').length
    : 0;
  if(metricEventsEl) metricEventsEl.textContent = totalEvents;
  if(metricUpcomingEl) metricUpcomingEl.textContent = upcoming;
  if(metricPendingEl) metricPendingEl.textContent = pending;
}

function escapeHtml(value = ''){
  return value.replace(/[&<>"]/g, (char)=>(
    {
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;'
    })[char] || char);
}
