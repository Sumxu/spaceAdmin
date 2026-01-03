import { type Result, get, post } from "../base";
/**
 * 分页查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(query?: any): Promise<Result<T>> {
  return get("/sys/notice/page", query);
}

/**
 * 获取详情
 * @param id
 * @returns
 */
export function queryInfo<T>(id?: any): Promise<Result<T>> {
  return get("/sys/notice/info", id);
}
/**
 * 新增
 * @param data .
 * @returns .
 */
export function save<T>(data: any): Promise<Result<T>> {
  return post("/sys/notice/save", data);
}
/**
 * 更新
 * @param id .
 * @param data .
 * @returns  .
 */
export function update<T>(data: any): Promise<Result<T>> {
  return post(`/sys/notice/update`, data);
}

/**
 * 删除
 * @param userIds .
 * @returns  .
 */
export function del<T>(id: any): Promise<Result<T>> {
  return get(`/sys/notice/delete`, id);
}
