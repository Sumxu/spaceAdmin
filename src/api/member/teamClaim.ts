import { type Result, post, put ,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/bill/claim/page", data);
}
 
/**
 * 导出
 * @param query .
 * @returns .
 */
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
  return post("/bill/claim/export", data);
}
