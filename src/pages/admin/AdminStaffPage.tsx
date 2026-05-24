import React, { useEffect, useState } from 'react';
import { AdminPageHeader } from '../../components/admin';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';
import { STAFF_PERMISSIONS, PERMISSION_LABELS, type StaffPermission } from '../../lib/roles';
import { BulkActionBar } from '../../components/ui/BulkActionBar';
import { useBulkSelection } from '../../hooks/use-bulk-selection';
import { AdminDeleteModal } from '../../components/admin/AdminPageHeader';

type StaffRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  staffPermissions: string;
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    permissions: {} as Record<StaffPermission, boolean>,
  });
  const [bulkOpen, setBulkOpen] = useState(false);
  const { selectedIds, toggle, selectAll, clearSelection } = useBulkSelection(() =>
    staff.filter((s) => s.role === 'staff').map((s) => s.id)
  );

  const load = () => {
    apiFetch('/api/admin/staff')
      .then((r) => r.json())
      .then((rows: StaffRow[]) => setStaff(rows.filter((s) => s.role === 'staff')));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        permissions: form.permissions,
      }),
    });
    if (res.ok) {
      setForm({ name: '', email: '', password: '', permissions: {} as Record<StaffPermission, boolean> });
      load();
    }
  };

  const bulkDelete = async () => {
    for (const id of selectedIds) {
      await apiFetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    }
    clearSelection();
    setBulkOpen(false);
    load();
  };

  return (
    <>
      <AdminPageHeader title="Staff" description="Create team accounts with scoped permissions." />
      <form onSubmit={create} className="glass-panel border border-border p-6 mb-8 max-w-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">New staff member</h2>
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <div className="grid grid-cols-2 gap-2">
          {STAFF_PERMISSIONS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
              <input
                type="checkbox"
                checked={Boolean(form.permissions[key])}
                onChange={(e) =>
                  setForm({
                    ...form,
                    permissions: { ...form.permissions, [key]: e.target.checked },
                  })
                }
              />
              {PERMISSION_LABELS[key]}
            </label>
          ))}
        </div>
        <Button type="submit" variant="primary" size="sm">Create staff</Button>
      </form>

      <BulkActionBar
        totalCount={staff.length}
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setBulkOpen(true)}
        entityLabel="staff"
      />
      <ul className="mt-4 space-y-2">
        {staff.map((s) => (
          <li key={s.id} className="flex items-center gap-3 p-3 border border-border">
            <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggle(s.id)} />
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted">{s.email}</p>
            </div>
          </li>
        ))}
      </ul>
      <AdminDeleteModal
        open={bulkOpen}
        title="Remove staff"
        message={`Remove ${selectedIds.length} staff account(s)?`}
        onCancel={() => setBulkOpen(false)}
        onConfirm={bulkDelete}
      />
    </>
  );
}
