import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccessToken } from '../api/http.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.auth.me()
      .then(r => { if (alive) setUser(r.user || r); })
      .catch(()=>{})
      .finally(()=> alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const login = async ({ email, password }) => {
    const r = await api.auth.login(email, password);
    if (r.accessToken) setAccessToken(r.accessToken);
    // fetch user
    const me = await api.auth.me().catch(()=>null);
    setUser(me?.user || me);
  };

  const register = async ({ name, email, password }) => {
    const r = await api.auth.register(name, email, password);
    if (r.accessToken) setAccessToken(r.accessToken);
    const me = await api.auth.me().catch(()=>null);
    setUser(me?.user || me);
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch {}
    setAccessToken(null);
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
