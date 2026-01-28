const API_BASE = 'http://localhost:4000/api';

const registrationsTable = document.getElementById('fullRegistrationsList');
const refreshBtn = document.getElementById('refreshRegistrations');
const searchInput = document.getElementById('registrationSearch');
const statusFilter = document.getElementById('statusFilter');
const eventFilter = document.getElementById('eventFilter');
const adminProfileNameEl = document.getElementById('adminProfileName');
const adminProfileEmailEl = document.getElementById('adminProfileEmail');
const adminAvatarEl = document.getElementById('adminAvatar');
const adminProfileRoleEl = document.getElementById('adminProfileRole');
const metricTotalRegEl = document.getElementById('metricTotalReg');
const metricPendingRegEl = document.getElementById('metricPendingReg');
const metricAcceptedRegEl = document.getElementById('metricAcceptedReg');
const themeToggle = document.getElementById('themeToggle');

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
  attachEvents();
  loadData();
}

function attachEvents(){
  refreshBtn?.addEventListener('click', loadData);
  searchInput?.addEventListener('input', renderRegistrations);
  statusFilter?.addEventListener('change', renderRegistrations);
  eventFilter?.addEventListener('change', renderRegistrations);
  themeToggle?.addEventListener('click', ()=>{
    const root = document.documentElement;
    const light = !root.classList.contains('light-theme');
    root.style.setProperty('--bg', light? '#f7fbff' : '#0f1724');
    root.style.setProperty('--text', light? '#021229' : '#e6f0ff');
    root.style.setProperty('--muted', light? '#4b6278' : '#9fb2d6');
    root.classList.toggle('light-theme', light);
    themeToggle.textContent = light ? '☀️' : '🌙';
  });
}

async function loadData(){
  try{
    if(registrationsTable) registrationsTable.innerHTML = '<p class="status-note">Loading registrations…</p>';
    const [eventsRes, regsRes] = await Promise.all([
      fetch(`${API_BASE}/events`),
      fetch(`${API_BASE}/registrations`)
    ]);
    if(!eventsRes.ok) throw new Error('Failed to fetch events');
    if(!regsRes.ok) throw new Error('Failed to fetch registrations');
    events = await eventsRes.json();
    registrations = await regsRes.json();
    populateEventFilter();
    renderRegistrations();
    updateMetrics();
  }catch(err){
    if(registrationsTable) registrationsTable.innerHTML = `<p class="status-note error">${err.message}</p>`;
    events = [];
    registrations = [];
    updateMetrics();
  }
}

function populateEventFilter(){
  if(!eventFilter) return;
  const current = eventFilter.value;
  const options = ['<option value="all">All events</option>'];
  events.forEach(evt => {
    options.push(`<option value="${evt.id}">${escapeHtml(evt.title)}</option>`);
  });
  eventFilter.innerHTML = options.join('');
  if(current && Array.from(eventFilter.options).some(opt => opt.value === current)){
    eventFilter.value = current;
  }
}

function renderRegistrations(){
  if(!registrationsTable) return;
  if(!Array.isArray(registrations) || registrations.length === 0){
    registrationsTable.innerHTML = '<p class="status-note">No registrations found.</p>';
    return;
  }
  const term = (searchInput?.value || '').toLowerCase();
  const status = statusFilter?.value || 'all';
  const eventId = eventFilter?.value || 'all';
  const eventMap = new Map(events.map(evt => [String(evt.id), evt]));

  const filtered = registrations
    .slice()
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter(reg => {
      const matchesStatus = status === 'all' || (reg.status || 'pending') === status;
      const matchesEvent = eventId === 'all' || String(reg.eventId) === eventId;
      const haystack = `${reg.name || ''} ${reg.email || ''} ${reg.department || ''} ${reg.year || ''}`.toLowerCase();
      const matchesTerm = !term || haystack.includes(term);
      return matchesStatus && matchesEvent && matchesTerm;
    });

  if(filtered.length === 0){
    registrationsTable.innerHTML = '<p class="status-note">No registrations match the filters.</p>';
    return;
  }

  const rows = filtered.map(reg => {
    const event = eventMap.get(String(reg.eventId)) || {};
    const statusTag = reg.status || 'pending';
    const submitted = reg.createdAt ? new Date(reg.createdAt).toLocaleString() : '—';
    const eventDate = event.date ? new Date(event.date).toLocaleDateString() : '—';
    return `
      <tr>
        <td>
          <strong>${escapeHtml(reg.name || 'Unknown')}</strong>
          <small>${escapeHtml(reg.email || 'No email')}</small>
          <p class="reg-meta">Dept: ${escapeHtml(reg.department || '—')} · Year: ${escapeHtml(reg.year || '—')}</p>
        </td>
        <td>
          <strong>${escapeHtml(event.title || `Event #${reg.eventId}`)}</strong>
          <small>${eventDate}</small>
          <p class="reg-meta">Location: ${escapeHtml(event.location || 'TBA')}</p>
        </td>
        <td>
          <p class="reg-meta">Phone: ${escapeHtml(reg.phone || '—')}</p>
          <p class="reg-notes">${reg.notes ? escapeHtml(reg.notes) : 'No additional notes'}</p>
          <p class="reg-time">Submitted ${submitted}</p>
        </td>
        <td class="status-cell">
          <span class="status-badge ${statusTag}">${statusTag.toUpperCase()}</span>
          <div class="action-group">
            <button class="pill-link" data-action="accept" data-id="${reg.id}" ${statusTag === 'accepted' ? 'disabled' : ''}>Accept</button>
            <button class="pill-link danger" data-action="reject" data-id="${reg.id}" ${statusTag === 'rejected' ? 'disabled' : ''}>Reject</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  registrationsTable.innerHTML = `
    <table class="registration-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Event</th>
          <th>Contact & Notes</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  registrationsTable.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if(action === 'accept') updateRegistrationStatus(id, 'accepted');
      if(action === 'reject') updateRegistrationStatus(id, 'rejected');
    });
  });
}

async function updateRegistrationStatus(id, status){
  try{
    const res = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if(!res.ok){
      const err = await res.json().catch(()=>({ message: 'Unable to update registration' }));
      throw new Error(err.message);
    }
    loadData();
  }catch(err){
    alert(err.message || 'Unable to update registration');
  }
}

function updateMetrics(){
  const total = registrations.length;
  const pending = registrations.filter(reg => (reg.status || 'pending') === 'pending').length;
  const accepted = registrations.filter(reg => reg.status === 'accepted').length;
  if(metricTotalRegEl) metricTotalRegEl.textContent = total;
  if(metricPendingRegEl) metricPendingRegEl.textContent = pending;
  if(metricAcceptedRegEl) metricAcceptedRegEl.textContent = accepted;
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
