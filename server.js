const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

console.log('Booting server from', __filename);
const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data', 'events.json');
const REG_FILE = path.join(__dirname, 'data', 'registrations.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

function loadEvents() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read events file', err);
    return [];
  }
}

function loadRegistrations() {
  try {
    const raw = fs.readFileSync(REG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read registrations file', err);
    return [];
  }
}

function saveEvents(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist events', err);
  }
}

function saveRegistrations(data) {
  try {
    fs.writeFileSync(REG_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist registrations', err);
  }
}

app.get('/api/events', (req, res) => {
  const events = loadEvents();
  const { category, q } = req.query;
  const query = (q || '').toLowerCase();
  const filtered = events.filter((event) => {
    const matchesCat = !category || category === 'all' || event.category === category;
    const matchesQuery = !query || `${event.title} ${event.excerpt} ${event.content}`.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(filtered);
});

app.get('/api/events/:id', (req, res) => {
  const events = loadEvents();
  const event = events.find((item) => item.id === Number(req.params.id));
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

app.post('/api/events', (req, res) => {
  const events = loadEvents();
  const payload = req.body || {};
  const required = ['title', 'category', 'date', 'excerpt', 'content'];
  const missing = required.filter((field) => !payload[field]);
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
  }

  const nextId = events.reduce((max, evt) => Math.max(max, Number(evt.id) || 0), 0) + 1;
  const newEvent = {
    id: nextId,
    title: payload.title.trim(),
    category: payload.category.trim().toLowerCase(),
    date: payload.date,
    excerpt: payload.excerpt.trim(),
    content: payload.content.trim(),
    location: payload.location || 'To be announced',
    startTime: payload.startTime || '09:00',
    endTime: payload.endTime || '17:00',
    speakers: Array.isArray(payload.speakers) ? payload.speakers : (payload.speakers ? String(payload.speakers).split(',').map((s) => s.trim()).filter(Boolean) : []),
    registrationLink: payload.registrationLink || '',
    contactEmail: payload.contactEmail || 'events@mitmysore.edu',
    highlights: Array.isArray(payload.highlights) ? payload.highlights : (payload.highlights ? String(payload.highlights).split(',').map((h) => h.trim()).filter(Boolean) : []),
    color1: payload.color1 || '#ff7ab6',
    color2: payload.color2 || '#7afcff'
  };

  events.push(newEvent);
  saveEvents(events);
  res.status(201).json(newEvent);
});

app.delete('/api/events/:id', (req, res) => {
  const events = loadEvents();
  const id = Number(req.params.id);
  const exists = events.some((event) => event.id === id);
  if (!exists) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const filtered = events.filter((event) => event.id !== id);
  saveEvents(filtered);
  res.json({ message: 'Event deleted' });
});

app.get('/api/registrations', (req, res) => {
  const registrations = loadRegistrations();
  const { eventId } = req.query;
  const filtered = eventId
    ? registrations.filter((reg) => reg.eventId === Number(eventId))
    : registrations;
  res.json(filtered);
});

app.post('/api/registrations', (req, res) => {
  const events = loadEvents();
  const payload = req.body || {};
  const required = ['eventId', 'name', 'email'];
  const missing = required.filter((field) => !payload[field]);
  if (missing.length) {
    return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
  }

  const eventId = Number(payload.eventId);
  const eventExists = events.some((evt) => evt.id === eventId);
  if (!eventExists) {
    return res.status(404).json({ message: 'Event not found for registration' });
  }

  const registrations = loadRegistrations();
  const registration = {
    id: Date.now(),
    eventId,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    department: payload.department || '',
    year: payload.year || '',
    phone: payload.phone || '',
    notes: payload.notes || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  registrations.push(registration);
  saveRegistrations(registrations);

  res.status(201).json({ message: 'Registration saved', registration });
});

app.patch('/api/registrations/:id', (req, res) => {
  const { status } = req.body || {};
  const allowed = ['pending', 'accepted', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }
  const registrations = loadRegistrations();
  const id = Number(req.params.id);
  const registration = registrations.find((reg) => reg.id === id);
  if (!registration) {
    return res.status(404).json({ message: 'Registration not found' });
  }
  registration.status = status;
  registration.updatedAt = new Date().toISOString();
  saveRegistrations(registrations);
  res.json({ message: 'Registration updated', registration });
});

console.log('Registration routes ready');
if (app._router && Array.isArray(app._router.stack)) {
  const routes = app._router.stack
    .filter(layer => layer.route)
    .map(layer => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
  console.log('Registered paths:', routes);
}

app.listen(PORT, () => {
  console.log(`Events API running on http://localhost:${PORT}`);
  if (app._router && Array.isArray(app._router.stack)) {
    const routes = app._router.stack
      .filter(layer => layer.route)
      .map(layer => `${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
    console.log('Registered paths:', routes);
  }
});
