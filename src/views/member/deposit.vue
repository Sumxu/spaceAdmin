<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/member/deposit";
import message from "@/utils/message";
import { fromWei, callContractMethod } from "@/utils/wallet";
import { depositStatusOptions, amountOptions, userSetLevelOptions, pidOptions, pledgeTypeOptions, pidMap } from "@/constants/constants";
import { depositStatusConvert, pidMapConvert, pidScopeConvert } from "@/constants/convert";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
import StatusTabs from "@/components/opts/status-tabs.vue";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  amountType: "",//派送类型
  amountNumber: "",//派送数量
  pid: "null",
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    },
    {
      type: "date",
      dateType: "datetimerange",
      label: "投入日期范围",
      prop: "dates",
      placeholder: "请输入日期范围",
      startPlaceholder: "请输入开始日期范围",
      endPlaceholder: "请输入结束日期范围",
    },
    {
      type: "date",
      dateType: "datetimerange",
      label: "赎回日期范围",
      prop: "redeemDates",
      placeholder: "请输入日期范围",
      startPlaceholder: "请输入开始日期范围",
      endPlaceholder: "请输入结束日期范围",
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      placeholder: "请选择",
      dataSourceKey: "depositStatusOptions",
      options: {
        filterable: true,
        keys: {
          prop: "value",
          value: "value",
          label: "label"
        }
      }
    },
    {
      type: "radio",
      label: "类型",
      prop: "queryType",
      default: 1,
      dataSourceKey: "pledgeTypeOptions",
      options: {
        filterable: true,
        keys: {
          prop: "prop",
          value: "value",
          label: "label"
        }
      }
    }
  ],
  dataSource: {
    depositStatusOptions: depositStatusOptions,
    pidOptions: pidOptions,
    pledgeTypeOptions: pledgeTypeOptions
  },
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [
      { key: "promotion", label: "导出报表", icon: "ep:promotion", state: true },
    ],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    columns: [
      {
        label: "钱包地址",
        prop: "address",
        width: "370px"
      },
      { label: "天数", prop: "pid", minWidth: "120px", slot: "pidScope" },
      { label: "USDT", prop: "usdt", minWidth: "120px", slot: "usdtScope" },
      { label: "JU", prop: "ju", minWidth: "120px", slot: "juScope" },
      { label: "赎回时间", prop: "redeemTime", minWidth: "120px" },
      { label: "状态", prop: "status", minWidth: "120px", slot: 'statusScope' },
      { label: "投入时间", prop: "createTime", width: "180px" }
    ],
    list: [],
    loading: false,
    pagination: {
      pageSize: 50,
      defaultPageSize: 50,
      currentPage: 1,
      total: 0,
      background: true,
      pageSizes: [50, 100, 200, 300, 500]
    }
  }
});

// 搜索表单变化
const _updateSearchFormData = (data: any) => (pageData.searchForm = data);

// 查询
const _searchForm = (data: any) => {
  pageData.searchForm = data;
  _loadData();
};

// 重置
const _resetSearchForm = (data?) => (pageData.searchForm = data);

// 获取分页参数
const getQueryParams = () => ({
  ...pageData.searchForm,
  current: pageData.tableParams.pagination.currentPage,
  size: pageData.tableParams.pagination.pageSize,
  pid: pageData.pid
});

// 获取表格数据
const _loadData = (page?: number) => {
  pageData.tableParams.list = []
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) query.current = page;
  $Api
    .queryPage(query)
    .then((res: any) => {
      if (res.code === 200) {
        pageData.tableParams.list = res.data.records;
        pageData.tableParams.pagination.total = Number(res.data.total);
      } else {
        message.warning(res.msg);
        pageData.tableParams.list = [];
        pageData.tableParams.pagination.total = 0;
      }
    })
    .finally(() => (pageData.tableParams.loading = false));
};

// 分页切换
const handleChangePageSize = (val: any) => {
  pageData.tableParams.pagination.pageSize = val;
  _loadData();
};

const handleChangeCurrentPage = (val: any) => {
  pageData.tableParams.pagination.currentPage = val;
  _loadData();
};

// 按钮操作
const btnClickHandle = (key: string) => {
  switch (key) {
    case "search":
      pageData.searchState = !pageData.searchState;
      break;
    case "refresh":
      _loadData();
      break;
    case "promotion":
      deriveXlsx();
      break;
  }
};



//导出报表
const deriveXlsx = async () => {
  const query = getQueryParams();
  const res = await $Api.exportXlsx(query)
  if (res.success) {
    saveExcelFile(res.data, "用户质押记录");
  }
}
const handleClick = (tabName: any) => {
  pageData.pid = tabName;
  _loadData();
};
onMounted(() => _loadData());
</script>

<template>
  <el-card :shadow="'never'">
    <form-search :show="pageData.searchState" :form-field="pageData.searchField" :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData" @search="_searchForm" @reset="_resetSearchForm" />
    <table-buttons :size="pageData.btnOpts.size" :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns" @click="btnClickHandle" />
    <status-tabs v-model="pageData.pid" :tabs="pidOptions" @change="handleClick" />
    <pure-table :data="pageData.tableParams.list" :columns="pageData.tableParams.columns" row-key="address" border
      stripe :loading="pageData.tableParams.loading" :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage" @page-size-change="handleChangePageSize">
      <template #pidScope="scope">
        <span>{{ pidScopeConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #statusScope="scope">
        <span>{{ depositStatusConvert(scope.row[scope.column.property]) }}</span>
      </template>

      <template #usdtScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>

      </template>
      <template #juScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
    </pure-table>
  </el-card>
</template>
