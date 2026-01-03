<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/award/monty";
import message from "@/utils/message";
import { fromWei, callContractMethod, toWei } from "@/utils/wallet";
import { awardOptions } from "@/constants/constants";
import { awardMapConvert,userlevelConvert } from "@/constants/convert";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
import distributorABI from "@/abi/distributorABI.ts";
import Erc20ABI from "@/abi/Erc20.ts";
import { storeToRefs } from "pinia";
import { useWalletStoreHook } from "@/store/modules/wallet";
import { MaxUint256 } from "ethers";
const walletStore = useWalletStoreHook();
const { currentAddress, addressList } = storeToRefs(walletStore);
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  multipleSelection: [],
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址"
    },
     {
      type: "date",
      label: "奖励日期",
      prop: "date",
      placeholder: "请输入日期"
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      placeholder: "请选择",
      dataSourceKey: "awardOptions",
      options: {
        filterable: true,
        keys: {
          prop: "value",
          value: "value",
          label: "label"
        }
      }
    }
  ],
  dataSource: {
    awardOptions: awardOptions
  },
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [
      {
        key: "promotion",
        label: "导出报表",
        icon: "ep:promotion",
        state: true
      },
      {
        key: "pass",
        label: "发奖",
        icon: "ep:check",
        type: "success",
        state: true,
        loading: false
      }
    ],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    columns: [
      {
        type: "selection",
        align: "left"
      },
      {
        label: "钱包地址",
        prop: "address",
        width: "370px"
      },
      { label: "奖金", prop: "reward", minWidth: "120px", slot: "rewardScope" },
      { label: "状态", prop: "status", minWidth: "120px", slot: "statusScope" },
      { label: "等级", prop: "level", minWidth: "120px",slot:"levelScope" },
      { label: "奖励日期", prop: "date" },
      { label: "创建时间", prop: "createTime" }
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
  pageData.tableParams.list = [];
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
    case "pass":
      handlePass();
      break;
  }
};

const handlePass = async () => {
    const address=currentAddress.value
  if (pageData.multipleSelection.length <= 0) {
    message.error("请勾选一条数据");
    return;
  }
  let totalAmount = 0n;
  const users = [];
  const amounts = [];
  for (let i = 0; i < pageData.multipleSelection.length; i++) {
    const item = pageData.multipleSelection[i];
    if (item.status != 0) {
      message.error("不能勾选审核过的数据");
      return;
    }
    const amount = item.reward;
    totalAmount = totalAmount + BigInt(amount);
    users.push(item.address);
    amounts.push(amount);
  }
  //处理日期 2025-05-17 -> 20250517
  const day = pageData.multipleSelection[0].date;
  const formattedDay = day.replace(/-/g, ""); // "20250517"
  //查询usdt支出上限 不够去授权
  pageData.btnOpts.leftBtns[1].loading = true;

  const usdtAllowance = await callContractMethod(
    contractAddress.usdtToken,
    Erc20ABI,
    "allowance",
    [
      address,
      contractAddress.GaussDistributor
    ],
    false
  );
  if (usdtAllowance < totalAmount) {
    //授权是否足够发放奖励
    try {
      const appRoveResult = await callContractMethod(
        contractAddress.usdtToken,
        Erc20ABI,
        "approve",
        [contractAddress.GaussDistributor, MaxUint256],
        true
      );
      await fundAward(formattedDay, totalAmount, users, amounts);
    } catch (error) {
      message.error("取消了授权");
      pageData.btnOpts.leftBtns[1].loading = false;
    }
  } else {
    await fundAward(formattedDay, totalAmount, users, amounts);
  }
};

const fundAward = async (formattedDay, totalAmount, users, amounts) => {
  try {
    await callContractMethod(
      contractAddress.GaussDistributor,
      distributorABI,
      "fundMonty",
      [formattedDay, totalAmount, users, amounts],
      true
    );
    message.success("发奖成功");
    _loadData();
  } catch (error) {
  } finally {
    pageData.btnOpts.leftBtns[1].loading = false;
  }
};
const handleSelectionChange = val => {
  pageData.multipleSelection = val;
};
//导出报表
const deriveXlsx = async () => {
  const query = getQueryParams();
  const res = await $Api.exportXlsx(query);
  if (res.success) {
    saveExcelFile(res.data, "等级排行榜奖励列表");
  }
};
onMounted(() => _loadData());
</script>

<template>
  <el-card :shadow="'never'">
    <form-search
      :show="pageData.searchState"
      :form-field="pageData.searchField"
      :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData"
      @search="_searchForm"
      @reset="_resetSearchForm"
    />
    <table-buttons
      :size="pageData.btnOpts.size"
      :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns"
      @click="btnClickHandle"
    />
    <pure-table
      :data="pageData.tableParams.list"
      :columns="pageData.tableParams.columns"
      row-key="address"
      border
      stripe
      :loading="pageData.tableParams.loading"
      :pagination="pageData.tableParams.pagination"
      @page-current-change="handleChangeCurrentPage"
      @selection-change="handleSelectionChange"
      @page-size-change="handleChangePageSize"
    >
      <template #statusScope="scope">
        <span>{{ awardMapConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #rewardScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
      <template #levelScope="scope">
        <span>{{ userlevelConvert(scope.row[scope.column.property]) }}</span>
      </template>
    </pure-table>
  </el-card>
</template>
