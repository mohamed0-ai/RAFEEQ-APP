import React from 'react';
import { Download, Moon, Bell, Globe, Heart, Users } from 'lucide-react';

interface Props {
  onOpenAdmin: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onOpenAdmin }) => {
  const handleExportBackup = () => {
    const backupData = {
      app: 'Rafeeq',
      exportedAt: new Date().toISOString(),
      user: 'Mohamed',
      note: 'نسخة احتياطية محلية بدون أي تكلفة تخزين سحابي'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafeeq-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">الإعدادات</h1>
          <p className="text-xs text-slate-400">تخصيص الحساب والخيارات المتقدمة</p>
        </div>
      </div>

      {/* Admin Panel Entry Banner */}
      <div
        onClick={onOpenAdmin}
        className="p-4 bg-surface border border-primary-500/30 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-surface-elevated transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 text-primary-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">إدارة المستخدمين (10 مقاعد)</div>
            <div className="text-xs text-slate-400">إضافة أو تعطيل الوصول للمستخدمين المصرح لهم</div>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-400 font-bold">
          فتح
        </span>
      </div>

      {/* General Settings */}
      <div className="p-4 bg-surface border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">عام ومواقيت</h3>
        
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-200">المنطقة الزمنية</span>
          </div>
          <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
            Africa/Cairo (GMT+2)
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-200">وقت الإيجاز الصباحي</span>
          </div>
          <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
            08:00 ص
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-200">المظهر</span>
          </div>
          <span className="text-xs text-primary-400 font-medium">الوضع الليلي الداكن</span>
        </div>
      </div>

      {/* Zero Cost & Security */}
      <div className="p-4 bg-surface border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">الأمان والتكلفة (Zero Cost)</h3>
        <div className="text-xs text-slate-400 leading-relaxed">
          تطبيق "رفيق" يعمل بنظام التكلفة الصفرية 100% (Firebase Spark + Cloudflare Workers Free + Gemini Flash Free Tier) بدون أي بطاقة بنكية.
        </div>
        <button
          onClick={handleExportBackup}
          className="w-full py-2.5 bg-surface-elevated hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
        >
          <Download className="w-4 h-4" /> تصدير نسخة احتياطية (JSON)
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-600 flex items-center justify-center gap-1">
        تم التطوير بـ <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> لفريق رفيق (10 مستخدمين)
      </div>
    </div>
  );
};
