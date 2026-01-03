<template>
    <el-dialog v-model="dialogVisible" title="私钥添加" width="500px">
        <el-form :model="validateForm" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="私钥地址" prop="privateKey" required>
                <el-input v-model="validateForm.privateKey" placeholder="请输入私钥" />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleCancel('')">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import Cookies from "js-cookie";
import { ref, reactive } from "vue";
import { ethers } from "ethers";
const submitLoading = ref(false);
const dialogVisible = ref(false);
const formRef = ref();
const emit = defineEmits(["change"]);

const validateForm = reactive({
    privateKey: ""
});

// ⭐ 自定义校验规则
const rules = {
    privateKey: [
        {
            validator: (_, value, callback) => {
                if (!value) return callback(new Error("私钥不能为空"));

                try {
                    new ethers.Wallet(value.trim()); // 自动校验
                    callback();
                } catch (err) {
                    callback(new Error("请输入正确的私钥"));
                }
            },
            trigger: "blur"
        }
    ]
};

const openDialog = () => {
    dialogVisible.value = true;
};
const closeDialog = () => {
    dialogVisible.value = false;
};
const handleSubmit = () => {
    if (!formRef.value) return;
    formRef.value.validate((valid: boolean) => {
        if (!valid) return;
        submitLoading.value = true;
        const wallet = new ethers.Wallet(validateForm.privateKey);
        Cookies.set('privateKey', validateForm.privateKey)
        Cookies.set('privateKeyAddress', wallet.address)
        submitLoading.value = false;
        handleCancel(wallet.address);
    });
};

const handleCancel = (walletAddress='') => {
    console.log("walletAddress==",walletAddress)
    if (formRef.value) {
        formRef.value.resetFields();
    }
    if (walletAddress == '') {
        emit("change", '');
    } else {
        emit("change", walletAddress);

    }
    dialogVisible.value = false;
};

defineExpose({
    openDialog
});
</script>
