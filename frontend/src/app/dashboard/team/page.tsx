'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi, tasksApi } from '@/lib/api';
import { User, Task } from '@/types';
import { getInitials, avatarColor, cn } from '@/lib/utils';
import { Users, CheckSquare, Clock } from 'lucide-react';

function MemberCard({ user, tasks }: { user: User; tasks: Task[] }) {
  const userTasks = tasks.filter(
    (t) => t.assignedTo?.id === user.id || t.assignedTo?._id === user.id
  );
  const done = userTasks.filter((t) => t.status === 'done').length;
  const inProgress = userTasks.filter((t) => t.status === 'in-progress').length;
  const todo = userTasks.filter((t) => t.status === 'todo').length;
  const completion = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0', avatarColor(user.name))}>
          {getInitials(user.name)}
        </div>
        <div>
          <p className="font-semibold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <span className={cn('ml-auto text-xs font-medium px-2 py-0.5 rounded-full capitalize', user.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600')}>
          {user.role}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div className="bg-slate-50 rounded-xl p-2">
          <p className="font-display font-bold text-lg text-slate-900">{todo}</p>
          <p className="text-xs text-slate-400">To do</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-2">
          <p className="font-display font-bold text-lg text-amber-700">{inProgress}</p>
          <p className="text-xs text-amber-500">Active</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-2">
          <p className="font-display font-bold text-lg text-emerald-700">{done}</p>
          <p className="text-xs text-emerald-500">Done</p>
        </div>
      </div>

      {userTasks.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Completion</span>
            <span className="font-semibold text-slate-700">{completion}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      {userTasks.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-1">No tasks assigned</p>
      )}
    </div>
  );
}

export default function TeamPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: () => tasksApi.getAll({ limit: 100 }),
  });

  const users: User[] = usersData?.users || [];
  const tasks: Task[] = tasksData?.tasks || [];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1a1a2e]">Team</h1>
        <p className="text-slate-500 text-sm mt-0.5">{users.length} members</p>
      </div>

      {usersLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center card-shadow">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No team members yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <MemberCard key={user.id || user._id} user={user} tasks={tasks} />
          ))}
        </div>
      )}
    </div>
  );
}
