'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getInitials, avatarColor, cn } from '@/lib/utils';
import { Loader2, LogOut } from 'lucide-react';

interface ProfileForm { name: string; }

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name || '' },
  });

  const updateMutation = useMutation({
    mutationFn: ({ name }: ProfileForm) => usersApi.updateProfile(name),
    onSuccess: () => toast.success('Profile updated!'),
    onError: () => toast.error('Failed to update profile'),
  });

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-[#1a1a2e]">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-6 card-shadow mb-4">
        <h2 className="font-semibold text-slate-900 mb-4">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg', avatarColor(user?.name || ''))}>
            {getInitials(user?.name || 'U')}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block capitalize', user?.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600')}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Display name</label>
            <input
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save changes
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl p-6 card-shadow border border-rose-100">
        <h2 className="font-semibold text-slate-900 mb-1">Sign out</h2>
        <p className="text-sm text-slate-500 mb-4">You'll need to sign in again to access your workspace.</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
