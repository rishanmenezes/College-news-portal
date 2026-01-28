(function enforceRoleGate(){
  const root = document.documentElement;
  if(!root) return;
  const required = (root.dataset.role || '').split(',').map(r => r.trim()).filter(Boolean);
  const activeRole = sessionStorage.getItem('portalRole');

  if(required.length && !activeRole){
    window.location.replace('login.html');
    return;
  }

  if(required.length && activeRole && !required.includes(activeRole)){
    window.location.replace(activeRole === 'admin' ? 'admin.html' : 'index.html');
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        sessionStorage.removeItem('portalRole');
        sessionStorage.removeItem('portalEmail');
        sessionStorage.removeItem('portalName');
        sessionStorage.removeItem('portalPhoto');
        sessionStorage.removeItem('portalDepartment');
        sessionStorage.removeItem('portalYear');
        sessionStorage.removeItem('portalPhone');
        window.location.replace('login.html');
      });
    });
  });
})();
