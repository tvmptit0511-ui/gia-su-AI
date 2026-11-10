const TOKEN_KEY = 'gia-su-ai.access-token';
const EXPIRY_KEY = 'gia-su-ai.token-expires-at';
let currentUser = null;
let expiryTimer;
let loginHint = null;

function readStorage(key) {
  try { return sessionStorage.getItem(key) || ''; } catch { return ''; }
}

let accessToken = readStorage(TOKEN_KEY);
let expiresAt = Number(readStorage(EXPIRY_KEY)) || 0;

function notify(reason) {
  window.dispatchEvent(new CustomEvent('authchange', { detail: { reason } }));
}

function writeStorage() {
  try {
    if (accessToken) {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      sessionStorage.setItem(EXPIRY_KEY, String(expiresAt));
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(EXPIRY_KEY);
    }
  } catch { /* Phiên vẫn dùng được trong bộ nhớ nếu trình duyệt chặn storage. */ }
}

function scheduleExpiry() {
  clearTimeout(expiryTimer);
  if (accessToken && expiresAt) {
    expiryTimer = setTimeout(() => clearSession('expired'), Math.max(0, expiresAt - Date.now()));
  }
}

export function getAccessToken() {
  if (accessToken && expiresAt && Date.now() >= expiresAt) clearSession('expired');
  return accessToken;
}

export function getCurrentUser() { return currentUser; }

export function setCurrentUser(user, { notifyChange = true } = {}) {
  currentUser = user;
  if (notifyChange) notify('user');
}

export function saveSession(result) {
  if (!result?.access_token || !result.user?.id || !Number.isFinite(result.expires_in) || result.expires_in <= 0) {
    throw new Error('Phản hồi đăng nhập chưa hợp lệ. Vui lòng thử lại.');
  }
  accessToken = result.access_token;
  expiresAt = Date.now() + result.expires_in * 1000;
  currentUser = result.user;
  writeStorage();
  scheduleExpiry();
  notify('login');
}

export function clearSession(reason = 'logout') {
  const changed = Boolean(accessToken || currentUser);
  accessToken = '';
  expiresAt = 0;
  currentUser = null;
  clearTimeout(expiryTimer);
  writeStorage();
  if (changed) notify(reason);
}

export function setLoginHint(hint) { loginHint = hint; }
export function takeLoginHint() {
  const hint = loginHint;
  loginHint = null;
  return hint;
}

export function loginDestination() {
  const query = new URLSearchParams(location.hash.split('?')[1]);
  const next = query.get('next') || 'home';
  return /^(home|chat|practice|results|dashboard|profile|history|admin)(\?[^#]*)?$/.test(next) ? next : 'home';
}

scheduleExpiry();
