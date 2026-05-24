import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiFetch } from '../lib/api';
import type { StaffPermissionsMap } from '../lib/roles';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  staffPermissions?: StaffPermissionsMap;
};

type AdminContextValue = {
  adminUser: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminUser')) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    apiFetch('/api/admin/me')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        const data = await res.json();
        localStorage.setItem('adminUser', JSON.stringify(data));
        setAdminUser(data);
      })
      .catch(() => {
        localStorage.removeItem('adminUser');
        setAdminUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.adminUser) {
        localStorage.setItem('adminUser', JSON.stringify(data.adminUser));
        setAdminUser(data.adminUser);
        return { success: true };
      }
      const message = [data.error, data.hint].filter(Boolean).join(' — ');
      return { success: false, error: message || 'Login failed' };
    } catch {
      return { success: false, error: 'Cannot reach API. Set API_URL on Vercel to your backend URL.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    apiFetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <AdminContext.Provider value={{ adminUser, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};

export default AdminProvider;
