import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, Mail, Shield, User as UserIcon, X, Zap } from 'lucide-react';
import { useLoginMutation, useRegisterMutation } from '../store/api';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  const [loginApi, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const {
    register: loginForm,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<{ email: string; password: string }>();

  const {
    register: regForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: regErrors },
  } = useForm<{ name: string; email: string; password: string; role: string }>({
    defaultValues: { role: 'student' },
  });

  if (!isOpen) return null;

  const onLogin = async (data: { email: string; password: string }) => {
    setAuthError(null);
    try {
      const res = await loginApi(data).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      onClose();
    } catch (err: any) {
      setAuthError(err?.data?.message || 'Login failed. Please verify credentials.');
    }
  };

  const onRegister = async (data: { name: string; email: string; password: string; role: string }) => {
    setAuthError(null);
    try {
      const res = await registerApi(data).unwrap();
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      onClose();
    } catch (err: any) {
      setAuthError(err?.data?.message || 'Registration failed.');
    }
  };

  const handleQuickDemoLogin = (email: string) => {
    setLoginValue('email', email);
    setLoginValue('password', 'Password123!');
    onLogin({ email, password: 'Password123!' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Account Access</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5">
            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1 mb-2">
              <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              One-Click Demo Evaluator Profiles
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student1@college.edu')}
                className="p-2 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 text-slate-700 transition-all text-center cursor-pointer group shadow-2xs"
              >
                <span className="text-xs font-bold block">🎓 Student</span>
                <span className="text-[9px] text-slate-600 group-hover:text-blue-100 block truncate">Thirumoorthi M</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('teacher@college.edu')}
                className="p-2 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 text-slate-700 transition-all text-center cursor-pointer group shadow-2xs"
              >
                <span className="text-xs font-bold block">👨‍🏫 Teacher</span>
                <span className="text-[9px] text-slate-600 group-hover:text-blue-100 block truncate">Dr. Ramanujam</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@college.edu')}
                className="p-2 bg-white hover:bg-blue-600 hover:text-white rounded-xl border border-blue-200 text-slate-700 transition-all text-center cursor-pointer group shadow-2xs"
              >
                <span className="text-xs font-bold block">🛡️ Admin</span>
                <span className="text-[9px] text-slate-600 group-hover:text-blue-100 block truncate">Karthik S</span>
              </button>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {authError}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="student1@college.edu"
                    {...loginForm('email', { required: 'Email is required' })}
                    className="w-full bg-slate-50 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>
                {loginErrors.email && (
                  <span className="text-[11px] text-red-600 block mt-1">{loginErrors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...loginForm('password', { required: 'Password is required' })}
                    className="w-full bg-slate-50 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>
                {loginErrors.password && (
                  <span className="text-[11px] text-red-600 block mt-1">{loginErrors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoginLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                {isLoginLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Thirumoorthi M"
                    {...regForm('name', { required: 'Name is required' })}
                    className="w-full bg-slate-50 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>
                {regErrors.name && (
                  <span className="text-[11px] text-red-600 block mt-1">{regErrors.name.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@college.edu"
                    {...regForm('email', { required: 'Email is required' })}
                    className="w-full bg-slate-50 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>
                {regErrors.email && (
                  <span className="text-[11px] text-red-600 block mt-1">{regErrors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    {...regForm('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full bg-slate-50 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>
                {regErrors.password && (
                  <span className="text-[11px] text-red-600 block mt-1">{regErrors.password.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    {...regForm('role')}
                    className="w-full bg-slate-50 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:bg-white outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegisterLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                {isRegisterLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
