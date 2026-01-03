import { get, type Result, post, put, deleteRequest } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryList<T>(query?: any): Promise<Result<T>> {
  return get("/sys/banner/query/list", query);
}
/**
 *  保存
 * @param data .
 * @returns  .
 */
export function save<T>(data?: T): Promise<Result<T>> {
  return post("/sys/banner/save", data);
}
/**
 * 更新
 * @param id .
 * @param data .
 * @returns .
 */
export function update<T>(id: string, data?: T): Promise<Result<T>> {
  return put(`/sys/banner/update/${id}`, {}, data);
}
/**
 * 删除
 * @param id .
 * @returns .
 */
export function delByIds<T>(id: string[]): Promise<Result<T>> {
  return deleteRequest(`/sys/banner/delete`, {}, id);
}
