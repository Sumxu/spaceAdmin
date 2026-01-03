<script setup lang="ts">
import { reactive, ref, onMounted, h } from "vue";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import message from "@/utils/message";
import Cookies from "js-cookie";
import { getBalance, toWei } from "@/utils/wallet";
import { computeAddress, toBigInt } from "ethers";
import { useNFTMulticall } from "@/utils/useNFTMulticall";
import { ElMessageBox, ElSelect, ElOption, ElInput } from "element-plus";
import {
  formatAddress,
  formatDate,
  fromWei,
  callContractMethod
} from "@/utils/wallet";
import privateKeyDialog from "@/components/PrivateKeyDialog/index.vue";
import NftAddTextareaDialog from "@/components/NftAddTextareaDialog/index.vue";
import {
  levelOptions,
  userLevelOptions,
  userTypeMap
} from "@/constants/constants";
import {
  userlevelConvert,
  levelConvert,
  userTypeConvert
} from "@/constants/convert";
import { contractAddress } from "@/config/contract";
import nftABI from "@/abi/nftABI.ts";
const privateKeyDialogRef = ref(null);
const nftAddTextareaDialogRef = ref(null);
const { fetch } = useNFTMulticall();
const pageData: any = reactive({
  searchState: true,
  searchField: [
    {
      type: "input",
      label: "NFT tokenId",
      prop: "tokenId",
      placeholder: "请输入tokenId"
    }
  ],
  searchForm: {},
  privateKey: "",
  privateKeyBnb: 0,
  dataSource: {
    levelOptions: levelOptions
  },
  permission: {
    query: ["defi:user:page"]
  },
  btnOpts: {
    size: "small",
    leftBtns: [
    ],
    rightBtns: [
      { key: "search", label: "查询", icon: "ep:search", state: true },
      { key: "refresh", label: "刷新", icon: "ep:refresh", state: true }
    ]
  },
  tableParams: {
    columns: [
      {
        label: "地址",
        prop: "address",
        width:"400px"
      },
      {
        label: "权重",
        prop: "nftWeight"
      },
      { label: "操作", fixed: "right", slot: "operation", minWidth: "240px" }
    ],
    list: [],
    oldList: [],
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
  if (data.tokenId) {
    pageData.tableParams.list = pageData.tableParams.oldList.filter((item => item.tokenId == data.tokenId))
  } else {
    pageData.tableParams.list = pageData.tableParams.oldList
  }
};

// 重置
const _resetSearchForm = (data?) => (pageData.searchForm = data);
// 获取表格数据
const _loadData = async () => {
  pageData.tableParams.loading = true;
  try {
    const nftTotal = await getNftTotal();
    if (nftTotal == 0n) return;
    //得到nft拥有对应的地址
    const nftAddressList = await getNftAddressByIndex(nftTotal);
    // console.log("nftAddressList===",nftAddressList)
    //得到nft地址拥有的权重
    const nftWeight = await getNftWeightByIndex(nftTotal);
    console.log("nftWeight===",nftWeight)
 
    await getListData(nftTotal, nftAddressList.data, nftWeight.data);
    pageData.tableParams.loading = false;
  } catch (error) {
    pageData.tableParams.loading = false;
  }
};
const getListData = (nftTotal, nftAddressList, nftWeightList) => {
  let tableList = []
  for (let i = 0; i < nftTotal.toString(); i++) {
    tableList.push({
      tokenId: i,
      address: nftAddressList[i],
      nftWeight: nftWeightList[i][0]
    });
  }
  pageData.tableParams.list = tableList
  pageData.tableParams.oldList = tableList
};
// 修改权重
const handleUpdateNftWeight = (row: any) => {
  const address = row.address
  const tokenId = row.tokenId
  const nftWeight = ref(row.nftWeight.toString());
  ElMessageBox({
    title: "权重内容",
    message: () =>
      h(
        "div",
        {
          style: "width: 300px; display: flex; flex-direction: column; gap: 16px;"
        },
        [
          // === 派送数量输入框 ===
          h(
            "div",
            { style: "display: flex; align-items: center; gap: 8px;" },
            [
              h("span", { style: "white-space: nowrap; font-weight: 500;" }, "修改权重"),
              h(ElInput, {
                modelValue: nftWeight.value,
                placeholder: "请输入数量",
                style: "flex: 1;",
                onInput: (val: any) => {
                  nftWeight.value = val;
                }
              })
            ]
          )
        ]
      ),
    showCancelButton: true,
    // ============================
    //         校验逻辑
    // ============================
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        // 2. 校验数量
        if (Number(nftWeight.value) <= 0 || isNaN(Number(nftWeight.value))) {
          message.warning("请输入正确的权重");
          return;
        }
        try {
          instance.confirmButtonLoading = true;
          // 调用合约
          const res = await callContractMethod(
            contractAddress.GaussNFTContract,
            nftABI,
            "setWeight",
            [tokenId, toWei(nftWeight.value)],
            true
          );
          if (res) {
            message.success("操作成功");
            await _loadData();
            done();
          } else {
            message.warning(res.msg || "操作失败");
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
/**
 * 批量查询对应的权重地址
 * @param nftTotal
 */
const getNftWeightByIndex = async nftTotal => {
  const calls = Array.from({ length: nftTotal.toString() }).map((_, i) => ({
    address: contractAddress.GaussNFTContract,
    abi: nftABI,
    params: [i] // 自动插入下标
  }));
  return await fetch("nftInfo", calls);
};
/**
 * 批量查询对应的nft地址
 * @param nftTotal
 */
const getNftAddressByIndex = async nftTotal => {
  const calls = Array.from({ length: nftTotal.toString() }).map((_, i) => ({
    address: contractAddress.GaussNFTContract,
    abi: nftABI,
    params: [i] // 自动插入下标
  }));
  return await fetch("ownerOf", calls);
};
//初始化得到合约nft数量
const getNftTotal = async () => {
  return await callContractMethod(
    contractAddress.GaussNFTContract,
    nftABI,
    "totalSupply",
    [],
    false
  );
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

onMounted(() => {
  _loadData();
});
</script>

<template>
  <el-card :shadow="'never'">
    <form-search :show="pageData.searchState" :form-field="pageData.searchField" :data-source="pageData.dataSource"
      @search-form="_updateSearchFormData" @search="_searchForm" @reset="_resetSearchForm" />
    <table-buttons :size="pageData.btnOpts.size" :left-btns="pageData.btnOpts.leftBtns"
      :right-btns="pageData.btnOpts.rightBtns" @click="btnClickHandle" />
    <pure-table :data="pageData.tableParams.list" :columns="pageData.tableParams.columns" row-key="address" border
      stripe :loading="pageData.tableParams.loading">
      <template #operation="{ row, $index }">
        <el-link type="primary" @click="handleUpdateNftWeight(row, $index)" style="margin:0 12px;">修改权重</el-link>
      </template>
    </pure-table>
  </el-card>
</template>
