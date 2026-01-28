'use strict';

const ACCOUNTS_KEY = 'portalAccounts';
const MAX_SOCIAL_LINKS = 3;
const THEME_KEY = 'profileThemeMode';

const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const profileFormStatus = document.getElementById('profileFormStatus');
const passwordFormStatus = document.getElementById('passwordFormStatus');
const bioCountEl = document.getElementById('bioCount');
const profileSummaryName = document.getElementById('profileSummaryName');
const profileSummaryRole = document.getElementById('profileSummaryRole');
const profileSummaryDept = document.getElementById('profileSummaryDept');
const profileSummaryEmail = document.getElementById('profileSummaryEmail');
const profileSummaryPhone = document.getElementById('profileSummaryPhone');
const profileSummaryBio = document.getElementById('profileSummaryBio');
const profileLinksEl = document.getElementById('profileLinks');
const profilePhotoBadge = document.getElementById('profilePhotoBadge');
const headerNameEl = document.getElementById('profileName');
const headerEmailEl = document.getElementById('profileEmail');
const headerRoleEl = document.getElementById('profileRole');
const headerAvatarEl = document.getElementById('profileAvatar');
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

const role = (document.documentElement.dataset.role || 'user').includes('admin') ? 'admin' : 'user';
const activeEmail = sessionStorage.getItem('portalEmail');
let account = null;
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
themeToggle?.addEventListener('click', () => {
  const next = root.classList.contains('light-theme') ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

initProfilePage();

function initProfilePage(){
  if(!activeEmail){
    window.location.replace('login.html');
    return;
  }
  account = normalizeAccount(findAccount(activeEmail));
  if(!account){
    setProfileStatus('Unable to load your account. Please log in again.', true);
    return;
  }
  hydrateHeader();
  fillProfileForm(account);
  updateSummary(account);
  attachEvents();
}

function attachEvents(){
  profileForm?.addEventListener('input', (event) => {
    if(event.target.name === 'bio'){
      updateBioCount(event.target.value.length);
    }
  });

  profileForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if(!account) return;
    const formData = new FormData(profileForm);
    const payload = buildProfilePayload(formData);
    if(!payload) return;
    const updated = persistAccount(activeEmail, payload);
    if(!updated){
      setProfileStatus('Unable to save profile right now.', true);
      return;
    }
    account = updated;
    updateSummary(account);
    updateBioCount(account.bio.length);
    updateSessionFromAccount(account);
    hydrateHeader();
    setProfileStatus('Profile updated successfully.');
  });

  passwordForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if(!account) return;
    const formData = new FormData(passwordForm);
    const currentPassword = (formData.get('currentPassword') || '').trim();
    const newPassword = (formData.get('newPassword') || '').trim();
    const confirmPassword = (formData.get('confirmPassword') || '').trim();

    if(!currentPassword || !newPassword || !confirmPassword){
      setPasswordStatus('Fill in all password fields.', true);
      return;
    }
    if(currentPassword !== account.password){
      setPasswordStatus('Current password is incorrect.', true);
      return;
    }
    if(newPassword.length < 6){
      setPasswordStatus('New password must be at least 6 characters.', true);
      return;
    }
    if(newPassword === currentPassword){
      setPasswordStatus('New password must be different from the old password.', true);
      return;
    }
    if(newPassword !== confirmPassword){
      setPasswordStatus('New password and confirmation do not match.', true);
      return;
    }

    const updated = persistAccount(activeEmail, { password: newPassword });
    if(!updated){
      setPasswordStatus('Unable to update password.', true);
      return;
    }
    account = updated;
    passwordForm.reset();
    setPasswordStatus('Password updated successfully. Keep it safe.');
  });
}

