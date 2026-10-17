import React from 'react';
import { Calendar, ExternalLink, MapPin, MessageSquare, Star } from 'lucide-react';
import type { College } from '../types';

interface CollegeCardProps {
  college: College;
  onSelect: (college: College) => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({ college, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wide">
            {college.city}
          </span>

          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span className="text-xs font-black font-mono">
              {college.averageRating > 0 ? college.averageRating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 mb-2">
          {college.name}
        </h3>

        <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{college.location}</span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {college.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
          {college.establishedYear && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Est. {college.establishedYear}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-slate-400" />
            <span>{college.reviewCount} {college.reviewCount === 1 ? 'review' : 'reviews'}</span>
          </div>

          {college.website && (
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-0">
        <button
          type="button"
          onClick={() => onSelect(college)}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>View Reviews & Rate</span>
        </button>
      </div>
    </div>
  );
};
