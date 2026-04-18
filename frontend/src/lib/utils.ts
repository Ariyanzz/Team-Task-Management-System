import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { TaskPriority, TaskStatus } from '@/types';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function dueDateLabel(date: string | Date): { label: string; urgent: boolean; overdue: boolean } {
  const d = new Date(date);
  const overdue = isPast(d) && !isToday(d);
  const urgent = isToday(d) || isTomorrow(d);
  let label = format(d, 'MMM d');
  if (isToday(d)) label = 'Today';
  else if (isTomorrow(d)) label = 'Tomorrow';
  else if (overdue) label = `Overdue · ${format(d, 'MMM d')}`;
  return { label, urgent, overdue };
}

export const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; dot: string }> = {
  'todo':        { label: 'To Do',       color: 'text-slate-600',   bg: 'bg-slate-100',   dot: 'bg-slate-400' },
  'in-progress': { label: 'In Progress', color: 'text-amber-700',   bg: 'bg-amber-50',    dot: 'bg-amber-400' },
  'done':        { label: 'Done',        color: 'text-emerald-700', bg: 'bg-emerald-50',  dot: 'bg-emerald-500' },
};

export const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  'low':    { label: 'Low',    color: 'text-sky-700',    bg: 'bg-sky-50' },
  'medium': { label: 'Medium', color: 'text-amber-700',  bg: 'bg-amber-50' },
  'high':   { label: 'High',   color: 'text-rose-700',   bg: 'bg-rose-50' },
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function avatarColor(name: string): string {
  const colors = [
    'bg-violet-500', 'bg-indigo-500', 'bg-sky-500', 'bg-teal-500',
    'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-pink-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
