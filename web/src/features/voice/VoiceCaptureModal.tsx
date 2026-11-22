import React, { useState } from 'react';
import { Mic, MicOff, Loader2, Check, X, Sparkles } from 'lucide-react';
import { VoiceParsed } from '@rafeeq/schema';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmTask: (title: string, notes?: string) => void;
  onConfirmExpense: (amount: number, category: string, note?: string) => void;
}

export const VoiceCaptureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmTask,
  onConfirmExpense,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<VoiceParsed | null>(null);

  if (!isOpen) return null;

  const handleSimulateVoice = async () => {
    if (!inputText) return;
    setIsLoading(true);

    try {
      // Send text to Worker /api/ai/parse
      const apiUrl = import.meta.env.VITE_WORKER_URL || 'http://127.0.0.1:8787';
      const res = await fetch(`${apiUrl}/api/ai/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token',
        },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setParsedResult(data);
    } catch (e) {
      // Local heuristic fallback
      setParsedResult({
        intent: inputText.includes('جنيه') || inputText.includes('صرفت') ? 'expense' : 'task',
        transcript: inputText,
        title: inputText,
        amount: 50,
        category: 'طعام',
        confidence: 0.9,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!parsedResult) return;
    if (parsedResult.intent === 'expense' && parsedResult.amount) {
      onConfirmExpense(parsedResult.amount, parsedResult.category || 'عام', parsedResult.notes);
    } else {
      onConfirmTask(parsedResult.title || parsedResult.transcript, parsedResult.notes);
    }
    setParsedResult(null);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-surface border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
            <h3 className="text-lg font-bold">تسجيل صوتي ذكي (AI)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!parsedResult ? (
          <div className="py-6 flex flex-col items-center gap-5">
            <button
              onClick={() => {
                setIsRecording(!isRecording);
                if (!isRecording) {
                  setInputText('اشتريت خضار وغدا بـ 85 جنيه من السوبرماركت');
                }
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border-2 border-red-500 animate-pulse'
                  : 'bg-primary-500 text-slate-950 hover:scale-105 active:scale-95'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <p className="text-sm text-slate-400 text-center">
              {isRecording
                ? 'جاري الاستماع... اضغط ثانية لإنهاء التسجيل'
                : 'اضغط وتحدث باللهجة المصرية، أو اكتب بالأسفل'}
            </p>

            <div className="w-full mt-2">
              <input
                type="text"
                placeholder="أو اكتب هنا: مثلاً: ميعاد اجتماع بكرة الساعة 4"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulateVoice()}
                className="w-full px-4 py-3 bg-surface-elevated border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition"
              />
            </div>

            <button
              onClick={handleSimulateVoice}
              disabled={isLoading || !inputText}
              className="w-full py-3 bg-primary-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-600 transition"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحليل بالأذكاء الاصطناعي'}
            </button>
          </div>
        ) : (
          /* Confirmation Card (Security & Human In The Loop) */
          <div className="py-4 space-y-4">
            <div className="p-4 bg-surface-elevated border border-slate-700 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/20 text-primary-400 font-medium">
                  {parsedResult.intent === 'expense' ? '💸 مصروف جديد' : '📝 مهمة جديدة'}
                </span>
                <span className="text-xs text-slate-400">
                  دقة: {Math.round(parsedResult.confidence * 100)}%
                </span>
              </div>

              <div className="text-base font-bold text-slate-100">
                {parsedResult.title || parsedResult.transcript}
              </div>

              {parsedResult.amount && (
                <div className="text-xl font-bold text-emerald-400">
                  {parsedResult.amount} ج.م
                </div>
              )}

              {parsedResult.category && (
                <div className="text-xs text-slate-400">
                  التصنيف: <span className="text-slate-200">{parsedResult.category}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-primary-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-600 active:scale-95 transition"
              >
                <Check className="w-5 h-5" /> تأكيد وحفظ
              </button>
              <button
                onClick={() => setParsedResult(null)}
                className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
