import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAccessToken } from '../api/http.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial auth bootstrap: try refresh -> me, suppress console errors
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Attempt silent refresh to obtain access token (if refresh cookie exists)
        const rt = await api.auth.refresh().catch(() => null);
        if (rt?.accessToken) setAccessToken(rt.accessToken);
        // Only call /me if we have (or just received) an access token
        if (accessToken || rt?.accessToken) {
          const me = await api.auth.me();
          if (alive) setUser(me.user || me);
        }
      } catch (_) {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async ({ email, password }) => {
    const r = await api.auth.login(email, password);
    if (r.accessToken) setAccessToken(r.accessToken);
    // Response already contains user (per backend controller)
    if (r.user) setUser(r.user); else {
      // fallback fetch
      const me = await api.auth.me().catch(()=>null);
      setUser(me?.user || me);
    }
  }, []);

  const register = useCallback( async ({ name, email, password }) => {
    const r = await api.auth.register(name, email, password);
    if (r.accessToken) setAccessToken(r.accessToken);
    if (r.user) setUser(r.user); else {
      const me = await api.auth.me().catch(()=>null);
      setUser(me?.user || me);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
