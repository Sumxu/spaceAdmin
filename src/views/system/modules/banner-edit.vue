<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import * as $bannerApi from "@/api/sys/banner";
import message from "@/utils/message";
import Upload from "@/components/upload/index.vue";

const formRef = ref();
const pageData: any = reactive({
  mode: "add",
  modalParam: {
    visible: false,
    title: "新增轮播图",
    closeOnclickModal: false
  },
  formParam: {
    infoForm: {},
    fields: [
      {
        type: "input",
        label: "横幅名称",
        prop: "bannerName",
        placeholder: "请输入横幅名称",
        max: 50,
        options: { clearable: true }
      },
      {
        type: "image",
        label: "图片",
        prop: "bannerUrl",
        placeholder: "上传轮播图片",
        options: { clearable: true }
      },
      {
        type: "select",
        label: "横幅位置",
        prop: "bannerSite",
        placeholder: "请选择横幅位置",
        dataSourceKey: "bannerSiteOptions",
        options: {
          clearable: true,
          filterable: true,
          keys: { prop: "value", value: "value", label: "label" }
        }
      },
      {
        type: "textarea",
        label: "描述",
        prop: "describe",
        placeholder: "请输入描述",
        max: 600,
        options: { clearable: true }
      },
      {
        type: "switch",
        label: "状态",
        prop: "status"
      },
      {
        type: "input",
        label: "排序",
        prop: "sort",
        placeholder: "请输入排序数字",
        max: 5,
        options: { clearable: true }
      }
    ],
    rules: {
      bannerName: [
        { required: true, message: "请输入横幅名称", trigger: "blur" }
      ],
      bannerUrl: [
        { required: true, message: "请上传轮播图片", trigger: "blur" }
      ],
      bannerSite: [
        { required: true, message: "请选择横幅位置", trigger: "change" }
      ],
      describe: [{ required: true, message: "请输入描述", trigger: "change" }],
      sort: [{ required: true, message: "请输入排序", trigger: "change" }],
      status: [{ required: true, message: "请选择状态", trigger: "change" }]
    },
    loading: false
  },
  dataSource: {}
});

const showBtn = computed(() => pageData.mode !== "detail");

const initData = () => {
  pageData.modalParam.visible = false;
  pageData.modalParam.title = "新增轮播图";
  pageData.modalParam.closeOnclickModal = true;
  pageData.formParam.infoForm = {};
};

const _handleClose = () => {
  initData();
  emits("close");
};

const open = (data: any, dataSource: any, mode: string) => {
  pageData.mode = mode;
  pageData.dataSource = dataSource;

  pageData.formParam.infoForm = { ...data };
  pageData.modalParam.title =
    mode === "add"
      ? "新增轮播图"
      : mode === "edit"
        ? "编辑轮播图"
        : "轮播图详情";
  pageData.modalParam.visible = true;
};

const handleConfirm = () => {
  formRef.value!.validate((isValid: boolean) => {
    if (isValid) {
      if (pageData.mode === "add") save();
      else update();
    }
  });
};

const save = () => {
  pageData.formParam.loading = true;
  const data = pageData.formParam.infoForm;
  $bannerApi
    .save(data)
    .then((res: any) => {
      if (res.code === 200) {
        message.success("新增成功");
        initData();
        emits("confirm");
      } else {
        message.warning(res.message);
      }
    })
    .finally(() => (pageData.formParam.loading = false));
};

const update = () => {
  pageData.formParam.loading = true;
  const data = pageData.formParam.infoForm;
  $bannerApi
    .update(data.id, data)
    .then((res: any) => {
      if (res.code === 200) {
        message.success("修改成功");
        initData();
        emits("confirm");
      } else {
        message.warning(res.message);
      }
    })
    .finally(() => (pageData.formParam.loading = false));
};

const emits = defineEmits(["close", "confirm"]);
defineOptions({ name: "BannerEdit" });

defineExpose({ open });
</script>

<template>
  <el-dialog
    v-model="pageData.modalParam.visible"
    :title="pageData.modalParam.title"
    destroy-on-close
    modal
    :close-on-click-modal="pageData.modalParam.closeOnclickModal"
    :before-close="_handleClose"
    width="500"
  >
    <template #header>
      <span style="font-weight: 700">{{ pageData.modalParam.title }}</span>
    </template>

    <el-form
      ref="formRef"
      v-loading="pageData.formParam.loading"
      :model="pageData.formParam.infoForm"
      :rules="pageData.formParam.rules"
      label-position="right"
    >
      <el-form-item
        v-for="(item, index) in pageData.formParam.fields"
        :key="index"
        :prop="item.prop"
        :label="item.label"
      >
        <template v-if="item.type === 'input'">
          <el-input
            v-model="pageData.formParam.infoForm[item.prop]"
            :clearable="item.options?.clearable ?? true"
            :max="item.max ?? 255"
          />
        </template>

        <template v-else-if="item.type === 'textarea'">
          <el-input
            v-model="pageData.formParam.infoForm[item.prop]"
            :clearable="item.options?.clearable ?? true"
            :max="item.max ?? 600"
            type="textarea"
          />
        </template>

        <template v-else-if="item.type === 'switch'">
          <el-switch
            v-model="pageData.formParam.infoForm[item.prop]"
            :active-value="0"
            :inactive-value="1"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
          />
        </template>

        <template v-else-if="item.type === 'select'">
          <el-select
            v-model="pageData.formParam.infoForm[item.prop]"
            :filterable="item.options?.filterable ?? true"
            :clearable="item.options?.clearable ?? true"
            :placeholder="item.placeholder"
            style="width: 100%"
          >
            <el-option
              v-for="su in pageData.dataSource[item.dataSourceKey]"
              :key="su[item.options?.keys?.prop ?? 'value']"
              :label="su[item.options?.keys?.label ?? 'label']"
              :value="su[item.options?.keys?.value ?? 'value']"
            />
          </el-select>
        </template>

        <template v-else-if="item.type === 'image'">
          <Upload
            v-model="pageData.formParam.infoForm[item.prop]"
            :limit="1"
            accept="image"
            type="image"
            label="上传封面"
            :show-list="true"
          />
        </template>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button plain @click="_handleClose">取消</el-button>
      <el-button
        v-show="showBtn"
        v-loading="pageData.formParam.loading"
        type="primary"
        plain
        @click="handleConfirm"
      >
        提交
      </el-button>
    </template>
  </el-dialog>
</template>
