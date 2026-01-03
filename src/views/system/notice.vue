<script setup lang="ts">
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import * as $noticeApi from "@/api/sys/notice";
import message from "@/utils/message";
import { onMounted, ref, reactive } from "vue";
import { hasAuth } from "@/router/utils";

import Notice from "./modules/notice-edit.vue";

const noticeRef = ref();

const pageData: any = reactive({
  searchState: true,
  searchField: [],
  dataSource: {},
  permission: {
    query: ["sys:notice:page"],
    delete: ["sys:notice:delete"],
    update: ["sys:notice:update"]
  },
  /*按钮 */
  btnOpts: {
    size: "small",
    leftBtns: [
      {
        key: "add",
        label: "添加公告",
        type: "primary",
        icon: "ep:plus",
        state: true,
        permission: ["sys:notice:add"]
      }
    ],
    rightBtns: [
      {
        key: "search",
        label: "查询",
        icon: "ep:search",
        state: true,
        options: {
          circle: true
        }
      },
      {
        key: "refresh",
        label: "刷新",
        icon: "ep:refresh",
        state: true,
        options: {
          circle: true
        }
      }
    ]
  },
  // 搜索Data
  searchForm: {},
  // 表格
  tableParams: {
    /**
     * table column
     */
    columns: [
      {
        label: "标题",
        prop: "title",
        minWidth: "380px"
      },
      {
        label: "状态",
        prop: "status",
        slot: "statusScope",
        width: "100px"
      },
      {
        label: "创建时间",
        prop: "createTime",
        minWidth: "160px"
      },
      {
        label: "操作",
        fixed: "right",
        slot: "operation",
        width: "200px"
      }
    ],
    /**
     * table data
     */
    list: [],
    /*加载 */
    loading: false,
    /*数据 */
    tableData: [],
    currentData: {},
    pagination: {
      pageSize: 10,
      defaultPageSize: 10,
      currentPage: 1,
      background: true,
      total: 0
    }
  }
});

/**
 *  更新搜索表单
 * @param data .
 */
const _updateSearchFormData = (data: any) => {
  pageData.searchForm = data;
};
/**
 * 点击搜索按钮
 */
const _searchForm = (data: any) => {
  pageData.searchForm = data;
  _loadData();
};
/**
 * 重置
 */
const _resetSearchForm = (data?) => {
  pageData.searchForm = data;
};
const getQueryParams = () => {
  const sqp = {};
  const param = Object.assign(sqp, pageData.searchForm);
  param.current = pageData.tableParams.pagination.currentPage;
  param.size = pageData.tableParams.pagination.pageSize;
  return param;
};
/**
 * 查询数据
 */
const _loadData = (page?: number) => {
  pageData.tableParams.loading = true;
  const query = getQueryParams();
  if (page) {
    query.current = page;
  }
  $noticeApi
    .queryPage<any>(query)
    .then(res => {
      if (res.code === 200) {
        pageData.tableParams.list = res.data.records;
        pageData.tableParams.pagination.total = Number(res.data.total);
      } else {
        message.warning(res.message);
        pageData.tableParams.list = [];
        pageData.tableParams.pagination.total = 0;
      }
    })
    .finally(() => {
      pageData.tableParams.loading = false;
    });
};
/**
 * 按钮点击
 */
const btnClickHandle = (key, _) => {
  switch (key) {
    case "add":
      noticeRef.value!.open(null, "新增公告", "add");
      break;
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

const handleChangePageSize = (val: any) => {
  pageData.tableParams.pagination.pageSize = val;
  _loadData();
};

const handleChangeCurrentPage = (val: any) => {
  pageData.tableParams.pagination.currentPage = val;
  _loadData();
};

const handleEdit = (id: any) => {
  noticeRef.value!.open(id, "修改公告", "update");
};

const handleDelete = (id: any) => {
  message.confirm("确认删除当前数据").then(() => {
    $noticeApi.del({ id: id }).then((res: any) => {
      if (res.code === 200) {
        message.success("删除成功");
        _loadData();
      } else {
        message.warning(res.message);
      }
    });
  });
};
</script>

<template>
  <el-card :shadow="'never'">
    <template #default>
      <form-search
        :show="pageData.searchState"
        :form-field="pageData.searchField"
        :data-source="pageData.dataSource"
        @search-form="_updateSearchFormData"
        @search="_searchForm"
        @reset="_resetSearchForm"
        :query-permission="pageData.permission.query"
      />

      <table-buttons
        :size="pageData.btnOpts.size"
        :left-btns="pageData.btnOpts.leftBtns"
        :right-btns="pageData.btnOpts.rightBtns"
        @click="btnClickHandle"
      />

      <!--table-->
      <pure-table
        :data="pageData.tableParams.list"
        :columns="pageData.tableParams.columns"
        row-key="id"
        border
        stripe
        :header-row-class-name="'table-header'"
        :loading="pageData.tableParams.loading"
        :pagination="pageData.tableParams.pagination"
        @page-current-change="handleChangeCurrentPage"
        @page-size-change="handleChangePageSize"
      >
        <template #statusScope="scope">
          <el-tag v-if="scope.row.status == 0" type="info">草稿</el-tag>
          <el-tag v-else type="success">发布</el-tag>
        </template>

        <template #operation="{ row }">
          <el-link
            v-show="hasAuth(pageData.permission.update)"
            type="primary"
            @click="handleEdit(row.id)"
            >修改</el-link
          >
          <el-divider
            v-show="hasAuth(pageData.permission.delete)"
            direction="vertical"
          />
          <el-link
            v-show="hasAuth(pageData.permission.delete)"
            type="warning"
            @click="handleDelete(row.id)"
            >删除</el-link
          >
        </template>
      </pure-table>

      <Notice ref="noticeRef" @ok="_loadData(1)" />
    </template>
  </el-card>
</template>

<style scoped>
.collection {
  margin-right: 10px;
}
.collection :hover {
  cursor: pointer;
}
</style>
