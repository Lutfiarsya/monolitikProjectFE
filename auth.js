const API_BASE = 'http://localhost:3000';


async function getLoggedInUser() {
  try {
    const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
    if (!res.ok) return null;

    const json = await res.json();
    return json.user || null;
  } catch (err) {
    console.error('Gagal cek sesi:', err);
    return null;
  }
}

async function requireLogin() {
  const user = await getLoggedInUser();
  if (!user) {
    console.warn('Belum login / sesi habis, redirect ke login.html');
    window.location.href = '/frontend/page/login.html';
    return null;
  }
  return user;
}

async function logout() {
  await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
  window.location.href = '/frontend/page/login.html';
}