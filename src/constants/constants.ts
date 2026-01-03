/**
 * 选项
 */
export interface SelectOption<T> {
  label: string;
  value: T;
}
export interface SelectOptionMap<T> {
  [key: string | number]: T;
}
/**
 * 菜单类型
 */
export const MenuTypeOptions: SelectOption<number>[] = [
  { label: "目录", value: 0 },
  { label: "菜单", value: 1 },
  { label: "权限", value: 2 }
];

export const isNodeTypeOptions: SelectOption<number>[] = [
  { label: "是", value: true },
  { label: "否", value: false }
];

export const MenuTypeMap: SelectOptionMap<string> = {
  0: "目录",
  1: "菜单",
  2: "权限"
};

/**
 * 状态
 */
export const enableOptions: SelectOption<number>[] = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 }
];
export const enableMap: SelectOptionMap<string> = {
  1: "启用",
  0: "禁用"
};
export const enableBooleanMap: SelectOptionMap<boolean> = {
  1: true,
  0: false
};

export const ifEnableOptions: SelectOption<boolean>[] = [
  { label: "启用", value: true },
  { label: "禁用", value: false }
];

export const ifNumberOptions: SelectOption<number>[] = [
  { label: "是", value: 1 },
  { label: "否", value: 0 }
];

export const ifOptions: SelectOption<boolean>[] = [
  { label: "是", value: true },
  { label: "否", value: false }
];
/**
 * 系统配置类型
 */
export const configTypeOptions: SelectOption<number>[] = [
  { label: "系统配置", value: 1 },
  { label: "业务配置", value: 2 }
];

export const configTypeMap: SelectOptionMap<string> = {
  1: "系统配置",
  2: "业务配置"
};
export const typeMap: SelectOptionMap<string> = {
  0: "直推奖励",
  1: "团队奖励"
};
export const depositStatusMap: SelectOptionMap<string>[] = {
  0: "正常",
  1: "结束"
};
export const depositStatusOptions: SelectOption<number>[] = [
  { label: "正常", value: 0 },
  { label: "结束", value: 1 }
];
export const userStatusOptions: SelectOption<number>[] = [
  { label: "正常", value: 1 },
  { label: "禁用", value: 2 }
];

/**
 * 系统配置类型
 */
export const typeOptions: SelectOption<number>[] = [
  { label: "直推奖励", value: 1 },
  { label: "团队奖励", value: 2 }
];
export const coinTypeOptions: SelectOption<number>[] = [
  { label: "全部", value: 0 },
  { label: "USDT", value: 1 },
  { label: "USD", value: 2 },
  { label: "TUSD", value: 3 },
  { label: "TAX", value: 4 },
  { label: "积分", value: 5 }
];
export const awardOptions: SelectOption<number>[] = [
  { label: "待发奖", value: 0 },
  { label: "已发送", value: 1 }
];

