import { type Result, post, get } from "../base";

export function queryPage<T>(query?: any): Promise<Result<T>> {
  return post("/stat/page", query);
}
export function queryInfo<T>(query?: any): Promise<Result<T>> {
  return get("/stat/total", query);
}