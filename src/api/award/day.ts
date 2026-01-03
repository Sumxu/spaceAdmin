import { type Result, post} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/reward/day/rank/page", data);
}
export function exportXlsx<T>(data?: any): Promise<Result<T>> {
   return post("/reward/day/rank/export", data);
}
