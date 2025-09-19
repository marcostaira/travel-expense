export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage?: number;
  previousPage?: number;
}

export interface FilterParams {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  category?: string;
  userId?: string;
  tenantId?: string;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export class PaginationHelper {
  /**
   * Create paginated response
   */
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      ...(hasNextPage && { nextPage: page + 1 }),
      ...(hasPreviousPage && { previousPage: page - 1 }),
    };
  }

  /**
   * Calculate skip value for database queries
   */
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(
    page: number,
    limit: number
  ): {
    page: number;
    limit: number;
  } {
    const validatedPage = Math.max(1, Math.floor(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, Math.floor(limit) || 20));

    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }

  /**
   * Create Prisma pagination object
   */
  static getPrismaSkipTake(page: number, limit: number) {
    const { page: validPage, limit: validLimit } =
      this.validatePaginationParams(page, limit);

    return {
      skip: this.getSkip(validPage, validLimit),
      take: validLimit,
    };
  }

  /**
   * Create Prisma orderBy object from sort parameters
   */
  static getPrismaOrderBy(sortBy?: string, sortOrder: "asc" | "desc" = "desc") {
    if (!sortBy) return { createdAt: "desc" };

    return {
      [sortBy]: sortOrder,
    };
  }
}
