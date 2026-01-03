<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import message from "@/utils/message";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod,
  toWei
} from "@/utils/wallet";
import { contractAddress } from "@/config/contract";
import mintageABI from "@/abi/mintageABI.ts";
import { ElMessageBox, ElSelect, ElOption } from "element-plus";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  openBtnSettingLoading: false,
  closeBtnSettingLoading: false,
  addLoading: false,
  reduceLoading: false,
  isSetting: false,
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
      label: "日期范围",
      prop: "dates",
      placeholder: "请输入日期范围",
      startPlaceholder: "请输入开始日期范围",
      endPlaceholder: "请输入结束日期范围"
    }
  ],
  dataSource: {},
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    info: {
      addNum: "", //增加的额度
      reduceNum: "", //减少的额度
      totalQuota: 0, //总额度
      useQuota: 0, //已使用额度
      isOpen: false //是否开启了铸造池
    },
    columns: [
      {
        label: "编号",
        prop: "id"
      },
      {
        label: "USDT购买",
        prop: "usdtBuy"
      },
      {
        label: "USD购买",
        prop: "usdBuy"
      },
      {
        label: "TUSD购买",
        prop: "tusdBuy"
      },
      { label: "购买日期", prop: "day" }
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
const _loadData = (page?: number) => {};

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
  }
};
const getTotalQuota = async () => {
  const res = await callContractMethod(
    contractAddress.GaussMintage,
    mintageABI,
    "totalQuota",
    []
  );
  pageData.tableParams.info.totalQuota = res;
};
const getUseQuota = async () => {
  const res = await callContractMethod(
    contractAddress.GaussMintage,
    mintageABI,
    "useQuota",
    []
  );
  pageData.tableParams.info.useQuota = res;
};
/**
 *
 * @param val 是否开启关闭 铸造池
 */
const settingOpen = async val => {
  pageData.isSetting = true;
  try {
    if (val) {
      pageData.openBtnSettingLoading = true;
    } else {
      pageData.closeBtnSettingLoading = true;
    }
    const result = await callContractMethod(
      contractAddress.GaussMintage,
      mintageABI,
      "setMintageStatus",
      [val],
      true
    );
    message.success("设置成功");
  } catch (error) {
    pageData.isSetting = false;
    pageData.openBtnSettingLoading = false;
    pageData.closeBtnSettingLoading = false;
  }
};
/**
 *
 * @param val 增加或减少额度
 */
const mintageQuota = async val => {
  pageData.isSetting = true;
  let abiMethodName = ""; //对应的abi方法
  let amount = 0; //对应数量
  if (val == "add") {
    pageData.addLoading = false;
    abiMethodName = "addMintageQuota";
    amount = pageData.tableParams.info.addNum;
  } else {
    pageData.reduceLoading = false;
    abiMethodName = "subMintageQuota";
    amount = pageData.tableParams.info.reduceNum;
  }
  //判断amount是否大于0
  try {
    if (amount <= 0) {
      message.warning("请输入正确的数量");
      throw new Error("请输入正确的数量");
    }

    const result = await callContractMethod(
      contractAddress.GaussMintage,
      mintageABI,
      abiMethodName,
      [toWei(amount)],
      true
    );
    message.success("设置成功");
    _loadData();
  } catch (error) {
    pageData.isSetting = false;
    pageData.reduceLoading = false;
    pageData.addLoading = false;
  }
};
//查询统计数据
const _loadInfo = async () => {
  getTotalQuota();
  getUseQuota();
};
onMounted(() => _loadInfo());
</script>

<template>
  <el-card :shadow="'never'">
    <div>
      <el-space wrap>
        <el-card class="box-card" style="margin: 12px 0; width: 320px">
          <template #header>
            <div class="card-header">铸造池开关</div>
          </template>
          <div class="text item">
            <el-button
              type="primary"
              @click="settingOpen(true)"
              :disabled="pageData.isSetting"
              :loading="pageData.openBtnSettingLoading"
              >开启铸造池</el-button
            >
            <el-button
              type="danger"
              @click="settingOpen(false)"
              :disabled="pageData.isSetting"
              :loading="pageData.closeBtnSettingLoading"
              >关闭铸造池</el-button
            >
          </div>
        </el-card>
        <el-card class="box-card" style="margin: 12px 0; width: 320px">
          <template #header>
            <div class="card-header">铸币池总额度</div>
          </template>
          <div class="text item">
            <span
              >数量:{{ pageData.tableParams.info.totalQuota.toString() }}</span
            >
          </div>
        </el-card>
        <el-card class="box-card" style="margin: 12px 0; width: 320px">
          <template #header>
            <div class="card-header">剩余额度</div>
          </template>
          <div class="text item">
            <span
              >数量:{{
                pageData.tableParams.info.totalQuota.toString() -
                pageData.tableParams.info.useQuota.toString()
              }}</span
            >
          </div>
        </el-card>
      </el-space>
    </div>

    <div>
      <el-space wrap>
        <el-card class="box-card" style="margin: 12px 0; width: 320px">
          <template #header>
            <div class="card-header">
              增加额度
              <el-button
                style="margin-left: 12px"
                type="danger"
                @click="mintageQuota('add')"
                :disabled="pageData.isSetting"
                :loading="pageData.addLoading"
                >设置</el-button
              >
            </div>
          </template>
          <div class="text item">
            <el-input
              v-model="pageData.tableParams.info.addNum"
              style="width: 240px"
              type="number"
              Clearable
              placeholder="请输入要增加的额度"
            />
          </div>
        </el-card>

        <el-card class="box-card" style="margin: 12px 0; width: 320px">
          <template #header>
            <div class="card-header">
              减少额度<el-button
                style="margin-left: 12px"
                type="danger"
                Clearable
                @click="mintageQuota('reduce')"
                :disabled="pageData.isSetting"
                :loading="pageData.reduceLoading"
                >设置</el-button
              >
            </div>
          </template>
          <div class="text item">
            <el-input
              type="number"
              v-model="pageData.tableParams.info.reduceNum"
              style="width: 240px"
              placeholder="请输入要减少的额度"
            />
          </div>
        </el-card>
      </el-space>
    </div>
  </el-card>
</template>
