import React from 'react';
import { GraduationCap, LogIn, LogOut, Plus, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenAuth: () => void;
  onOpenAddCollege: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  onSearchChange,
  onOpenAuth,
  onOpenAddCollege,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'teacher':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block leading-tight">
                CampusReview
              </span>
              <span className="text-[10px] font-semibold text-slate-600 block uppercase tracking-wider">
                Tamil Nadu Institutions
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search colleges by name, city (e.g. Chennai, Coimbatore)..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-100 text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated && user?.role === 'admin' && (
              <button
                type="button"
                onClick={onOpenAddCollege}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add College</span>
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase inline-block mt-0.5 ${getRoleBadgeClass(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(logout())}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search colleges by name, city..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-100 text-xs pl-9 pr-4 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
