import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Loader2 } from 'lucide-react';
import GlassSelect from '../ui-custom/GlassSelect';
import { useT } from '@/lib/i18n';

// Lets an admin view every user and change their role.
export default function UserRoles() {
  const t = useT();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState('');

  const loadUsers = () => {
    base44.entities.User.list()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items;
        setUsers(items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const changeRole = async (id, role) => {
    setSavingId(id);
    setMsg('');
    try {
      await base44.entities.User.update(id, { role });
      loadUsers();
      setMsg(t('Role updated.'));
    } catch (e) {
      setMsg(t('Error: {msg}', { msg: e.message || t('Failed to update role.') }));
    }
    setSavingId(null);
  };

  return (
    <div className="entity-card p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-cyan-400" /> {t('User Roles')}
      </h3>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-400">{t('No users yet.')}</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg bg-slate-800/40">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.full_name || '—'}</p>
                <p className="text-xs text-slate-400 truncate">{u.email || '—'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-56">
                {savingId === u.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <GlassSelect
                    value={u.role || 'user'}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    options={[
                      { value: 'admin', label: t('Admin') },
                      { value: 'user', label: t('User') },
                    ]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {msg && <p className="text-sm text-cyan-400 mt-3">{msg}</p>}
    </div>
  );
}