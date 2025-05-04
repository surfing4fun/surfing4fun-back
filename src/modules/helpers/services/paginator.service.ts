// src/modules/helpers/services/paginator.service.ts
import { Injectable } from '@nestjs/common';

export interface PagedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  links: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
}

@Injectable()
export class PaginatorService {
  async paginate<T>(
    queryFn: (opts: { skip: number; take: number }) => Promise<T[]>,
    countFn: () => Promise<number>,
    page = 1,
    pageSize = 10,
    buildUrl?: (page: number) => string,
  ): Promise<PagedResult<T>> {
    const take = Math.max(1, pageSize);
    const skip = Math.max(0, page - 1) * take;

    const [data, total] = await Promise.all([
      queryFn({ skip, take }),
      countFn(),
    ]);

    const totalPages = Math.ceil(total / take);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // default only query‐string builder
    const defaultBuilder = (p: number) => `?page=${p}&pageSize=${take}`;
    const urlFor = buildUrl ?? defaultBuilder;

    const links = {
      self: urlFor(page),
      first: urlFor(1),
      prev: hasPreviousPage ? urlFor(page - 1) : null,
      next: hasNextPage ? urlFor(page + 1) : null,
      last: urlFor(totalPages),
    };

    return {
      data,
      meta: {
        total,
        page,
        pageSize: take,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      links,
    };
  }
}
