import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Users, AlertTriangle } from 'lucide-react';

interface AllowedUserRow {
  uid: string;
  displayName: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'inactive';
  invitedAt: string;
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<AllowedUserRow[]>([
    {
      uid: 'admin-01',
      displayName: 'محمد (المدير)',
      email: 'admin@rafeeq.app',
      role: 'admin',
      status: 'active',
      invitedAt: '2026-11-20'
    },
    {
      uid: 'user-02',
      displayName: 'أحمد علي',
      email: 'ahmed@example.com',
      role: 'member',
      status: 'active',
      invitedAt: '2026-11-21'
    }
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_SEATS = 10;
  const activeCount = users.filter(u => u.status === 'active').length;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeCount >= MAX_SEATS) {
      setErrorMsg('تم الوصول إلى الحد الأقصى للمستخدمين (10 مستخدمين). قم بتعطيل حساب أولاً لإضافة غيره.');
      return;
    }

    if (!newEmail.includes('@') || !newName.trim()) {
      setErrorMsg('يرجى إدخال اسم وبريد إلكتروني صحيح.');
      return;
    }

    const newUser: AllowedUserRow = {
      uid: `usr-${Date.now()}`,
      displayName: newName.trim(),
      email: newEmail.trim(),
      role: 'member',
      status: 'active',
      invitedAt: new Date().toISOString().slice(0, 10)
    };

    setUsers([...users, newUser]);
    setNewName('');
    setNewEmail('');
    setShowInviteModal(false);
  };

  const toggleStatus = (uid: string) => {
    setUsers(users.map(u => {
      if (u.uid === uid && u.role !== 'admin') {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-500/10 text-primary-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">لوحة الإدارة (10 مقاعد)</h1>
            <p className="text-xs text-slate-400">إدارة صلاحيات المستخدمين والوصول للتطبيق</p>
          </div>
        </div>
      </div>

      {/* Seat Meter Banner */}
      <div className="p-4 bg-surface border border-slate-700/80 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-bold text-slate-200">المقاعد النشطة</span>
          </div>
          <span className="text-sm font-bold text-primary-400">
            {activeCount} من {MAX_SEATS} مستخدم
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              activeCount >= MAX_SEATS ? 'bg-amber-500' : 'bg-primary-500'
            }`}
            style={{ width: `${(activeCount / MAX_SEATS) * 100}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400">
          النظام مصمم ليعمل مجاناً وبأعلى درجات الأمان لـ 10 حسابات فقط بدون أي تكلفة استضافة أو رسوم شهرية.
        </p>
      </div>

      {/* Invite Button */}
      <button
        onClick={() => setShowInviteModal(true)}
        disabled={activeCount >= MAX_SEATS}
        className="w-full py-3 bg-primary-500 disabled:opacity-40 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-600 transition shadow-lg shadow-primary-500/10"
      >
        <UserPlus className="w-5 h-5" /> دعوة مستخدم جديد (من الـ 10)
      </button>

      {/* User list */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300">المستخدمين المصرح لهم (allowedUsers)</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.uid}
              className={`p-4 bg-surface border rounded-2xl flex items-center justify-between gap-3 ${
                user.status === 'inactive' ? 'border-slate-800 opacity-60' : 'border-slate-700/70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{user.displayName}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold">
                      أدمن
                    </span>
                  )}
                  {user.status === 'active' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                      نشط
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400">
                      معطل
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>

              {user.role !== 'admin' && (
                <button
                  onClick={() => toggleStatus(user.uid)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                    user.status === 'active'
                      ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {user.status === 'active' ? 'تعطيل' : 'تفعيل'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-surface border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-400" /> إضافة مستخدم مصرح له
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  placeholder="مثلاً: سارة محمود"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">البريد الإلكتروني (جوجل)</label>
                <input
                  type="email"
                  placeholder="sara@gmail.com"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-primary-600 transition"
                >
                  منح الصلاحية
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
