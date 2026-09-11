export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = PaginationParams & {
  items: T[];
  total: number;
};

export function getPagination(pageValue?: string, limitValue?: string): PaginationParams {
  const parsePositiveInteger = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    page: parsePositiveInteger(pageValue, 1),
    limit: Math.min(parsePositiveInteger(limitValue, 10), 100),
  };
}

export function paginate<T>(items: T[], { page, limit }: PaginationParams): PaginatedResult<T> {
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    page,
    limit,
    total: items.length,
  };
}

export function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  if (!value || typeof value !== "object") return false;

  const result = value as Partial<PaginatedResult<unknown>>;
  return (
    Array.isArray(result.items) &&
    typeof result.page === "number" &&
    typeof result.limit === "number" &&
    typeof result.total === "number"
  );
}