export const day: SelectOption<number>[] = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 }
];
export const statusMap: SelectOptionMap<string> = {
  0: "处理中",
  1: "成功",
  2: "失败"
};
export const awardMap: SelectOptionMap<string> = {
  0: "待发奖",
  1: "已发送"
};
export const levelOptions: SelectOption<number>[] = [
  { label: "无", value: 0 },
  { label: "小节点", value: 1 },
  { label: "大节点", value: 2 },
  { label: "超级节点", value: 3 },
  { label: "社区节点", value: 4 }
];
export const userSetLevelOptions: SelectOption<number>[] = [
  { label: "无", value: 0 },
  { label: "F1", value: 1 },
  { label: "F2", value: 2 },
  { label: "F3", value: 3 },
  { label: "F4", value: 4 },
  { label: "F5", value: 5 },
  { label: "F6", value: 6 },
  { label: "F7", value: 7 },
  { label: "F8", value: 8 },
  { label: "F9", value: 9 }
];
export const userLevelOptions: SelectOption<number>[] = [
  { label: "无", value: 0 },
  { label: "F1", value: 1 },
  { label: "F2", value: 2 },
  { label: "F3", value: 3 },
  { label: "F4", value: 4 },
  { label: "F5", value: 5 },
  { label: "F6", value: 6 },
  { label: "F7", value: 7 }
];
export const userTypeOptions: SelectOption<number>[] = [
  { label: "全部", value: "null" },
  { label: "安品区", value: 1 },
  { label: "优品区", value: 2 },
  { label: "臻品区", value: 3 },
  { label: "兑换区", value: 4 }
];
export const pledgeOptions: SelectOption<number>[] = [
  { label: "正常", value: 1 },
  { label: "结束", value: 2 }
];
export const buyStatusOptions: SelectOption<number>[] = [
  { label: "全部", value: null },
  { label: "已购买", value: 1 },
  { label: "已发货", value: 2 },
  { label: "已完成", value: 2 }
];
export const payTypeOptions: SelectOption<number>[] = [
  { label: "USDT", value: 1 },
  { label: "USD", value: 2 },
  { label: "TUSD", value: 3 }
];
export const classifyOptions: SelectOption<number>[] = [
  { label: "全部", value: "null" },
  { label: "安品区", value: 1 },
  { label: "优品区", value: 2 },
  { label: "臻品区", value: 3 },
  { label: "兑换区", value: 4 }
];
export const amountOptions: SelectOption<number>[] = [
  { label: "USD", value: 2 },
  { label: "TUSD", value: 3 },
  { label: "积分", value: 5 }
];
export const bizTypeOptions: SelectOption<number>[] = [
  { label: "全部", value: 0 },
  { label: "积分释放", value: 1 },
  { label: "购买商品", value: 2 },
  { label: "提现", value: 3 },
  { label: "质押", value: 4 },
  { label: "赎回", value: 5 },
  { label: "质押收益", value: 6 },
  { label: "卖出商品", value: 7 },
  { label: "团队加速", value: 8 },
  { label: "平级加速", value: 9 },
  { label: "直推", value: 10 },
  { label: "间推", value: 11 },
  { label: "派送", value: 12 }
];

export const pidOptions: SelectOption<number>[] = [
  { label: "全部", value: "null" },
  { label: "1天", value: 0 },
  { label: "15天", value: 1 },
  { label: "30天", value: 2 }
];
export const pledgeTypeOptions: SelectOption<number>[] = [
  { label: "查个人", value: 1 },
  { label: "查伞下", value: 2 }
];
export const userlevelMap: SelectOptionMap<string> = {
  0: "无",
  1: "F1",
  2: "F2",
  3: "F3",
  4: "F4",
  5: "F5",
  6: "F6",
  7: "F7"
};
export const pidMap: SelectOptionMap<string> = {
  0: "1天",
  1: "15天",
  2: "30天"
};
export const rewardTypeMip: SelectOptionMap<string> = {
  1: "团队奖励",
  2: "代数奖励"
};
export const levelMap: SelectOptionMap<string> = {
  0: "无",
  1: "小节点",
  2: "大节点",
  3: "超级节点",
  4: "社区节点"
};
export const userTypeMap: SelectOptionMap<string> = {
  0: "无",
  1: "安品商家",
  2: "优品区",
  3: "臻品区",
  4: "兑换区"
};

export const pledgeMap: SelectOptionMap<string> = {
  0: "正常",
  1: "结束"
};
export const coinTypeMap: SelectOptionMap<string> = {
  1: "USDT",
  2: "USD",
  3: "TUSD",
  4: "TAX",
  5: "积分"
};

export const bizTypeMap: SelectOptionMap<string> = {
  1: "积分释放",
  2: "购买商品",
  3: "提现",
  4: "质押",
  5: "赎回",
  6: "质押收益",
  7: "卖出商品",
  8: "团队加速",
  9: "平级加速",
  10: "直推",
  11: "间推",
  12: "派送"
};
export const orderMap: SelectOptionMap<string> = {
  1: "已购买",
  2: "已发货",
  3: "已完成"
};
export const payTypeMap: SelectOptionMap<string> = {
  1: "USDT",
  2: "USD",
  3: "TUSD"
};
export const classifyMap: SelectOptionMap<string> = {
  0: "请选择",
  1: "安品区",
  2: "优品区",
  3: "臻品区",
  4: "兑换区"
};
