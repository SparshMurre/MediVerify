/* =========================================================
   auth.js — Simple Authentication System
   ========================================================= */

const Auth = (() => {
  const ACCOUNTS = [
    { email: 'admin@med.com', password: '1234', role: 'admin', name: 'Administrator' },
    { email: 'user@med.com',  password: '1234', role: 'user',  name: 'Verification User' }
  ];

  const SESSION_KEY = 'mediverify_session';

  function login(email, password) {
    const account = ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
    );
    if (!account) return null;
    const session = { email: account.email, role: account.role, name: account.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function isAdmin() {
    const s = getSession();
    return s && s.role === 'admin';
  }

  return { login, logout, getSession, isLoggedIn, isAdmin };
})();
