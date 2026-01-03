<template>
  <el-upload
    ref="upload"
    :file-list="fileList"
    :list-type="type === 'image' ? 'picture-card' : 'text'"
    class="custom-uploader"
    :class="fileList.length === limit ? 'hide' : ''"
    action=""
    drag
    :accept="allowAccept"
    :limit="limit"
    :multiple="multiple"
    :show-file-list="showList"
    :on-exceed="handleExceed"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
    :disabled="disabled"
    :http-request="handleUpload"
    :on-preview="handlePreview"
    :before-upload="handleBeforeUpload"
  >
    <el-icon v-if="type === 'image'"><Plus /></el-icon>
    <el-button v-else v-show="type !== 'image'" type="primary">{{
      label
    }}</el-button>
  </el-upload>

  <el-dialog v-model="dialogVisible" top="50px">
    <img w-full :src="dialogImageUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script lang="ts" setup>
import {
  ref,
  watch,
  defineProps,
  defineEmits,
  computed,
  nextTick,
  reactive
} from "vue";
import { ElMessage } from "element-plus";
import type { UploadInstance, UploadFile, UploadFiles } from "element-plus";
import Sortable from "sortablejs";
import { Plus } from "@element-plus/icons-vue";
import { reverse } from "dns/promises";
import { useAuthStoreHook } from "@/store/modules/auth";
import { http } from "@/utils/http";

const ACCEPT = {
  image: "image/*",
  excel: ".xlsx,.xls,.csv",
  audio: "audio/*"
};

const emit = defineEmits(["change"]);

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: ""
  },
  accept: {
    type: String,
    default: () => "image"
  },
  limit: {
    type: Number,
    default: () => 1
  },
  multiple: {
    type: Boolean
  },
  label: {
    type: String,
    default: () => "上传文件"
  },
  showList: {
    type: Boolean,
    default: () => false
  },
  type: {
    type: String,
    default: () => "image"
  },
  originName: {
    type: Boolean,
    default: () => false
  },
  disabled: {
    type: Boolean,
    default: () => false
  },
  drag: {
    type: Boolean,
    default: () => false
  }
});
const allowAccept = computed(() => {
  return props.accept in ACCEPT ? ACCEPT[props.accept] : props.accept || "";
});
const upload = ref<UploadInstance>();
const selectFileLength = ref<number>(0);
const uploadPool = ref<string[]>([]);
interface File {
  uid: Number;
  status: String;
  name: String;
  url: String;
}
const fileList = ref<File[]>([]);

watch(
  () => props.modelValue,
  (val: string[] | String) => {
    let list = [];

    if (typeof val === "string" && val) {
      list = [val];
    } else if (Array.isArray(val) && val.length > 0) {
      list = val;
    } else {
      list = [];
    }
    const res = [...list];
    if (res.length > 0) {
      fileList.value = res.map((url: string) => {
        const uid = new Date().getTime();
        return {
          uid,
          status: "success",
          name: window.decodeURI(url.slice(url.lastIndexOf("/") + 1)),
          url: url
        };
      });
    } else {
      fileList.value = [];
    }
  },
  { immediate: true, deep: true }
);

const rowDrag = () => {
  nextTick(() => {
    const el = upload.value.$el.querySelector(".el-upload-list");
    Sortable.create(el, {
      onEnd: ({ newIndex, oldIndex }: any) => {
        fileList.value.splice(
          newIndex,
          0,
          fileList.value.splice(oldIndex, 1)[0]
        );
        const cp = [...fileList.value];
        const value = cp.map(t => t.url);
        emit("change", value);
        emit("update:modelValue", value);
      }
    });
  });
};

watch(
  () => props.drag,
  val => {
    if (val && props.limit > 1) rowDrag();
  },
  { immediate: true }
);

const handleBeforeUpload = () => {
  selectFileLength.value = selectFileLength.value + 1;
};

const handleSuccess = (response: any) => {
  let url = response.data;
  uploadPool.value.push(url);
  if (uploadPool.value.length < selectFileLength.value) return;
  const value = props.multiple
    ? [...fileList.value.map(v => v.url), ...uploadPool.value]
    : url;
  emit("change", value);
  emit("update:modelValue", value);
  upload.value.clearFiles();
  uploadPool.value = [];
  selectFileLength.value = 0;
};
const handleRemove = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  const { url } = uploadFile || {};
  let i = fileList.value.findIndex(item => item.url === url);
  if (i >= 0) {
    fileList.value.splice(i, 1);
    const value = props.multiple ? [...fileList.value.map(v => v.url)] : "";
    emit("change", value);
    emit("update:modelValue", value);
  }
};
const handleUpload = async (config: any) => {
  try {
    const { file } = config;
    return await http.post(
      "/file/upload",
      { data: { file: file } },
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
  } catch (error) {
    ElMessage.error(typeof error === "string" ? error : JSON.stringify(error));
    return false;
  }
};

const dialogImageUrl = ref<string>("");
const dialogVisible = ref<boolean>(false);
const handlePreview = (uploadFile: any) => {
  dialogImageUrl.value = uploadFile.url;
  dialogVisible.value = true;
};
const handleExceed = (file: any) => {
  ElMessage.warning("超过最大上传数量，请重新选择");
};
</script>
<style scoped>
.custom-uploader.hide .el-upload--picture-card {
  transition: 0s;
  display: none;
}
.el-dialog img {
  max-width: 100%;
}
.custom-uploader .el-upload-list__item {
  transition: none !important;
}
</style>
