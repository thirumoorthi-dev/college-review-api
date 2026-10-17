import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageSquarePlus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetCollegeByIdQuery,
  useGetCollegeReviewsQuery,
} from '../store/api';
import { useAppSelector } from '../store';
import type { College } from '../types';

interface CollegeDetailModalProps {
  college: College;
  onClose: () => void;
  onOpenAuth: () => void;
}

interface ReviewFormValues {
  rating: number;
  title: string;
  comment: string;
}

export const CollegeDetailModal: React.FC<CollegeDetailModalProps> = ({
  college,
  onClose,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: detailData } = useGetCollegeByIdQuery(college._id);
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetCollegeReviewsQuery({
    collegeId: college._id,
    rating: selectedRatingFilter,
    limit: 50,
  });

  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 5,
      title: '',
      comment: '',
    },
  });

  const selectedRating = watch('rating');

  const onSubmitReview = async (formData: ReviewFormValues) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await createReview({
        collegeId: college._id,
        rating: Number(formData.rating),
        title: formData.title || undefined,
        comment: formData.comment,
      }).unwrap();

      setSubmitSuccess(true);
      reset({ rating: 5, title: '', comment: '' });
      setTimeout(() => {
        setShowForm(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err: any) {
      setSubmitError(err?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview({ reviewId, collegeId: college._id }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to delete review');
    }
  };

  const stats = detailData?.data?.stats;
  const currentAverage = stats?.averageRating ?? college.averageRating;
  const totalReviews = stats?.totalReviews ?? college.reviewCount;
  const reviews = reviewsData?.data?.reviews || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {college.city}
              </span>
              {college.state && (
                <span className="text-slate-400 text-xs">• {college.state}</span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {college.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {college.location}
              </span>
              {college.establishedYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Est. {college.establishedYear}
                </span>
              )}
              {college.website && (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:border-r md:border-slate-200 md:pr-6 shrink-0">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                {currentAverage > 0 ? currentAverage.toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center justify-center gap-1 my-1.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(currentAverage)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-500 font-semibold">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="flex-1 w-full space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count =
                  stats?.breakdown?.find((b) => b._id === stars)?.count || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <button
                    type="button"
                    key={stars}
                    onClick={() =>
                      setSelectedRatingFilter((prev) => (prev === stars ? undefined : stars))
                    }
                    className={`w-full flex items-center gap-2 text-xs font-semibold py-0.5 px-1 rounded transition-colors cursor-pointer ${
                      selectedRatingFilter === stars
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-10 text-left font-mono">{stars} star</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <span>Sign in to Review</span>
                </button>
              )}
            </div>
          </div>

          {showForm && isAuthenticated && (
            <form
              onSubmit={handleSubmit(onSubmitReview)}
              className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Share your experience</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Reviewing as <strong className="text-slate-800">{user?.name}</strong>
                </span>
              </div>

              {submitError && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Review published successfully! Aggregated rating updated.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Rating (1 to 5 Stars) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setValue('rating', star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= selectedRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-mono text-sm font-bold text-slate-700">
                    {selectedRating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headline / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Outstanding placements and great campus culture"
                  {...register('title', { maxLength: 120 })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Review Details *
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details about professors, campus infrastructure, research labs, or hostel facilities..."
                  {...register('comment', {
                    required: 'Please write your review comment (min 5 characters)',
                    minLength: {
                      value: 5,
                      message: 'Comment must be at least 5 characters',
                    },
                    maxLength: {
                      value: 1000,
                      message: 'Comment cannot exceed 1000 characters',
                    },
                  })}
                  className="w-full bg-white text-xs p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 outline-none resize-none"
                />
                {errors.comment && (
                  <span className="text-[11px] text-red-600 font-semibold block mt-1">
                    {errors.comment.message}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmittingReview ? 'Publishing...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Student & Faculty Reviews ({reviews.length})
              </h3>
              {selectedRatingFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedRatingFilter(undefined)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Clear {selectedRatingFilter}-star filter
                </button>
              )}
            </div>

            {isReviewsLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">
                  No reviews found for this selection. Be the first to write a review!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const isAuthor = user && rev.user && rev.user._id === user._id;
                  const isAdmin = user?.role === 'admin';

                  return (
                    <div
                      key={rev._id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                            {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {rev.user?.name || 'Anonymous User'}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  rev.user?.role === 'teacher'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {rev.user?.role || 'student'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>

                          {(isAuthor || isAdmin) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev._id)}
                              title="Delete Review"
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {rev.title && (
                        <h4 className="text-xs font-bold text-slate-800 mb-1">
                          {rev.title}
                        </h4>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
