import React, { useState } from 'react';
import { Home, CheckSquare, DollarSign, Settings, Mic } from 'lucide-react';
import { HomeScreen } from './features/home/HomeScreen';
import { TasksScreen } from './features/tasks/TasksScreen';
import { FinanceScreen } from './features/finance/FinanceScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { AdminPanel } from './features/admin/AdminPanel';
import { VoiceCaptureModal } from './features/voice/VoiceCaptureModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'finance' | 'settings' | 'admin'>('home');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col font-sans">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">
            ر
          </div>
          <span className="font-bold text-base tracking-tight text-slate-100">رفيق</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            فريق الـ 10
          </span>
          <button
            onClick={() => setActiveTab('admin')}
            className={`p-1.5 rounded-lg border text-xs transition ${
              activeTab === 'admin'
                ? 'bg-primary-500 text-slate-950 border-primary-500 font-bold'
                : 'bg-surface border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="لوحة الإدارة"
          >
            الإدارة
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeScreen
            onOpenVoice={() => setIsVoiceOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}
        {activeTab === 'tasks' && <TasksScreen />}
        {activeTab === 'finance' && <FinanceScreen />}
        {activeTab === 'settings' && <SettingsScreen onOpenAdmin={() => setActiveTab('admin')} />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      {/* Voice Floating Action Button (Center FAB) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-400 text-slate-950 flex items-center justify-center shadow-xl shadow-primary-500/25 active:scale-95 transition-all border-4 border-background"
          aria-label="تسجيل صوتي ذكي"
        >
          <Mic className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modern Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-surface/90 backdrop-blur-lg border-t border-slate-800/90 px-6 py-2 flex items-center justify-between text-xs max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'home' ? 'text-primary-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'tasks' ? 'text-primary-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>المهام</span>
        </button>

        <div className="w-8" /> {/* Space for Center Floating Mic Button */}

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'finance' ? 'text-primary-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>المالية</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'settings' ? 'text-primary-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>الإعدادات</span>
        </button>
      </nav>

      {/* Voice & AI Capture Modal */}
      <VoiceCaptureModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onConfirmTask={(title) => {
          console.log('Confirmed task:', title);
          setActiveTab('tasks');
        }}
        onConfirmExpense={(amount, cat, note) => {
          console.log('Confirmed expense:', amount, cat, note);
          setActiveTab('finance');
        }}
      />
    </div>
  );
};
export default App;
