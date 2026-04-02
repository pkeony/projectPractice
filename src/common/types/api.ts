export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedReponse<T> {
  list: T[];
  totalCount: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
