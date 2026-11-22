import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Tag, Trash2, Calendar } from 'lucide-react';
import { Task } from '@rafeeq/schema';

export const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      title: 'مراجعة الميزانية الشهرية مع الفريق',
      status: 'todo',
      priority: 'high',
      tags: ['عمل', 'ماليات'],
      dueAt: new Date().toISOString(),
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: 'تسجيل في ورشة GDG أسيوط للذكاء الاصطناعي',
      status: 'done',
      priority: 'urgent',
      tags: ['تطوير', 'GDG'],
      dueAt: new Date().toISOString(),
      source: 'voice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: 'شراء قهوة وقهوة تركي للبيت',
      status: 'todo',
      priority: 'low',
      tags: ['شخصي'],
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'done'>('all');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      tags: ['يومي'],
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleStatus = (index: number) => {
    const updated = [...tasks];
    updated[index].status = updated[index].status === 'done' ? 'todo' : 'done';
    setTasks(updated);
  };

  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'done') return t.status === 'done';
    if (filter === 'today') return t.status !== 'done';
    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">المهام والجدول</h1>
          <p className="text-xs text-slate-400">إدارة وتنظيم مواعيدك اليومية</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-primary-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'today' ? 'bg-primary-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            اليوم
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'done' ? 'bg-primary-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            المكتملة
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          placeholder="أضف مهمة جديدة..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 bg-surface border border-slate-700/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition"
        />
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold p-3 rounded-2xl flex items-center justify-center transition shadow-lg shadow-primary-500/10"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm">لا توجد مهام في هذه القائمة</p>
          </div>
        ) : (
          filteredTasks.map((task, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                task.status === 'done'
                  ? 'bg-surface/50 border-slate-800/80 opacity-60'
                  : 'bg-surface border-slate-700/70 shadow-sm hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleStatus(idx)}
                  className="mt-0.5 text-primary-500 hover:scale-110 transition"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 fill-primary-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                <div className="space-y-1.5 flex-1">
                  <p className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    {task.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-bold">عاجل</span>
                    )}
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-medium">مهم</span>
                    )}
                    {task.tags?.map((tag, tIdx) => (
                      <span key={tIdx} className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-md">
                        <Tag className="w-3 h-3 text-slate-500" /> {tag}
                      </span>
                    ))}
                    {task.dueAt && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" /> اليوم
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(idx)}
                className="text-slate-600 hover:text-red-400 p-1 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
