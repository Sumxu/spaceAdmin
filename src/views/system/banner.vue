<script setup lang="ts">
import TableButtons from "@/components/opts/btns2.vue";
import BannerEdit from "./modules/banner-edit.vue";
import { PureTable } from "@pureadmin/table";
import { reactive, ref, onMounted } from "vue";
import * as $bannerApi from "@/api/sys/banner";
import message from "@/utils/message";
import { hasAuth } from "@/router/utils";

const bannerEditRef = ref();
const pageData: any = reactive({
  permission: {
    query: ["sys:banner:list"],
    save: ["sys:banner:save"],
    update: ["sys:banner:update"],
    del: ["sys:banner:del"]
  },
  searchParam: {
    searchState: true,
    searchForm: {},
    formFields: []
  },
  btnOpts: {
    size: "small",
    left: [
      {
        key: "add",
        label: "新增",
        type: "primary",
        icon: "ep:plus",
        state: true,
        permission: ["sys:banner:save"]
      }
    ],
    right: [
      {
        key: "search",
        label: "查询",
        icon: "ep:search",
        state: true,
        options: { circle: true }
      },
      {
        key: "refresh",
        label: "刷新",
        icon: "ep:refresh",
        state: true,
        options: { circle: true }
      }
    ]
  },
  tableParam: {
    list: [],
    loading: false,
    columns: [
      { label: "横幅名称", prop: "bannerName" },
      { label: "图片", prop: "bannerUrl", slot: "bannerUrlSlot" }, // 修改这里
      { label: "横幅位置", prop: "bannerSite", slot: "siteSlot" },
      // { label: "跳转类型", prop: "jumpType" },
      // { label: "跳转行为", prop: "jumpValue" },
      { label: "描述", prop: "describe" },
      { label: "状态", prop: "status", slot: "statusSlot" },
      { label: "排序", prop: "sort" },
      { label: "操作", fixed: "right", slot: "operation" }
    ]
  },
  dataSource: {
    bannerSiteOptions: [
      { label: "Swap", value: 1 },
      { label: "Defi", value: 2 }
    ]
  }
});

const handleBtnClick = (key: string) => {
  switch (key) {
    case "add":
      bannerEditRef.value?.open({ status: 0 }, pageData.dataSource, "add");
      break;
    case "refresh":
      _loadData();
      break;
  }
};

const _loadData = async () => {
  pageData.tableParam.loading = true;
  try {
    const res: any = await $bannerApi.queryList(
      pageData.searchParam.searchForm
    );
    if (res.code === 200) {
      pageData.tableParam.list = res.data;
    }
  } finally {
    pageData.tableParam.loading = false;
  }
};

const handleEdit = (row: any) => {
  bannerEditRef.value?.open(row, pageData.dataSource, "edit");
};

const handleDel = (row: any) => {
  message.confirm("是否删除该横幅？").then(() => {
    _batchDel([row.id]);
  });
};

const _batchDel = async (ids: string[]) => {
  pageData.tableParam.loading = true;
  try {
    const res: any = await $bannerApi.delByIds(ids);
    if (res.code === 200) {
      message.success("删除成功");
      _loadData();
    }
  } finally {
    pageData.tableParam.loading = false;
  }
};

onMounted(() => {
  _loadData();
});
defineOptions({ name: "BannerList" });
</script>

<template>
  <el-card :shadow="'never'">
    <table-buttons
      :size="pageData.btnOpts.size"
      :left-btns="pageData.btnOpts.left"
      :right-btns="pageData.btnOpts.right"
      @click="handleBtnClick"
    />
    <pure-table
      :columns="pageData.tableParam.columns"
      :data="pageData.tableParam.list"
      :border="true"
      :stripe="true"
      :loading="pageData.tableParam.loading"
    >
      <template #statusSlot="{ row }">
        <el-tag v-if="row.status === 0" type="success">正常</el-tag>
        <el-tag v-else type="danger">禁用</el-tag>
      </template>
      <template #siteSlot="{ row }">
        <el-tag v-if="row.bannerSite === 1">Swap</el-tag>
        <el-tag v-else type="info">Defi</el-tag>
      </template>

      <template #bannerUrlSlot="{ row }">
        <el-image
          :src="row.bannerUrl"
          :preview-src-list="[row.bannerUrl]"
          style="width: 100px; height: 50px; object-fit: cover"
        />
      </template>
      <template #operation="{ row }">
        <el-link
          v-show="hasAuth(pageData.permission.update)"
          type="primary"
          @click="handleEdit(row)"
          >编辑</el-link
        >
        <el-divider
          v-show="hasAuth(pageData.permission.del)"
          direction="vertical"
        />
        <el-link
          v-show="hasAuth(pageData.permission.del)"
          type="danger"
          @click="handleDel(row)"
          >删除</el-link
        >
      </template>
    </pure-table>

    <banner-edit ref="bannerEditRef" @confirm="_loadData" />
  </el-card>
</template>
