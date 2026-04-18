'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { statusConfig, priorityConfig, dueDateLabel, formatDate, formatRelative, getInitials, avatarColor, cn } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2, Calendar, User, Tag, Clock } from 'lucide-react';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getOne(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(id),
    onSuccess: () => {
      toast.success('Task deleted');
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task-stats'] });
      router.push('/dashboard/tasks');
    },
    onError: () => toast.error('Failed to delete task'),
  });

  const handleDelete = () => {
    if (confirm('Delete this task? This cannot be undone.')) deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="h-8 w-32 skeleton rounded mb-6" />
        <div className="bg-white rounded-2xl p-6 card-shadow space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-5 skeleton rounded" />)}
        </div>
      </div>
    );
  }

  if (error || !data?.task) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center">
        <p className="text-slate-500">Task not found.</p>
        <Link href="/dashboard/tasks" className="mt-2 inline-block text-brand-600 hover:underline text-sm">← Back to tasks</Link>
      </div>
    );
  }

  const task = data.task;
  const status = statusConfig[task.status as keyof typeof statusConfig];
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  const due = dueDateLabel(task.dueDate);

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/tasks" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to tasks
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/tasks/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 card-shadow">
        {/* Status & Priority */}
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5', status.bg, status.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
            {status.label}
          </span>
          <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', priority.bg, priority.color)}>
            {priority.label} priority
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold text-[#1a1a2e] mb-3">{task.title}</h1>

        {task.description && (
          <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{task.description}</p>
        )}

        <div className="space-y-3 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 w-24 flex-shrink-0">Due date</span>
            <span className={cn('font-medium', due.overdue ? 'text-rose-600' : due.urgent ? 'text-amber-600' : 'text-slate-900')}>
              {formatDate(task.dueDate)} {due.overdue ? '(Overdue)' : due.urgent ? `(${due.label})` : ''}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 w-24 flex-shrink-0">Created by</span>
            <div className="flex items-center gap-2">
              <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold', avatarColor(task.createdBy.name))}>
                {getInitials(task.createdBy.name)}
              </div>
              <span className="font-medium text-slate-900">{task.createdBy.name}</span>
            </div>
          </div>

          {task.assignedTo && (
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-24 flex-shrink-0">Assigned to</span>
              <div className="flex items-center gap-2">
                <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold', avatarColor(task.assignedTo.name))}>
                  {getInitials(task.assignedTo.name)}
                </div>
                <span className="font-medium text-slate-900">{task.assignedTo.name}</span>
              </div>
            </div>
          )}

          {task.tags?.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-24 flex-shrink-0">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 w-24 flex-shrink-0">Created</span>
            <span className="text-slate-600">{formatRelative(task.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
