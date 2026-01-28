const signupForm = document.getElementById('signupForm');
const signupStatus = document.getElementById('signupStatus');
const ACCOUNTS_KEY = 'portalAccounts';

function loadAccounts(){
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts){
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}


signupForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(signupForm);
  const name = data.get('name')?.toString().trim();
  const email = data.get('email')?.toString().trim();
  const password = data.get('password')?.toString();
  const confirm = data.get('confirm')?.toString();
  const role = data.get('role')?.toString();

  if(!role || !name || !email || !password || !confirm){
    setStatus('Please complete every field.', true);
    return;
  }
  if(password.length < 6){
    setStatus('Password must be at least 6 characters.', true);
    return;
  }
  if(password !== confirm){
    setStatus('Passwords do not match.', true);
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const accounts = loadAccounts();
  const alreadyExists = accounts.some(acc => acc.email === normalizedEmail);
  if(alreadyExists){
    setStatus('An account with this email already exists. Please login instead.', true);
    return;
  }

  accounts.push({
    name,
    email: normalizedEmail,
    password,
    role,
    phone: '',
    department: '',
    year: '',
    bio: '',
    photo: '',
    socialLinks: []
  });
  saveAccounts(accounts);

  setStatus('Account created. Redirecting you to login…');
  sessionStorage.setItem('pendingSignup', JSON.stringify({ name, email, role }));
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
});

function setStatus(message, isError = false){
  if(!signupStatus) return;
  signupStatus.textContent = message;
  signupStatus.classList.toggle('error', Boolean(isError));
}
