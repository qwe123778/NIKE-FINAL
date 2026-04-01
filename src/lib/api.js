const BASE = import.meta.env.VITE_API_URL;

let _getToken = null;

export const setTokenGetter = (fn) => { _getToken = fn; };

const apiFetch = async (path, options = {}) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (_getToken) {
    try {
      const token = await _getToken({ template: null });
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // user not signed in, no token
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // ✅ include cookies
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
};

export default apiFetch;