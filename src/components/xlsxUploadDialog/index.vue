<template>
    <el-dialog v-model="dialogVisible" title="导入发货" width="30%">
        <el-form ref="formRef" :model="validateForm" label-width="82px">
            <el-form-item label="附件" prop="fileList" :rules="[{ required: true, message: '附件不能为空' }]">
                <el-upload ref="uploadRef" v-model:file-list="validateForm.fileList" drag multiple
                    :http-request="handleUpload" action="" :auto-upload="false">
                    <div class="el-upload__text">
                        <UploadIcon class="m-auto mb-2" />
                        可点击或拖拽上传
                    </div>
                </el-upload>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="resetForm(formRef)">取消</el-button>
            <el-button type="primary" @click="submitForm(formRef)" :loading="submitLoading">确认</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import UploadIcon from "~icons/ri/upload-2-line?width=26&height=26";
import { ElMessage } from "element-plus";
import { http } from "@/utils/http";
const submitLoading = ref(false);
const dialogVisible = ref(false);
const formRef = ref();
const uploadRef = ref();
const emit = defineEmits(["change"]);
const handleChange = () => {
    emit("change");
};
const validateForm = reactive({
    fileList: []
});

const openDialog = () => {
    dialogVisible.value = true;
};

const closeDialog = () => {
    dialogVisible.value = false;
};

const submitForm = async (formEl) => {
    if (!formEl) return;
    formEl.validate(async (valid) => {
        if (!valid) return false;
        submitLoading.value = true;
        try {
            // ===== 在这里执行你的上传逻辑 =====
            const res = await uploadRef.value.submit(); // 你自己的上传逻辑
        } catch (e) {
            // 失败不关闭，只关闭 loading（ 不提示）
            submitLoading.value = false;
        }
    });
};

// el-upload 手动上传的 http 请求
const handleUpload = async ({ file }) => {
    console.log("file----", file)
    try {
        const res = await http.post(
            "/member/order/importSend",
            { data: { file: file } },
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        submitLoading.value = false;
        if (res?.success) {
            ElMessage.success("上传成功");

            closeDialog();
            resetForm(formRef.value);
        } else {

            ElMessage.error(res?.msg || "上传失败");
            // ❗失败不关闭，不 reset
            return Promise.reject(res);
        }
    } catch (err) {
        ElMessage.error(
            err?.msg || err?.message || "上传失败"
        );
        // ❗失败不关闭，不 reset
        return Promise.reject(err);
    }
};

const resetForm = (formEl) => {
    if (formEl) formEl.resetFields();
    validateForm.fileList = [];
    handleChange()
    closeDialog();
};

defineExpose({
    openDialog,
});
</script>
