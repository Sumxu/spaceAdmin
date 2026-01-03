<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { shallowRef, ref, watch, onBeforeUnmount } from "vue";
const baseURL = window.location.origin;
defineOptions({ name: "BaseEditor" });

// v-model 支持
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 编辑器实例
const editorRef = shallowRef();

// 内部 HTML 内容
const valueHtml = ref("");

// toolbar 和 editor 配置
const mode = "default";
const toolbarConfig = { excludeKeys: "fullScreen" };
const editorConfig = {
  placeholder: "请输入内容...", MENU_CONF: {}
};
editorConfig.MENU_CONF["uploadImage"] = {
  // 服务端上传地址，根据实际业务改写
  server: `https://dd.clkapp.cc/file/upload`,
  // form-data 的 fieldName，根据实际业务改写
  fieldName: "file",
  // 选择文件时的类型限制，根据实际业务改写                                          
  allowedFileTypes: ["image/png", "image/jpg", "image/jpeg"],
  // 自定义插入图片
  customInsert(res: any, insertFn) {
    // res.data.url是后端返回的图片地址，根据实际业务改写
    if (res.data) {
      setTimeout(() => {
        // insertFn插入图片进编辑器
        insertFn(res.data);
      }, 2000);
    }
  }
};
// DOM 创建时，把初始内容写入
const handleCreated = (editor: any) => {
  editorRef.value = editor;
  editor.setHtml(props.modelValue || "");
};

// 处理内容变化（编辑器输入）
const handleChange = (editor: any) => {
  const html = editor.getHtml();
  valueHtml.value = html;
  emit("update:modelValue", html);
};

// 监听父组件传入值
watch(
  () => props.modelValue,
  (val) => {
    if (!editorRef.value) {
      // 编辑器未初始化，先存起来
      valueHtml.value = val || "";
      return;
    }
    const currentHtml = editorRef.value.getHtml();
    if (val !== currentHtml) {
      editorRef.value.setHtml(val || "");
      valueHtml.value = val || "";
    }
  },
  { immediate: true }
);

// 组件销毁
onBeforeUnmount(() => {
  editorRef.value?.destroy();
});
</script>

<template>
  <div class="wangeditor">
    <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" style="border-bottom: 1px solid #ccc" />

    <Editor v-model="valueHtml" :defaultConfig="editorConfig" :mode="mode" style="height: 500px; overflow-y: auto"
      @onCreated="handleCreated" @onChange="handleChange" />
  </div>
</template>
