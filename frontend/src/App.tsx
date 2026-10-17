import { useState, useMemo } from 'react';
import { Award, Building, FileText, Filter, MessageSquare, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CollegeCard } from './components/CollegeCard';
import { CollegeDetailModal } from './components/CollegeDetailModal';
import { AuthModal } from './components/AuthModal';
import { AddCollegeModal } from './components/AddCollegeModal';
import { useGetCollegesQuery } from './store/api';
import type { College } from './types';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);

  const queryParams = useMemo(() => ({
    search: searchTerm.trim() || undefined,
    city: selectedCity !== 'ALL' ? selectedCity : undefined,
    sort: sortBy,
    limit: 50,
  }), [searchTerm, selectedCity, sortBy]);

  const { data, isLoading, isError } = useGetCollegesQuery(queryParams);
  const colleges = data?.data?.colleges || [];

  const cities = ['ALL', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'];

  const stats = useMemo(() => {
    const totalCount = colleges.length;
    const totalReviews = colleges.reduce((sum, c) => sum + (c.reviewCount || 0), 0);
    const avgRating = totalCount > 0
      ? (colleges.reduce((sum, c) => sum + (c.averageRating || 0), 0) / totalCount).toFixed(1)
      : '0.0';

    return { totalCount, totalReviews, avgRating };
  }, [colleges]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-500 selection:text-white">
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddCollege={() => setIsAddCollegeOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NIRF Ranked & Top Accredited Institutions</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Tamil Nadu Higher Education Reviews & Ratings
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Authentic reviews, aggregated ratings, and course insights from students and faculty across premier universities in Chennai, Coimbatore, Madurai, and Trichy.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md">
            <div>
              <span className="text-xl sm:text-2xl font-black font-mono block text-white">
                {stats.totalCount}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-blue-400" />
                Institutions
              </span>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black font-mono block text-amber-400">
                ⭐ {stats.avgRating}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                <Award className="w-3 h-3 text-amber-400" />
                Avg Rating
              </span>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-black font-mono block text-white">
                {stats.totalReviews}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                Total Reviews
              </span>
            </div>
          </div>
        </section>

        <section className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              City:
            </span>

            {cities.map((city) => (
              <button
                type="button"
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
            >
              <option value="rating_desc">Highest Rated ⭐</option>
              <option value="rating_asc">Lowest Rated</option>
              <option value="newest">Newest Added</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </section>

        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-4"
                >
                  <div className="flex justify-between">
                    <div className="h-5 bg-slate-200 rounded w-20" />
                    <div className="h-5 bg-slate-200 rounded w-12" />
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-16 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center text-red-700">
              <h3 className="text-sm font-bold">Failed to load colleges</h3>
              <p className="text-xs mt-1 text-red-600">
                Please make sure the backend server is running on port 5000.
              </p>
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
              <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No colleges matched your search</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for another keyword or change the city filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.map((college) => (
                <CollegeCard
                  key={college._id}
                  college={college}
                  onSelect={(col) => setSelectedCollege(col)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CampusReview — Full-Stack College Review System Assessment</p>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <a
              href="http://localhost:5000/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Swagger API Docs</span>
            </a>
          </div>
        </div>
      </footer>

      {selectedCollege && (
        <CollegeDetailModal
          college={selectedCollege}
          onClose={() => setSelectedCollege(null)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <AddCollegeModal isOpen={isAddCollegeOpen} onClose={() => setIsAddCollegeOpen(false)} />
    </div>
  );
}
