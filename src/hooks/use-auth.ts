import { useState, useEffect } from 'react';
import { account } from './appwrite';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await account.createEmailPasswordSession(email, password);
    const userData = await account.get();
    setUser(userData);
  };

  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
  };

  return { user, loading, login, logout };
}