<script setup lang="ts">
import { reactive, ref, computed, shallowRef, onBeforeUnmount } from "vue";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import * as $noticeApi from "@/api/sys/notice";
import message from "@/utils/message";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

const formRef = ref();

const pageData: any = reactive({
  mode: "add",
  modalParam: {
    visible: false,
    title: ""
  },
  formParam: {
    formFields: [
      {
        type: "input",
        label: "标题",
        prop: "title",
        placeholder: "请输入标题"
      },
      {
        type: "text",
        label: "内容",
        prop: "content"
      },
      {
        type: "switch",
        label: "状态",
        prop: "status"
      }
    ],
    infoForm: {},
    rules: {
      title: [{ required: true, message: "请输入标题", trigger: "blur" }],
      status: [{ required: true, message: "请选择状态", trigger: "blur" }]
    },
    loading: false
  }
});
const disabledFields = computed(() => (item: any) => {
  if (pageData.mode === "add") {
    return false;
  }
  if (pageData.mode === "detail") {
    return true;
  }
});

const open = (id: any, title: string, model: any) => {
  pageData.modalParam.title = title;
  pageData.mode = model;
  if (model === "update") {
    //获取详情
    getDetail(id);
  }
  pageData.modalParam.visible = true;
};

const _handleClose = () => {
  formRef.value!.resetFields();
  pageData.modalParam.visible = false;
};

const handleConfirm = () => {
  formRef.value!.validate((isValid: boolean) => {
    if (isValid) {
      if (pageData.mode === "add") {
        save();
      } else {
        update();
      }
    }
  });
};

const getDetail = (id: any) => {
  $noticeApi.queryInfo({ id: id }).then((res: any) => {
    if (res.code === 200) {
      pageData.formParam.infoForm = res.data;
    } else {
      message.error(res.message);
    }
  });
};
const save = () => {
  pageData.formParam.loading = true;
  const params = pageData.formParam.infoForm;
  $noticeApi
    .save(params)
    .then((res: any) => {
      if (res.code === 200) {
        _handleClose();
        emits("ok");
        message.success("保存成功");
      } else {
        message.error(res.message);
      }
    })
    .finally(() => {
      pageData.formParam.loading = false;
    });
};
const update = () => {
  pageData.formParam.loading = true;
  const params = pageData.formParam.infoForm;
  $noticeApi
    .update(params)
    .then((res: any) => {
      if (res.code === 200) {
        _handleClose();
        emits("ok");
        message.success("保存成功");
      } else {
        message.error(res.message);
      }
    })
    .finally(() => {
      pageData.formParam.loading = false;
    });
};
const emits = defineEmits(["close", "confirm", "ok"]);

const editorRef = shallowRef();

const toolbarConfig: any = { excludeKeys: "fullScreen" };
const handleCreated = editor => {
  // 记录 editor 实例，重要！
  editorRef.value = editor;
};

const editorConfig = { placeholder: "请输入内容..." };

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
defineExpose({ open });
</script>

<template>
  <div>
    <el-dialog
      append-to-body
      width="800px"
      v-model="pageData.modalParam.visible"
      :title="pageData.modalParam.title"
      :before-close="_handleClose"
    >
      <template #header>
        <span style="font-weight: 700">{{ pageData.modalParam.title }}</span>
      </template>
      <el-form
        :model="pageData.formParam.infoForm"
        :rules="pageData.formParam.rules"
        label-position="left"
        ref="formRef"
        v-loading="pageData.formParam.loading"
      >
        <el-form-item
          v-for="(item, index) in pageData.formParam.formFields"
          :label="item.label"
          :prop="item.prop"
          :key="index"
          class="form-row"
        >
          <template v-if="item.type === 'input'">
            <el-input
              v-model="pageData.formParam.infoForm[item.prop]"
              clearable
              :type="item.options?.type ?? 'text'"
              :disabled="disabledFields(item)"
            />
          </template>

          <template v-if="item.type === 'text'">
            <Toolbar
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
              style="width: 100%"
            />
            <Editor
              v-model="pageData.formParam.infoForm[item.prop]"
              mode="default"
              :defaultConfig="editorConfig"
              style="height: 500px; width: 100%"
              @onCreated="handleCreated"
            />
          </template>

          <template v-if="item.type === 'switch'">
            <el-switch
              v-model="pageData.formParam.infoForm[item.prop]"
              class="ml-2"
              style="
                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              :active-value="1"
              :inactive-value="0"
            />
          </template>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="_handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          v-loading="pageData.formParam.loading"
          >提 交</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
