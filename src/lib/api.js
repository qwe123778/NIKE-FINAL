// lib/api.js
const BASE = import.meta.env.VITE_API_URL;

let _getToken = null;

// Register a global token getter
export const setTokenGetter = (fn) => {
  _getToken = fn;
};

const apiFetch = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach Clerk token if available
  if (_getToken) {
    try {
      const token = await _getToken({ template: null });
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // not signed in, skip token
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // include cookies for Clerk sessions
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
};

export default apiFetch;