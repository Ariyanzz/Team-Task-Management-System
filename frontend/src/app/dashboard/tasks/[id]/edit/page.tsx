'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { tasksApi, usersApi } from '@/lib/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TaskForm {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
  tags: string;
}

export default function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getOne(id),
  });

  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: usersApi.getAll });
  const users: User[] = usersData?.users || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskForm>();

  useEffect(() => {
    if (taskData?.task) {
      const t = taskData.task;
      reset({
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        dueDate: format(new Date(t.dueDate), 'yyyy-MM-dd'),
        assignedTo: t.assignedTo?._id || t.assignedTo?.id || '',
        tags: t.tags?.join(', ') || '',
      });
    }
  }, [taskData, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<TaskForm & { tags: string[] }>) => tasksApi.update(id, payload),
    onSuccess: () => {
      toast.success('Task updated!');
      qc.invalidateQueries({ queryKey: ['task', id] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task-stats'] });
      router.push(`/dashboard/tasks/${id}`);
    },
    onError: (err: { message?: string }) => toast.error(err?.message || 'Update failed'),
  });

  const onSubmit = (data: TaskForm) => {
    updateMutation.mutate({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
      assignedTo: data.assignedTo || undefined,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  if (taskLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="h-8 w-32 skeleton rounded mb-6" />
        <div className="bg-white rounded-2xl p-6 card-shadow space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link href={`/dashboard/tasks/${id}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to task
        </Link>
        <h1 className="font-display text-2xl font-bold text-[#1a1a2e]">Edit task</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 card-shadow space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
          <input
            {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' } })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
          />
          {errors.title && <p className="mt-1.5 text-xs text-rose-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select {...register('status')} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select {...register('priority')} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Due date *</label>
          <input
            {...register('dueDate', { required: 'Due date is required' })}
            type="date"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          {errors.dueDate && <p className="mt-1.5 text-xs text-rose-600">{errors.dueDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign to</label>
          <select {...register('assignedTo')} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
            <option value="">— Unassigned —</option>
            {users.map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags <span className="text-slate-400">(comma-separated)</span></label>
          <input
            {...register('tags')}
            placeholder="design, frontend, urgent"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#1a1a2e] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href={`/dashboard/tasks/${id}`} className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl text-center text-sm hover:bg-slate-50 transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
