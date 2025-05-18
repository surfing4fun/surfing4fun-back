import { Injectable } from '@nestjs/common';

/**
 * Minimal interface for any PrismaClient-like service supporting raw queries.
 */
export interface IPrismaQueryable {
  /** Execute a raw SQL string without parameter binding. */
  $queryRawUnsafe<T = any>(sql: string): Promise<T[]>;
  /** Execute a raw SQL string with parameter binding. */
  $queryRaw<T = any>(sql: string, ...params: unknown[]): Promise<T[]>;
}

/**
 * Paginated result wrapper including data, metadata, and HATEOAS links.
 */
export interface IPagedResult<T> {
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
  /**
   * Core offset-based pagination with HATEOAS links.
   * @param queryFn   Callback that fetches a page of results given skip & take.
   * @param countFn   Callback that returns the total count of matching records.
   * @param page      Page number (1-based). Default is 1.
   * @param pageSize  Number of items per page. Defaults to 20, capped at 100.
   * @param buildUrl  Optional function to build pagination links given a page number.
   *                  If omitted, links use only query parameters.
   * @returns         An object containing `data`, `meta`, and `links` fields.
   */
  async paginate<T>(
    queryFn: (opts: { skip: number; take: number }) => Promise<T[]>,
    countFn: () => Promise<number>,
    page = 1,
    pageSize = 20,
    buildUrl?: (p: number) => string,
  ): Promise<IPagedResult<T>> {
    const take = Math.min(Math.max(1, pageSize), 100);
    const skip = Math.max(0, page - 1) * take;

    const [data, total] = await Promise.all([
      queryFn({ skip, take }),
      countFn(),
    ]);

    const totalPages = Math.ceil(total / take);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

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

  /**
   * SQL-based pagination helper.
   * @param prisma    The PrismaClient-like service to execute raw queries.
   * @param baseSql   SQL string (without LIMIT/OFFSET) or builder that returns
   *                  `{ sql, params }` given skip & take.
   * @param countSql  COUNT-SQL string or builder that returns `{ sql, params }`.
   * @param page      Page number (1-based). Default is 1.
   * @param pageSize  Number of items per page. Defaults to 20.
   * @param buildUrl  Optional function to build pagination links.
   * @returns         A paginated result with data, meta, and links.
   */
  async paginateSql<T>(
    prisma: IPrismaQueryable,
    baseSql:
      | string
      | ((opts: { skip: number; take: number }) => {
          sql: string;
          params: unknown[];
        }),
    countSql: string | (() => { sql: string; params: unknown[] }),
    page = 1,
    pageSize = 20,
    buildUrl?: (p: number) => string,
  ): Promise<IPagedResult<T>> {
    return this.paginate<T>(
      ({ skip, take }) => {
        if (typeof baseSql === 'string') {
          const sql = `${baseSql} LIMIT ${take} OFFSET ${skip};`;
          return prisma.$queryRawUnsafe<T>(sql);
        }
        const { sql, params } = baseSql({ skip, take });
        return prisma.$queryRaw<T>(sql, ...params);
      },
      () => {
        if (typeof countSql === 'string') {
          return prisma
            .$queryRawUnsafe<{ count: bigint }>(countSql)
            .then((rows) => Number(rows[0]?.count ?? 0));
        }
        const { sql, params } = countSql();
        return prisma
          .$queryRaw<{ count: bigint }>(sql, ...params)
          .then((rows) => Number(rows[0]?.count ?? 0));
      },
      page,
      pageSize,
      buildUrl,
    );
  }

  /**
   * Convenience wrapper: paginate raw SQL with automatic COUNT.
   * @param prisma    The PrismaClient-like service for raw queries.
   * @param baseSql   SQL string or builder (without LIMIT/OFFSET).
   * @param table     Table name used for COUNT query.
   * @param whereSql  Optional WHERE clause (include preceding "WHERE").
   * @param page      Page number (1-based).
   * @param pageSize  Items per page.
   * @param buildUrl  Optional function for HATEOAS links.
   * @returns         A paginated result with data, meta, and links.
   */
  async paginateSqlAutoCount<T>(
    prisma: IPrismaQueryable,
    baseSql:
      | string
      | ((opts: { skip: number; take: number }) => {
          sql: string;
          params: unknown[];
        }),
    table: string,
    whereSql = '',
    page = 1,
    pageSize = 20,
    buildUrl?: (p: number) => string,
  ): Promise<IPagedResult<T>> {
    const countSql = `SELECT COUNT(*) AS count FROM ${table} ${whereSql}`;
    return this.paginateSql<T>(
      prisma,
      baseSql,
      countSql,
      page,
      pageSize,
      buildUrl,
    );
  }
}