function buildProfilePayload(formData){
  const name = (formData.get('name') || '').trim();
  const phone = (formData.get('phone') || '').trim();
  const department = (formData.get('department') || '').trim();
  const year = (formData.get('year') || '').trim();
  const photo = (formData.get('photo') || '').trim();
  const bio = (formData.get('bio') || '').trim();
  const socialLinks = Array.from({ length: MAX_SOCIAL_LINKS }, (_, i) => (formData.get(`socialLink${i + 1}`) || '').trim())
    .filter(Boolean);

  if(!name){
    setProfileStatus('Name is required.', true);
    return null;
  }

  if(role === 'user' && (!department || !year)){
    setProfileStatus('Department and year are required for students.', true);
    return null;
  }

  if(phone && !/^\d{10}$/.test(phone)){
    setProfileStatus('Phone number must be 10 digits.', true);
    return null;
  }

  const invalidLink = socialLinks.find(link => !/^https?:\/\//i.test(link));
  if(invalidLink){
    setProfileStatus('Social links must start with http:// or https://', true);
    return null;
  }

  return {
    name,
    phone,
    department,
    year,
    photo,
    bio,
    socialLinks,
  };
}

function fillProfileForm(acc){
  if(!profileForm) return;
  profileForm.elements.name.value = acc.name || '';
  profileForm.elements.email.value = acc.email;
  if(profileForm.elements.phone) profileForm.elements.phone.value = acc.phone || '';
  if(profileForm.elements.department) profileForm.elements.department.value = acc.department || '';
  if(profileForm.elements.year) profileForm.elements.year.value = acc.year || '';
  if(profileForm.elements.photo) profileForm.elements.photo.value = acc.photo || '';
  if(profileForm.elements.bio) profileForm.elements.bio.value = acc.bio || '';

  for(let i = 0; i < MAX_SOCIAL_LINKS; i += 1){
    const field = profileForm.elements[`socialLink${i + 1}`];
    if(field) field.value = acc.socialLinks[i] || '';
  }

  updateBioCount(acc.bio.length);
}

function updateSummary(acc){
  if(profileSummaryName) profileSummaryName.textContent = acc.name || 'User';
  if(profileSummaryRole) profileSummaryRole.textContent = role === 'admin' ? 'Administrator' : 'Student';
  const deptText = acc.department || 'Department';
  const yearText = acc.year || 'Year';
  if(profileSummaryDept) profileSummaryDept.textContent = `${deptText} • ${yearText}`;
  if(profileSummaryEmail) profileSummaryEmail.textContent = acc.email;
  if(profileSummaryPhone) profileSummaryPhone.textContent = acc.phone ? `Phone ${acc.phone}` : 'Phone —';
  if(profileSummaryBio) profileSummaryBio.textContent = acc.bio || 'Use the editor to add your bio and let others know more about you.';
  renderSocialLinks(acc.socialLinks);
  setAvatar(profilePhotoBadge, acc.photo, acc.name);
}

function renderSocialLinks(links){
  if(!profileLinksEl) return;
  const list = (Array.isArray(links) ? links : []).filter(Boolean);
  if(!list.length){
    profileLinksEl.innerHTML = '<p class="profile-meta">Add your social or portfolio links above.</p>';
    return;
  }
  profileLinksEl.innerHTML = list.map(link => `<a href="${link}" target="_blank" rel="noopener">${link}</a>`).join('');
}

function setAvatar(node, photoUrl, name){
  if(!node) return;
  if(photoUrl){
    node.style.backgroundImage = `url('${photoUrl}')`;
    node.textContent = '';
    node.classList.add('has-photo');
  } else {
    node.style.backgroundImage = '';
    node.textContent = (name || 'U').trim().charAt(0).toUpperCase();
    node.classList.remove('has-photo');
  }
}

function hydrateHeader(){
  if(!headerNameEl || !headerEmailEl || !headerRoleEl) return;
  const displayName = sessionStorage.getItem('portalName') || account?.name || 'User';
  const displayEmail = sessionStorage.getItem('portalEmail') || account?.email || '';
  headerNameEl.textContent = displayName;
  headerEmailEl.textContent = displayEmail;
  headerRoleEl.textContent = role === 'admin' ? 'Admin' : 'Student';
  setAvatar(headerAvatarEl, sessionStorage.getItem('portalPhoto') || account?.photo || '', displayName);
}

function updateSessionFromAccount(acc){
  sessionStorage.setItem('portalName', acc.name || 'User');
  sessionStorage.setItem('portalPhoto', acc.photo || '');
  sessionStorage.setItem('portalDepartment', acc.department || '');
  sessionStorage.setItem('portalYear', acc.year || '');
  sessionStorage.setItem('portalPhone', acc.phone || '');
}

function updateBioCount(length){
  if(!bioCountEl) return;
  bioCountEl.textContent = length || 0;
}

function applyTheme(mode = 'dark'){
  const light = mode === 'light';
  const bg = light ? '#f7fbff' : '#0f1724';
  const text = light ? '#021229' : '#e6f0ff';
  const muted = light ? '#4b6278' : '#9fb2d6';
  root.style.setProperty('--bg', bg);
  root.style.setProperty('--text', text);
  root.style.setProperty('--muted', muted);
  root.classList.toggle('light-theme', light);
  if(themeToggle) themeToggle.textContent = light ? '☀️' : '🌙';
}

function setProfileStatus(message, isError = false){
  if(!profileFormStatus) return;
  profileFormStatus.textContent = message;
  profileFormStatus.classList.remove('error','success');
  profileFormStatus.classList.add(isError ? 'error' : 'success');
}

function setPasswordStatus(message, isError = false){
  if(!passwordFormStatus) return;
  passwordFormStatus.textContent = message;
  passwordFormStatus.classList.remove('error','success');
  passwordFormStatus.classList.add(isError ? 'error' : 'success');
}

function loadAccounts(){
  try{
    const stored = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
    if(Array.isArray(stored)) return stored;
    return [];
  }catch{
    return [];
  }
}

function saveAccounts(list){
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

function findAccount(email){
  return loadAccounts().find(acc => acc.email === email);
}

function persistAccount(email, updates){
  const accounts = loadAccounts();
  const index = accounts.findIndex(acc => acc.email === email);
  if(index === -1) return null;
  accounts[index] = normalizeAccount({ ...accounts[index], ...updates });
  saveAccounts(accounts);
  return accounts[index];
}

function normalizeAccount(acc){
  if(!acc) return null;
  return {
    name: acc.name || 'User',
    email: acc.email,
    password: acc.password || '',
    role: acc.role || role,
    phone: acc.phone || '',
    department: acc.department || '',
    year: acc.year || '',
    bio: acc.bio || '',
    photo: acc.photo || '',
    socialLinks: Array.isArray(acc.socialLinks) ? acc.socialLinks.filter(Boolean).slice(0, MAX_SOCIAL_LINKS) : [],
  };
}
