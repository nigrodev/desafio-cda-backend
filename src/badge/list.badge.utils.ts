export class BadgeListingUtil {
  static BADGES_PATH = '/api/badge';

  static generatePaginationLinks(limit: number, page: number, count: number) {
    return {
      next:
        count >= limit
          ? `${this.BADGES_PATH}/list?limit=${limit}&page=${page + 1}`
          : undefined,
      prev:
        page > 1
          ? `${this.BADGES_PATH}/list?limit=${limit}&page=${page - 1}`
          : undefined,
    };
  }
}
