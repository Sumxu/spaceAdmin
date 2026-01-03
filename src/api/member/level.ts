import { type Result, post, put ,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/level/page", data);
}
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
  return post("/level/export", data);
}
