import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { AdminErrorBanner, AdminPageHeader, DataTable } from '../../components/admin';
import { statusBadgeClass } from '../../lib/admin-table';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/api';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/users')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed');
        setUsers(await res.json());
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email', cell: (i) => <span className="text-muted">{i.getValue() as string}</span> },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (i) => {
          const role = i.getValue() as string;
          return (
            <span className={cn('text-[10px] uppercase tracking-widest px-2 py-0.5 border', statusBadgeClass(role))}>
              {role}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) =>
          row.original.role === 'client' ? (
            <Link to={`/admin/users/${row.original.id}/media`}>
              <Button variant="outline" size="sm">
                Manage media
              </Button>
            </Link>
          ) : (
            <span className="text-muted text-xs">—</span>
          ),
      },
    ],
    []
  );

  return (
    <>
      <AdminPageHeader title="Users" description="Clients and administrators." />
      <AdminErrorBanner message={error} />
      <DataTable
        data={users}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Search users…"
        globalFilterFn={(row, q) =>
          row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)
        }
      />
    </>
  );
};

export default AdminUsersPage;
