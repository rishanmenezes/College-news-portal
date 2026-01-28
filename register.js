const API_BASE = 'http://localhost:4000/api';

const params = new URLSearchParams(window.location.search);
const eventId = Number(params.get('id'));

const registerTitle = document.getElementById('registerTitle');
const registerTag = document.getElementById('registerTag');
const eventCallout = document.getElementById('eventCallout');
const eventForm = document.getElementById('eventForm');
const eventFormStatus = document.getElementById('eventFormStatus');
const eventError = document.getElementById('eventError');
const themeToggle = document.getElementById('themeToggle');

if(!eventId){
  showError('Missing event id. Use the news portal to open a specific event.');
  disableForm();
} else {
  loadEvent();
}

eventForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = eventForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  setFormStatus('Submitting registration…');

  const formData = new FormData(eventForm);
  const payload = {
    eventId,
    name: formData.get('name')?.trim(),
    email: formData.get('email')?.trim(),
    department: formData.get('department')?.trim(),
    year: formData.get('year')?.trim(),
    phone: formData.get('phone')?.trim(),
    notes: formData.get('notes')?.trim()
  };

  if(!payload.name || !payload.email){
    submitBtn.disabled = false;
    setFormStatus('Name and email are required.', true);
    return;
  }

  try{
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      const error = await res.json().catch(()=>({message:'Failed to register'}));
      throw new Error(error.message || 'Failed to register');
    }
    setFormStatus('Registration received! Watch your inbox for the confirmation.', false, true);
    eventForm.reset();
  }catch(err){
    setFormStatus(err.message || 'Unable to register right now.', true);
  }finally{
    submitBtn.disabled = false;
  }
});

async function loadEvent(){
  try{
    const res = await fetch(`${API_BASE}/events/${eventId}`);
    if(!res.ok) throw new Error('Event not found');
    const data = await res.json();
    registerTitle.textContent = `Register for ${data.title}`;
    registerTag.textContent = data.category ? `${data.category.toUpperCase()} • Registration only` : 'Registration only';
    eventCallout.innerHTML = `You are signing up for <strong>${escapeHtml(data.title)}</strong>.`;
  }catch(err){
    showError(err.message || 'Unable to load event. Make sure the backend server is running (npm start).');
    disableForm();
  }
}

function showError(message){
  if(eventError){
    eventError.hidden = false;
    eventError.textContent = message;
  }
}

function disableForm(){
  if(eventForm){
    eventForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
  }
}

function setFormStatus(message, isError = false, isSuccess = false){
  eventFormStatus.textContent = message;
  eventFormStatus.classList.remove('error','success');
  if(isError) eventFormStatus.classList.add('error');
  if(isSuccess) eventFormStatus.classList.add('success');
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
