export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface College {
  _id: string;
  name: string;
  location: string;
  city: string;
  state?: string;
  description: string;
  website?: string;
  establishedYear?: number;
  averageRating: number;
  reviewCount: number;
  createdBy?: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  college: string | { _id: string; name: string; city: string };
  user: User;
  createdAt: string;
  updatedAt?: string;
}

export interface RatingBreakdownItem {
  _id: number;
  count: number;
}

export interface CollegeDetailStats {
  averageRating: number;
  totalReviews: number;
  breakdown: RatingBreakdownItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface CreateReviewPayload {
  collegeId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface CreateCollegePayload {
  name: string;
  location: string;
  city: string;
  state?: string;
  description: string;
  website?: string;
  establishedYear?: number;
}
