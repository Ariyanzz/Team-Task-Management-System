'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Task, TaskStatus } from '@/types';
import { statusConfig, priorityConfig, dueDateLabel, getInitials, avatarColor, cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Trash2, Pencil, ChevronDown } from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_FILTERS = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function TaskCard({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const due = dueDateLabel(task.dueDate);

  return (
    <div className="bg-white rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all animate-fade-in group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1', status.bg, status.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
            {status.label}
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priority.bg, priority.color)}>
            {priority.label}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <Link
            href={`/dashboard/tasks/${task._id}/edit`}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <Link href={`/dashboard/tasks/${task._id}`}>
        <h3 className="font-semibold text-slate-900 mb-1 hover:text-brand-700 transition line-clamp-2">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
        )}
      </Link>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          {task.assignedTo ? (
            <>
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold', avatarColor(task.assignedTo.name))}>
                {getInitials(task.assignedTo.name)}
              </div>
              <span className="text-xs text-slate-500">{task.assignedTo.name.split(' ')[0]}</span>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">Unassigned</span>
          )}
        </div>
        <span className={cn('text-xs font-medium', due.overdue ? 'text-rose-600' : due.urgent ? 'text-amber-600' : 'text-slate-400')}>
          {due.label}
        </span>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const qc = useQueryClient();

  const debounce = useCallback((value: string) => {
    const timer = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debounce(e.target.value);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', status, priority, debouncedSearch],
    queryFn: () => tasksApi.getAll({ status, priority, search: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      toast.success('Task deleted');
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task-stats'] });
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this task? This cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const tasks: Task[] = data?.tasks || [];
  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const useGrouped = !status && !debouncedSearch;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1a1a2e]">Tasks</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.pagination?.total ?? 0} tasks total</p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          New task
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>

        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition"
          >
            {STATUS_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition"
          >
            {PRIORITY_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-36 skeleton" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center card-shadow">
          <Filter className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No tasks found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or create a new task.</p>
          <Link href="/dashboard/tasks/new" className="mt-4 inline-block text-sm text-brand-600 font-semibold hover:underline">
            + Create task
          </Link>
        </div>
      ) : useGrouped ? (
        /* Kanban-style grouped view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((s) => {
            const cfg = statusConfig[s];
            const group = grouped[s];
            return (
              <div key={s}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{cfg.label}</span>
                  <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {group.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.map((task) => (
                    <TaskCard key={task._id} task={task} onDelete={handleDelete} />
                  ))}
                  {group.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                      <p className="text-xs text-slate-400">No tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat list for filtered view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => <TaskCard key={task._id} task={task} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
