<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/member/user";
import message from "@/utils/message";
import { formatAddress, formatDate, fromWei, callContractMethod, toWei } from "@/utils/wallet";
import { levelOptions, userLevelOptions, userTypeMap, userTypeOptions, isNodeTypeOptions, amountOptions, userSetLevelOptions, pledgeTypeOptions } from "@/constants/constants";
import { userlevelConvert, levelConvert, userTypeConvert } from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption, ElInput } from "element-plus";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  amountType: "",//派送类型
  amountNumber: "",//派送数量
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址",
      width: "370"
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
    },
    {
      type: "input",
      label: "上级地址",
      prop: "parentAddress",
      placeholder: "请输入上级地址",
      width: "370"
    }
  ],
  dataSource: {
    userLevelOptions: userLevelOptions,
    userTypeOptions: userTypeOptions,
    isNodeTypeOptions: isNodeTypeOptions,
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
      {
        label: "上级地址",
        prop: "parentAddress",
        width: "370px"
      },
      { label: "团队人数", prop: "teamCount", minWidth: "120px" },
      { label: "直推人数", prop: "directCount", minWidth: "120px" },
      { label: "直推业绩", prop: "directPerf", minWidth: "120px", slot: "directPerfScope" },
      { label: "团队业绩", prop: "teamPerf", minWidth: "120px", slot: "teamPerfScope" },
      { label: "用户投入", prop: "myPerf", minWidth: "120px", slot: "myPerfScope" },
      { label: "权重", prop: "weight", minWidth: "120px" },
      { label: "创建时间", prop: "createTime", width: "180px" },
      {
        label: "操作",
        fixed: "right",
        slot: "operation",
        width: "120px"
      }
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
  size: pageData.tableParams.pagination.pageSize
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

const handleCount = async (address: string) => {
  const ecologyCount = ref<number>(0);
  const spaceCount = ref<number>(0);
  const loading = ref<boolean>(true);

  // 先弹窗（显示 loading）
  ElMessageBox({
    title: "查询伞下节点数量",
    message: () =>
      h(
        "div",
        {
          style:
            "width: 300px; display: flex; flex-direction: column; gap: 16px;"
        },
        [
          h(
            "div",
            { style: "display: flex; align-items: center; gap: 8px;" },
            [
              h("span", { style: "white-space: nowrap; font-weight: 500;" }, "太空节点"),
              h(ElInput, {
                modelValue: loading.value ? "加载中..." : spaceCount.value,
                disabled: true
              })
            ]
          ),
          h(
            "div",
            { style: "display: flex; align-items: center; gap: 8px;" },
            [
              h("span", { style: "white-space: nowrap; font-weight: 500;" }, "生态节点"),
              h(ElInput, {
                modelValue: loading.value ? "加载中..." : ecologyCount.value,
                disabled: true
              })
            ]
          )
        ]
      ),
    showCancelButton: false,
    confirmButtonText: "关闭"
  });

  // 再请求接口
  try {
    console.log("address==",address)
    const res: any = await $Api.queryNode({address:address});
    if (res.code === 200) {
      spaceCount.value = res.data.spaceCount ?? 0;
      ecologyCount.value = res.data.ecologyCount ?? 0;
    }
  } catch (err) {
    console.error("queryNode error:", err);
  } finally {
    loading.value = false;
  }
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
    saveExcelFile(res.data, "用户列表");
  }
}
onMounted(() => _loadData());
</script>

<template>
  <el-card :shadow="'never'">
    <form-search :show="pageData.searchState" :form-field="pageData.searchField" :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData" @search="_searchForm" @reset="_resetSearchForm" />
    <table-buttons :size="pageData.btnOpts.size" :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns" @click="btnClickHandle" />
    <pure-table :data="pageData.tableParams.list" :columns="pageData.tableParams.columns" row-key="address" border
      stripe :loading="pageData.tableParams.loading" :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage" @page-size-change="handleChangePageSize">
      <template #levelScope="scope">
        <span>{{ userlevelConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #nodeScope="scope">
        <el-switch v-model="scope.row[scope.column.property]" disabled />
      </template>
      <template #directPerfScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>

      </template>
      <template #teamPerfScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>

      </template>
      <template #myPerfScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>

      <template #operation="{ row }">
        <el-link type="primary" @click="handleCount(row.address)">伞下节点数量</el-link>
      </template>
    </pure-table>
  </el-card>
</template>
