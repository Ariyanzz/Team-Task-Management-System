'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { tasksApi } from '@/lib/api';
import { Task } from '@/types';
import { statusConfig, priorityConfig, formatDate, dueDateLabel, getInitials, avatarColor, cn } from '@/lib/utils';
import Link from 'next/link';
import { CheckSquare, Clock, ListTodo, TrendingUp, Plus, ArrowRight } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 card-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-[#1a1a2e]">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const due = dueDateLabel(task.dueDate);

  return (
    <Link href={`/dashboard/tasks/${task._id}`} className="flex items-center gap-4 py-3 hover:bg-slate-50 rounded-xl px-3 -mx-3 transition group">
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', status.dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-brand-700 transition">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-medium', priority.bg, priority.color)}>{priority.label}</span>
          {task.assignedTo && (
            <span className="text-xs text-slate-400">→ {task.assignedTo.name}</span>
          )}
        </div>
      </div>
      <div className={cn('text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0', due.overdue ? 'bg-rose-50 text-rose-600' : due.urgent ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500')}>
        {due.label}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => tasksApi.getStats(),
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: () => tasksApi.getAll({ limit: 6 }),
  });

  const stats = statsData?.stats || { todo: 0, 'in-progress': 0, done: 0, total: 0 };
  const tasks: Task[] = tasksData?.tasks || [];
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-[#1a1a2e]">
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s on your plate today.</p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New task</span>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total tasks"    value={stats.total}          icon={ListTodo}    color="text-brand-600"   bg="bg-brand-50" />
        <StatCard label="To do"          value={stats.todo}           icon={Clock}       color="text-slate-600"   bg="bg-slate-100" />
        <StatCard label="In progress"    value={stats['in-progress']} icon={TrendingUp}  color="text-amber-600"   bg="bg-amber-50" />
        <StatCard label="Completed"      value={stats.done}           icon={CheckSquare} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Completion bar */}
      {stats.total > 0 && (
        <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Overall progress</span>
            <span className="font-display text-sm font-bold text-brand-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{stats.done} of {stats.total} tasks completed</p>
        </div>
      )}

      {/* Recent tasks */}
      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[#1a1a2e]">Recent tasks</h2>
          <Link href="/dashboard/tasks" className="text-sm text-brand-600 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full skeleton" />
                <div className="flex-1 h-4 skeleton rounded" />
                <div className="w-16 h-4 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-10 text-center">
            <CheckSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No tasks yet.</p>
            <Link href="/dashboard/tasks/new" className="mt-2 inline-block text-sm text-brand-600 hover:underline font-medium">
              Create your first task →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {tasks.map((task) => <TaskRow key={task._id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
}
