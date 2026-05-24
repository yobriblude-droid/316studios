import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { apiFetch } from '../../lib/api';
import { Link } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin';
import { isFullAdmin } from '../../lib/admin-access';

export default function AdminAccountPage() {
  const { adminUser } = useAdmin();
  const showStaffLink = isFullAdmin(adminUser);
  const [name, setName] = useState(adminUser?.name || '');
  const [email, setEmail] = useState(adminUser?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(adminUser?.avatarUrl || null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const uploadAvatar = async (file: File) => {
    const body = new FormData();
    body.append('avatar', file);
    const res = await apiFetch('/api/admin/profile/avatar', { method: 'POST', body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    setAvatarUrl(data.avatarUrl);
    localStorage.setItem('adminUser', JSON.stringify(data));
    setMsg('Photo updated');
    window.location.reload();
  };

  const removeAvatar = async () => {
    const res = await apiFetch('/api/admin/profile/avatar', { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    setAvatarUrl(null);
    localStorage.setItem('adminUser', JSON.stringify(data));
    setMsg('Photo removed');
    window.location.reload();
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('adminUser', JSON.stringify(data));
      setMsg('Profile saved');
      window.location.reload();
    } else setMsg(data.error || 'Failed');
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Password updated' : data.error || 'Failed');
  };

  return (
    <>
      <AdminPageHeader title="Account" description="Profile and security for your admin or staff login." />
      {showStaffLink && (
        <p className="text-xs text-muted mb-6">
          Manage team access on <Link to="/admin/staff" className="text-primary hover:underline">Staff settings</Link>.
        </p>
      )}
      {msg && <p className="text-xs text-accent mb-4 uppercase tracking-widest">{msg}</p>}
      <div className="grid gap-8 max-w-lg">
        <section className="glass-panel border border-border p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Profile photo</h2>
          <AvatarUpload name={name} avatarUrl={avatarUrl} onUpload={uploadAvatar} onRemove={removeAvatar} />
        </section>
        <form onSubmit={saveProfile} className="glass-panel border border-border p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Details</h2>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="text-[10px] text-muted uppercase">Role: {adminUser?.role}</p>
          <Button type="submit" variant="primary" size="sm">Save</Button>
        </form>
        <form onSubmit={changePassword} className="glass-panel border border-border p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Change password</h2>
          <Input label="Current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button type="submit" variant="primary" size="sm">Update password</Button>
        </form>
      </div>
    </>
  );
}
