import { User } from './user.model';

/**
 * Generic API response wrapper for paginated requests
 */
export interface ApiResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: T[];
}

/**
 * Specific type for users API response
 */
export type UsersApiResponse = ApiResponse<User>;
