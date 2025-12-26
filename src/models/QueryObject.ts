export interface QueryObject
  extends Partial<{ [key: string]: string | string[] }> {
  page?: string;
  limit?: string;
  order?: "asc" | "desc";
}

export interface Query {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
}

export function queryToParams(req: Query): URLSearchParams {
  const params = new URLSearchParams();
  Object.keys(req).map((e) => {
    const value = req[e];
    params.set(e, value.toString());
  });
  return params;
}

export function pageFromQuery(req: QueryObject) {
  const pages = {
    limit: Number(req.limit) || 10,
    page: Number(req.page) || 1,
  };
  if (pages.limit > 25) throw new Error("Limit cannot be greater than 25");
  return pages;
}
