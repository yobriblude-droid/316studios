import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { apiFetch } from '../../lib/api';

export default function ClientAccountPage() {
  const { user, refreshUser } = useAuth();
  const { toast, preferences, updatePreferences } = useNotifications();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      localStorage.setItem('user', JSON.stringify(data));
      await refreshUser?.();
      toast({ type: 'success', title: 'Profile updated' });
    } catch (err) {
      toast({ type: 'error', title: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const body = new FormData();
    body.append('avatar', file);
    const res = await apiFetch('/api/auth/avatar', { method: 'POST', body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    setAvatarUrl(data.avatarUrl);
    localStorage.setItem('user', JSON.stringify(data));
    await refreshUser?.();
    toast({ type: 'success', title: 'Photo updated' });
  };

  const removeAvatar = async () => {
    const res = await apiFetch('/api/auth/avatar', { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    setAvatarUrl(null);
    localStorage.setItem('user', JSON.stringify(data));
    await refreshUser?.();
    toast({ type: 'success', title: 'Photo removed' });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ type: 'error', title: 'Passwords do not match' });
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ type: 'success', title: 'Password changed' });
    } catch (err) {
      toast({ type: 'error', title: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="glass-panel-v2 border border-glass-border p-6 md:p-8">
        <h2 className="text-lg font-black uppercase tracking-tight mb-6">Profile photo</h2>
        <AvatarUpload name={name} avatarUrl={avatarUrl} onUpload={uploadAvatar} onRemove={removeAvatar} />
      </section>

      <section className="glass-panel-v2 border border-glass-border p-6 md:p-8">
        <h2 className="text-lg font-black uppercase tracking-tight mb-6">Account details</h2>
        <form onSubmit={saveProfile} className="space-y-4 max-w-md">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="primary" disabled={saving}>
            Save profile
          </Button>
        </form>
      </section>

      <section className="glass-panel-v2 border border-glass-border p-6 md:p-8">
        <h2 className="text-lg font-black uppercase tracking-tight mb-6">Security</h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" variant="primary" disabled={saving}>
            Change password
          </Button>
        </form>
      </section>

      {preferences && (
        <section className="glass-panel-v2 border border-glass-border p-6 md:p-8">
          <h2 className="text-lg font-black uppercase tracking-tight mb-6">Notifications</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
            {(
              [
                ['emailEnabled', 'Email alerts'],
                ['pushEnabled', 'In-app toasts'],
                ['commentAlerts', 'File comments'],
                ['approvalAlerts', 'Approval updates'],
                ['requestAlerts', 'Request status'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={Boolean(preferences[key])}
                  onChange={(e) => updatePreferences({ [key]: e.target.checked })}
                  className="w-4 h-4 accent-[var(--primary)]"
                />
                {label}
              </label>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
