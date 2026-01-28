const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const ACCOUNTS_KEY = 'portalAccounts';

function loadAccounts(){
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
}

const pendingSignupRaw = sessionStorage.getItem('pendingSignup');
let pendingSignupData;
if(pendingSignupRaw){
  try {
    pendingSignupData = JSON.parse(pendingSignupRaw);
  } catch {
    pendingSignupData = undefined;
  }
  sessionStorage.removeItem('pendingSignup');
}

// Clear prior role so visiting /login.html always forces a fresh selection
sessionStorage.removeItem('portalRole');
sessionStorage.removeItem('portalEmail');
sessionStorage.removeItem('portalName');
sessionStorage.removeItem('portalPhoto');
sessionStorage.removeItem('portalDepartment');
sessionStorage.removeItem('portalYear');
sessionStorage.removeItem('portalPhone');

if(loginForm && pendingSignupData){
  const emailField = loginForm.querySelector('input[name="email"]');
  const roleField = loginForm.querySelector('select[name="role"]');
  if(emailField && pendingSignupData.email) emailField.value = pendingSignupData.email;
  if(roleField && pendingSignupData.role){
    roleField.value = pendingSignupData.role;
  }
  setStatus('Signup completed. Please log in to continue.');
}


loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(loginForm);
  const role = data.get('role');
  const email = data.get('email')?.trim();
  const password = data.get('password')?.trim();
  if(!email || !password || !role){
    setStatus('Please complete all fields.', true);
    return;
  }
  const normalizedEmail = email.toLowerCase();
  const accounts = loadAccounts();
  const account = accounts.find(acc => acc.email === normalizedEmail && acc.role === role);

  if(!account){
    setStatus('Invalid credentials. Please check your email, password, or role.', true);
    return;
  }
  if(account.password !== password){
    setStatus('Incorrect password for this account.', true);
    return;
  }

  setStatus('Login successful. Routing you to the portal…');
  sessionStorage.setItem('portalRole', role);
  sessionStorage.setItem('portalEmail', normalizedEmail);
  sessionStorage.setItem('portalName', account.name || 'Student');
  sessionStorage.setItem('portalPhoto', account.photo || '');
  sessionStorage.setItem('portalDepartment', account.department || '');
  sessionStorage.setItem('portalYear', account.year || '');
  sessionStorage.setItem('portalPhone', account.phone || '');
  setTimeout(()=>{
    if(role === 'admin'){
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }, 400);
});

function setStatus(message, isError = false){
  if(!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.classList.toggle('error', Boolean(isError));
}
