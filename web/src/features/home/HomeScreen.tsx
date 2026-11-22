import React from 'react';
import { CheckCircle2, TrendingUp, Sparkles, ArrowRight, Sun } from 'lucide-react';

interface Props {
  onOpenVoice: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeScreen: React.FC<Props> = ({ onOpenVoice, onNavigateTab }) => {
  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-5 animate-in fade-in">
      {/* Morning Briefing / Welcome Card */}
      <div className="p-5 bg-gradient-to-br from-surface via-surface to-slate-900 border border-slate-700/80 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full w-fit">
            <Sun className="w-4 h-4 text-amber-400" /> صباح الخير يا بطل
          </div>
          <span className="text-xs text-slate-400">القاهرة (GMT+2)</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">ملخص يومك اليوم</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          لديك <span className="text-primary-400 font-bold">2 مهمة</span> متبقية لليوم، ومصاريفك الحالية ضمن الميزانية الطبيعية.
        </p>
      </div>

      {/* Voice Assistant Shortcut Banner */}
      <div
        onClick={onOpenVoice}
        className="p-4 bg-primary-500 text-slate-950 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-primary-400 transition shadow-lg shadow-primary-500/20 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950/15 rounded-xl">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="text-sm font-bold">سجّل بالصوت أو النص الآن</div>
            <div className="text-xs text-slate-900/80">ذكاء اصطناعي يفهم اللهجة المصرية</div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5" />
      </div>

      {/* Quick Dashboard Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tasks card */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="p-4 bg-surface border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <CheckCircle2 className="w-5 h-5 text-primary-400" />
            <span className="text-xs text-slate-400">2 لليوم</span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">المهام</div>
            <div className="text-xs text-slate-400">مواعيدك وقوائم الإنجاز</div>
          </div>
        </div>

        {/* Finance card */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="p-4 bg-surface border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-rose-400" />
            <span className="text-xs text-rose-400">-205 ج.م</span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-100">المصاريف</div>
            <div className="text-xs text-slate-400">تتبع المدفوعات والجمعيات</div>
          </div>
        </div>
      </div>

      {/* Today's Agenda Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300">أولويات اليوم</h3>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs text-primary-400 hover:underline"
          >
            عرض الكل
          </button>
        </div>

        <div className="space-y-2">
          <div className="p-3.5 bg-surface border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              <div>
                <div className="text-sm font-medium text-slate-200">مراجعة الميزانية الشهرية</div>
                <div className="text-xs text-slate-400">اليوم الساعة 4:00 م</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold">
              مهم
            </span>
          </div>

          <div className="p-3.5 bg-surface border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div>
                <div className="text-sm font-medium text-slate-200">شراء قهوة تركي للبيت</div>
                <div className="text-xs text-slate-400">بدون وقت محدد</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
              عادي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
