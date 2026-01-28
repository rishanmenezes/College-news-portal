const API_BASE = 'http://localhost:4000/api';

let news = [];
let isLoading = true;
let loadError = null;

const newsGrid = document.getElementById('newsGrid');
const cardTemplate = document.getElementById('cardTemplate');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryTabs = document.getElementById('categoryTabs');
const tabLeft = document.getElementById('tabLeft');
const tabRight = document.getElementById('tabRight');
const themeToggle = document.getElementById('themeToggle');
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');
const profileRoleEl = document.getElementById('profileRole');
const profileAvatarEl = document.getElementById('profileAvatar');

const CATEGORY_IMAGES = {
  campus: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  academics: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  events: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  hackathon: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  placements: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=1200&q=80',
  seminar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  competition: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';

let activeCategory = 'all';
let query = '';

function hydrateProfile(){
  if(!profileNameEl || !profileEmailEl || !profileRoleEl) return;
  const name = sessionStorage.getItem('portalName') || 'Student';
  const email = sessionStorage.getItem('portalEmail') || 'you@mitmysore.edu';
  const role = sessionStorage.getItem('portalRole') || 'user';
  profileNameEl.textContent = name;
  profileEmailEl.textContent = email;
  profileRoleEl.textContent = role === 'admin' ? 'Admin' : 'Student';
  if(profileAvatarEl){
    const initial = name.trim().charAt(0).toUpperCase() || 'S';
    profileAvatarEl.textContent = initial;
  }
}

function getImageFor(item){
  const key = item?.category?.toLowerCase();
  return CATEGORY_IMAGES[key] || DEFAULT_IMAGE;
}

function render(){
  if(isLoading){
    newsGrid.innerHTML = '<p class="status-note">Loading events…</p>';
    return;
  }

  if(loadError){
    newsGrid.innerHTML = `<p class="status-note error">${loadError}</p>`;
    return;
  }

  newsGrid.innerHTML = '';
  const sorted = news.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const list = sorted.filter(item=>{
    const matchesCat = activeCategory==='all' || item.category===activeCategory;
    const matchesQuery = query.length===0 || (item.title+item.excerpt+item.content).toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  if(list.length===0){
    newsGrid.innerHTML = '<p class="status-note">No events match your filters.</p>';
    return;
  }

  list.forEach(item=>{
    const node = cardTemplate.content.cloneNode(true);
    const card = node.querySelector('.card');
    card.dataset.cat = item.category;
    if(item.category === 'events') card.classList.add('is-event');
    const media = node.querySelector('.card-media');
    const mediaImg = node.querySelector('.card-image');
    const title = node.querySelector('.card-title');
    const excerpt = node.querySelector('.card-excerpt');
    const badge = node.querySelector('.badge');
    const date = node.querySelector('.date');
    const readBtn = node.querySelector('.read-btn');
    const registerBtn = node.querySelector('.card-register');

    media.style.background = `linear-gradient(135deg, ${item.color1}, ${item.color2})`;
    if(mediaImg){
      const imageUrl = getImageFor(item);
      mediaImg.src = imageUrl;
      mediaImg.alt = `${item.title} visual`;
    }
    badge.textContent = item.category.toUpperCase();
    date.textContent = new Date(item.date).toLocaleDateString();
    title.textContent = item.title;
    excerpt.textContent = item.excerpt;

    const readUrl = `event.html?id=${encodeURIComponent(item.id)}`;
    const registerUrl = `register.html?id=${encodeURIComponent(item.id)}`;
    readBtn.href = readUrl;
    readBtn.setAttribute('aria-label', `Read more about ${item.title}`);
    registerBtn.href = registerUrl;
    registerBtn.setAttribute('aria-label', `Register for ${item.title}`);

    card.addEventListener('pointerdown', ()=>{
      if(item.category === 'events'){
        card.classList.add('pop-large');
      } else {
        card.classList.add('pop');
      }
    });
    card.addEventListener('pointerup', ()=>{
      setTimeout(()=>{ card.classList.remove('pop'); card.classList.remove('pop-large'); },180);
    });
    card.addEventListener('pointerleave', ()=>{ card.classList.remove('pop'); card.classList.remove('pop-large'); });

    newsGrid.appendChild(node);
  });
}

async function init(){
  try {
    const response = await fetch(`${API_BASE}/events`, { cache: 'no-store' });
    if(!response.ok) throw new Error('Events API responded with an error');
    news = await response.json();
    loadError = null;
  } catch (err) {
    console.error('Failed to load events', err);
    loadError = 'Unable to load events. Please make sure the backend server is running (npm start).';
  } finally {
    isLoading = false;
    render();
  }
}

// Event bindings
searchInput.addEventListener('input', e=>{
  query = e.target.value.trim().toLowerCase();
  render();
});

filterBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    render();
  });
});
if(categoryTabs){
  // When header filter buttons are clicked, also update the sliding tabs selection
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      const tab = categoryTabs.querySelector(`.tab[data-cat="${cat}"]`);
      if (tab) {
        categoryTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // bring into view
        tab.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
      }
    });
  });

  // Category tabs behavior (delegated click + safer drag/scroll)
  if(tabLeft){
    tabLeft.addEventListener('click', ()=>{ categoryTabs.scrollBy({left:-220,behavior:'smooth'}); });
  }
  if(tabRight){
    tabRight.addEventListener('click', ()=>{ categoryTabs.scrollBy({left:220,behavior:'smooth'}); });
  }

  // Delegated click handler for tabs (works with dynamic tabs and avoids lost listeners)
  let isDown = false, startX = 0, scrollLeftVal = 0, isDragging = false;
  let lastPointer = {x:0,y:0};
  let lastTab = null;
  categoryTabs.addEventListener('pointerdown', (e) => {
    // only start drag on primary button
    if (e.button && e.button !== 0) return;
    isDown = true;
    isDragging = false;
    startX = e.clientX;
    scrollLeftVal = categoryTabs.scrollLeft;
    lastPointer.x = e.clientX; lastPointer.y = e.clientY;
    categoryTabs.setPointerCapture && categoryTabs.setPointerCapture(e.pointerId);
    categoryTabs.classList.add('dragging');
    // tab pop feedback: if pointerdown on a tab, add quick class
    const t = e.target.closest && e.target.closest('.tab');
    if(t){ lastTab = t; t.classList.add('tab-pop'); }
  });

  categoryTabs.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) isDragging = true;
    if (isDragging) {
      categoryTabs.scrollLeft = scrollLeftVal - dx;
      // if dragging, remove tab pop visual
      if(lastTab){ lastTab.classList.remove('tab-pop'); lastTab = null; }
    }
  });

  categoryTabs.addEventListener('pointerup', (e) => {
    isDown = false;
    try { categoryTabs.releasePointerCapture && categoryTabs.releasePointerCapture(e.pointerId); } catch (err) {}
    categoryTabs.classList.remove('dragging');
    // small timeout to allow click suppression then reset dragging flag
    setTimeout(()=>{ isDragging = false; }, 20);
    // remove any tab pop class
    if(lastTab){ lastTab.classList.remove('tab-pop'); lastTab = null; }
  });
  categoryTabs.addEventListener('pointercancel', () => { isDown = false; categoryTabs.classList.remove('dragging'); });

  categoryTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    // if user was dragging or moved a lot, ignore click
    const clickX = (e.clientX !== undefined) ? e.clientX : (e.pageX || 0);
    const clickY = (e.clientY !== undefined) ? e.clientY : (e.pageY || 0);
    const dx = clickX - lastPointer.x; const dy = clickY - lastPointer.y;
    if (isDragging || Math.hypot(dx,dy) > 8) { e.preventDefault(); return; }
    // select the tab
    const cat = tab.dataset.cat;
    // remove active from all tabs and set on clicked
    categoryTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCategory = cat;
    // sync top filter buttons if present
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    // ensure selected tab is visible
    tab.scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
    render();
  });
}

// Theme toggle: invert for a lighter look
let light = false;
themeToggle.addEventListener('click', ()=>{
  light = !light;
  document.documentElement.style.setProperty('--bg', light? '#f7fbff' : '#0f1724');
  document.documentElement.style.setProperty('--text', light? '#021229' : '#e6f0ff');
  document.documentElement.style.setProperty('--muted', light? '#4b6278' : '#9fb2d6');
  // toggle a CSS class so we can override complex background layers in CSS
  document.documentElement.classList.toggle('light-theme', light);
  themeToggle.textContent = light? '☀️' : '🌙';
});

// Initial render
hydrateProfile();
render();
init();
