import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, X } from 'lucide-react';
import { useCreateCollegeMutation } from '../store/api';
import type { CreateCollegePayload } from '../types';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({ isOpen, onClose }) => {
  const [createCollege, { isLoading }] = useCreateCollegeMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCollegePayload>({
    defaultValues: {
      state: 'Tamil Nadu',
      establishedYear: 1980,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateCollegePayload) => {
    setErrorMsg(null);
    try {
      await createCollege({
        ...data,
        establishedYear: data.establishedYear ? Number(data.establishedYear) : undefined,
      }).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.data?.message || 'Failed to create college');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Add New College (Admin)</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">College Name *</label>
            <input
              type="text"
              placeholder="e.g. Coimbatore Institute of Technology"
              {...register('name', { required: 'College name is required', minLength: 2 })}
              className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
            />
            {errors.name && (
              <span className="text-[11px] text-red-600 block mt-1">{errors.name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                placeholder="e.g. Coimbatore"
                {...register('city', { required: 'City is required' })}
                className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
              />
              {errors.city && (
                <span className="text-[11px] text-red-600 block mt-1">{errors.city.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                placeholder="Tamil Nadu"
                {...register('state')}
                className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Location / Address *</label>
            <input
              type="text"
              placeholder="e.g. Civil Aerodrome Post, Avinashi Rd"
              {...register('location', { required: 'Location is required' })}
              className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
            />
            {errors.location && (
              <span className="text-[11px] text-red-600 block mt-1">{errors.location.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Established Year</label>
              <input
                type="number"
                placeholder="1956"
                {...register('establishedYear')}
                className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://www.cit.edu.in"
                {...register('website')}
                className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={3}
              placeholder="Brief overview of academic programs, accreditation, and research focus (min 10 characters)..."
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Minimum 10 characters' },
              })}
              className="w-full bg-slate-50 text-xs p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none resize-none"
            />
            {errors.description && (
              <span className="text-[11px] text-red-600 block mt-1">{errors.description.message}</span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? 'Creating...' : 'Create College'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
