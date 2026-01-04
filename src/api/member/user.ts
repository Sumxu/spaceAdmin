import { type Result, post, put ,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/user/page", data);
}
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
  return post("/user/export", data);
}
export function queryNode<T>(data?: any): Promise<Result<T>> {
  return get("/user/queryNode", data);
}