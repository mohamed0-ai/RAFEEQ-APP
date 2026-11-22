import React, { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Target } from 'lucide-react';
import { Transaction, formatEGP, toPiasters } from '@rafeeq/schema';

export const FinanceScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      kind: 'expense',
      amountPiasters: 8500, // 85 EGP
      currency: 'EGP',
      categoryId: 'طعام ومشروبات',
      note: 'سوبرماركت وغداء',
      occurredAt: new Date().toISOString(),
      paymentMethod: 'instapay',
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      kind: 'expense',
      amountPiasters: 12000, // 120 EGP
      currency: 'EGP',
      categoryId: 'مواصلات',
      note: 'أوبر للجامعة',
      occurredAt: new Date().toISOString(),
      paymentMethod: 'cash',
      source: 'voice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      kind: 'income',
      amountPiasters: 1500000, // 15,000 EGP
      currency: 'EGP',
      categoryId: 'مرتب / عمل حر',
      note: 'دفعة مشروع فريلانس',
      occurredAt: new Date().toISOString(),
      paymentMethod: 'card',
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('طعام ومشروبات');
  const [noteInput, setNoteInput] = useState('');
  const [txKind, setTxKind] = useState<'expense' | 'income'>('expense');

  const totalExpensePiasters = transactions
    .filter(t => t.kind === 'expense')
    .reduce((acc, curr) => acc + curr.amountPiasters, 0);

  const totalIncomePiasters = transactions
    .filter(t => t.kind === 'income')
    .reduce((acc, curr) => acc + curr.amountPiasters, 0);

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (!val || val <= 0) return;

    const newTx: Transaction = {
      kind: txKind,
      amountPiasters: toPiasters(val),
      currency: 'EGP',
      categoryId: categoryInput,
      note: noteInput || undefined,
      occurredAt: new Date().toISOString(),
      paymentMethod: 'instapay',
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTransactions([newTx, ...transactions]);
    setShowAddModal(false);
    setAmountInput('');
    setNoteInput('');
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">المالية والميزانية</h1>
          <p className="text-xs text-slate-400">تتبع المصاريف، المرتب، والجمعيات</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-primary-500/10"
        >
          <Plus className="w-4 h-4" /> معاملة
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-surface border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" /> إجمالي الدخل
          </div>
          <div className="text-xl font-bold text-slate-100">
            {formatEGP(totalIncomePiasters)}
          </div>
        </div>

        <div className="p-4 bg-surface border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-rose-400">
            <ArrowUpRight className="w-4 h-4" /> إجمالي المصاريف
          </div>
          <div className="text-xl font-bold text-slate-100">
            {formatEGP(totalExpensePiasters)}
          </div>
        </div>
      </div>

      {/* Savings & Gameya (جمعية) Spotlight */}
      <div className="p-4 bg-gradient-to-r from-surface to-surface-elevated border border-primary-500/20 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">جمعية الأهل والأصدقاء</div>
            <div className="text-xs text-slate-400">دورك الشهر القادم — متبقي قسطين</div>
          </div>
        </div>
        <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-lg">
          2,000 ج.م/ش
        </span>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300">أحدث المعاملات</h2>
        <div className="space-y-2">
          {transactions.map((tx, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-surface border border-slate-800/80 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    tx.kind === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {tx.kind === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">{tx.categoryId}</div>
                  <div className="text-xs text-slate-400">
                    {tx.note || 'بدون ملاحظة'} • عبر {tx.paymentMethod}
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-bold ${
                  tx.kind === 'income' ? 'text-emerald-400' : 'text-slate-200'
                }`}
              >
                {tx.kind === 'income' ? '+' : '-'} {formatEGP(tx.amountPiasters)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">إضافة معاملة جديدة</h3>
            
            {/* Kind tabs */}
            <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl">
              <button
                type="button"
                onClick={() => setTxKind('expense')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  txKind === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-400'
                }`}
              >
                مصروف
              </button>
              <button
                type="button"
                onClick={() => setTxKind('income')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  txKind === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-400'
                }`}
              >
                دخل
              </button>
            </div>

            <form onSubmit={handleCreateTx} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">المبلغ (بالجنيه)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.5"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">التصنيف</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="طعام ومشروبات">طعام ومشروبات</option>
                  <option value="مواصلات وبنزين">مواصلات وبنزين</option>
                  <option value="فواتير واشتراكات">فواتير واشتراكات</option>
                  <option value="تسوق ومشتريات">تسوق ومشتريات</option>
                  <option value="مرتب / عمل حر">مرتب / عمل حر</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ملاحظة (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثلاً: انستاباي لمحمد"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-primary-600 transition"
                >
                  حفظ المعاملة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
