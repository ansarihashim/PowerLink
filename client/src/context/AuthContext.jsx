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
        const rt = await api.auth.refresh().catch(() => null);
        if (rt?.accessToken) {
          setAccessToken(rt.accessToken);
          const me = await api.auth.me().catch(()=>null);
          if (alive && me) setUser(me.user || me);
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
    try {
      const r = await api.auth.login(email, password);
      if (r.accessToken) setAccessToken(r.accessToken);
      if (r.user) setUser(r.user); else {
        const me = await api.auth.me().catch(()=>null);
        setUser(me?.user || me);
      }
    } catch (err) {
      // rethrow with clearer message
      if (/Invalid credentials/i.test(err.message)) {
        throw new Error('Invalid email or password');
      }
      throw err;
    }
  }, []);

  const register = useCallback( async ({ name, email, password }) => {
    try {
      const r = await api.auth.register(name, email, password);
      if (r.accessToken) setAccessToken(r.accessToken);
      if (r.user) setUser(r.user); else {
        const me = await api.auth.me().catch(()=>null);
        setUser(me?.user || me);
      }
      return r; // Return the response so caller can check accountStatus
    } catch (err) {
      if (/Email already registered/i.test(err.message)) {
        throw new Error('Email already in use');
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch {}
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser(u => u ? { ...u, ...patch } : u);
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, register, logout, updateUser }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
