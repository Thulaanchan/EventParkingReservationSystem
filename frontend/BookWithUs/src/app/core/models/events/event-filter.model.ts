export interface EventFilter {
  search?: string | null;
  venue?: number | null;
  category?: number | null;
  date?: string | null;
  time?: string | null;
  page?: number | null;
  pageSize?: number | null;
  includePast?: boolean | null;
}
