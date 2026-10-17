import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApiResponse,
  AuthResponseData,
  College,
  CollegeDetailStats,
  CreateCollegePayload,
  CreateReviewPayload,
  Review,
} from '../types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('crs_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Colleges', 'CollegeDetail', 'Reviews'],
  endpoints: (builder) => ({
    getColleges: builder.query<
      ApiResponse<{ colleges: College[] }>,
      { page?: number; limit?: number; search?: string; city?: string; sort?: string }
    >({
      query: (params) => ({
        url: '/colleges',
        params,
      }),
      providesTags: ['Colleges'],
    }),

    getCollegeById: builder.query<
      ApiResponse<{ college: College; stats: CollegeDetailStats }>,
      string
    >({
      query: (id) => `/colleges/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'CollegeDetail', id }],
    }),

    getCollegeReviews: builder.query<
      ApiResponse<{ reviews: Review[] }>,
      { collegeId: string; page?: number; limit?: number; rating?: number; sort?: string }
    >({
      query: ({ collegeId, ...params }) => ({
        url: `/colleges/${collegeId}/reviews`,
        params,
      }),
      providesTags: ['Reviews'],
    }),

    createReview: builder.mutation<ApiResponse<{ review: Review }>, CreateReviewPayload>({
      query: ({ collegeId, ...body }) => ({
        url: `/colleges/${collegeId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { collegeId }) => [
        'Reviews',
        'Colleges',
        { type: 'CollegeDetail', id: collegeId },
      ],
    }),

    deleteReview: builder.mutation<ApiResponse<null>, { reviewId: string; collegeId: string }>({
      query: ({ reviewId }) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { collegeId }) => [
        'Reviews',
        'Colleges',
        { type: 'CollegeDetail', id: collegeId },
      ],
    }),

    createCollege: builder.mutation<ApiResponse<{ college: College }>, CreateCollegePayload>({
      query: (body) => ({
        url: '/colleges',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Colleges'],
    }),

    login: builder.mutation<ApiResponse<AuthResponseData>, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<
      ApiResponse<AuthResponseData>,
      { name: string; email: string; password: string; role?: string }
    >({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetCollegesQuery,
  useGetCollegeByIdQuery,
  useGetCollegeReviewsQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useCreateCollegeMutation,
  useLoginMutation,
  useRegisterMutation,
} = api;
