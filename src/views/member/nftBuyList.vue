<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $Api from "@/api/member/nftBuy";
import message from "@/utils/message";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod,
  toWei
} from "@/utils/wallet";
import nftABI from "@/abi/nftABI.ts";
import {
  levelOptions,
  userLevelOptions,
  userTypeMap,
  userTypeOptions,
  isNodeTypeOptions,
  amountOptions,
  userSetLevelOptions,
  pledgeTypeOptions,
  nodeTypeOptions,
  payNftTypeOptions
} from "@/constants/constants";
import {
  userlevelConvert,
  levelConvert,
  userTypeConvert,
  nodeTypeMapConvert,
  payTypeConvert
} from "@/constants/convert";
import { ElMessageBox, ElSelect, ElOption, ElInput } from "element-plus";
import { contractAddress } from "@/config/contract";
import { saveExcelFile } from "@/utils/file";
const pageData: any = reactive({
  searchState: true,
  searchForm: {},
  searchField: [
    {
      type: "input",
      label: "钱包地址",
      prop: "address",
      placeholder: "请输入钱包地址",
      width: "370"
    }
  ],
  dataSource: {
    userLevelOptions: userLevelOptions,
    userTypeOptions: userTypeOptions,
    isNodeTypeOptions: isNodeTypeOptions,
    pledgeTypeOptions: pledgeTypeOptions,
    nodeTypeOptions: nodeTypeOptions,
    payNftTypeOptions: payNftTypeOptions
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
      // {
      //   key: "activateNode",
      //   label: "代开节点",
      //   icon: "ep:open",
      //   state: true
      // }
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
      { label: "tokenId", prop: "tokenId" },
      { label: "支付类型", prop: "payType", slot: "payTypeScope" },
      { label: "类型", prop: "nodeType", slot: "nodeTypeScope" },
      { label: "支付USDT额度", prop: "payAmount", slot: "amoutScope" },
      { label: "基金会USDT额度", prop: "foundationAmount", slot: "amoutScope" },
      { label: "购买时间", prop: "createTime" }
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
    case "activateNode":
      openNftChange();
      break;
  }
};
//给钱包地址开通nft
const openNftChange = async () => {
  const openAddress = ref("");
  const nftType = ref(""); // 1 太空 2 生态
  const sourceType = ref(""); // 0 USDT 1 FC+USDT 2 IFAI+USDT
  ElMessageBox({
    title: "代开节点",
    message: () =>
      h(
        "div",
        {
          style:
            "width: 400px; display: flex; flex-direction: column; gap: 14px;"
        },
        [
          // === 代开地址 ===
          h("div", { style: "display:flex; align-items:center; gap:8px;" }, [
            h("span", { style: "width:80px; white-space:nowrap;" }, "代开地址"),
            h(ElInput, {
              modelValue: openAddress.value,
              placeholder: "请输入用户地址",
              style: "flex:1;",
              onInput: (val: string) => (openAddress.value = val)
            })
          ]),
          // === 类型 ===
          h("div", { style: "display:flex; align-items:center; gap:8px;" }, [
            h("span", { style: "width:80px;" }, "类型"),
            h(
              ElSelect,
              {
                modelValue: nftType.value,
                style: "flex:1;",
                onChange: (val: number) => (nftType.value = val)
              },
              () =>
                nodeTypeOptions.map((item: any) =>
                  h(ElOption, {
                    label: item.label,
                    value: item.value,
                    key: item.value
                  })
                )
            )
          ]),
          // === 节点来源 ===
          h("div", { style: "display:flex; align-items:center; gap:8px;" }, [
            h("span", { style: "width:80px;" }, "节点来源"),
            h(
              ElSelect,
              {
                modelValue: sourceType.value,
                style: "flex:1;",
                onChange: (val: number) => (sourceType.value = val)
              },
              () =>
                payNftTypeOptions.map((item: any) =>
                  h(ElOption, {
                    label: item.label,
                    value: item.value,
                    key: item.value
                  })
                )
            )
          ])
        ]
      ),

    showCancelButton: true,

    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        if (!openAddress.value) {
          message.warning("请输入代开地址");
          return;
        }

        try {
          instance.confirmButtonLoading = true;

          const res = await callContractMethod(
            contractAddress.GaussNFTContract,
            nftABI,
            "adminMint",
            [openAddress.value, nftType.value, sourceType.value],
            true
          );

          if (res) {
            message.success("操作成功");
            await _loadData();
            done();
          } else {
            message.warning(res?.msg || "操作失败");
          }
        } catch (err: any) {
          message.error(err?.message || "请求出错");
        } finally {
          instance.confirmButtonLoading = false;
        }
      } else {
        done();
      }
    }
  });
};
//导出报表
const deriveXlsx = async () => {
  const query = getQueryParams();
  const res = await $Api.exportXlsx(query);
  if (res.success) {
    saveExcelFile(res.data, "NFT购买列表");
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
      @page-size-change="handleChangePageSize"
    >
      <template #nodeTypeScope="scope">
        <span>{{ nodeTypeMapConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #payTypeScope="scope">
        <span>{{ payTypeConvert(scope.row[scope.column.property]) }}</span>
      </template>
      <template #amoutScope="scope">
        <span>{{ fromWei(scope.row[scope.column.property]) }}</span>
      </template>
    </pure-table>
  </el-card>
</template>
