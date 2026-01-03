import { get, Result, post, put, deleteRequest } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryList<T>(query?: any): Promise<Result<T>> {
  return get("/market/customer/list", query);
}

/**
 * 更新
 * @param id .
 * @param data .
 * @returns .
 */
export function update<T>(data?: T): Promise<Result<T>> {
  return post(`/market/customer/update`, data);
}
