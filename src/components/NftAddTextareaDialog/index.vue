<template>
    <el-dialog v-model="dialogVisible" title="地址批量添加" width="600px">
        <el-form :model="validateForm" :rules="rules" ref="formRef" label-width="140px">
            <el-form-item label="批量地址添加案例" prop="demoTxt">
                <el-tag type="danger" style="margin-top:5px">批量地址添加案例使用逗号隔开</el-tag>
                <el-input v-model="validateForm.demoTxt" :rows="4" style="margin-top:12px;width: 370px;" disabled
                    type="textarea" placeholder="请输入地址" />
            </el-form-item>

            <el-form-item label="地址" prop="privateKey" required>
                <el-input v-model="validateForm.privateKey" :rows="4" type="textarea" style="width: 370px"
                    placeholder="请输入地址" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="handleCancel()">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">保存</el-button>
        </template>
    </el-dialog>
</template>
<script setup lang="ts">
import Cookies from "js-cookie";
import * as $userApi from "@/api/member/nftManage";
import { ElMessage } from 'element-plus'
import { isAddress } from "ethers";
import { ref, reactive } from "vue";
import { ethers } from "ethers";
const submitLoading = ref(false);
const dialogVisible = ref(false);
const formRef = ref(null);
const emit = defineEmits(["change"]);
const validateForm = reactive({
    privateKey: "",
    demoTxt: '0xcd75ef45514081cc98c93aebac2dac7035fb74c3,0xcd75ef45514081cc98c93aebac2dac7035fb74c3,0xcd75ef45514081cc98c93aebac2dac7035fb74c3'
});
// ⭐ 自定义校验规则
const rules = {
    privateKey: [
        {
            validator: (_, value, callback) => {
                if (!value) return callback(new Error("地址不能为空"));
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
    submitLoading.value = true;
    const res = parseAndValidateAddresses(validateForm.privateKey);
    if (!res.ok) {
        ElMessage.error(res.message);
        submitLoading.value = false;
        return; // ❗ 直接中断提交
    }
    handleSuccess(res.addresses);
};
function parseAndValidateAddresses(input) {
    if (!input) {
        return { ok: false, message: "请输入钱包地址" };
    }
    // 统一替换各种分隔符：逗号、换行、空格
    const rawList = input
        .replace(/\s+/g, ",")         // 换行、空格 → 逗号
        .replace(/，/g, ",")           // 中文逗号
        .split(",")                    // 用逗号分割
        .map(a => a.trim())            // 去空格
        .filter(a => a.length > 0);    // 去掉空地址

    if (rawList.length === 0) {
        return { ok: false, message: "未找到有效的钱包地址" };
    }

    // 校验每一项
    for (const addr of rawList) {
        if (!isAddress(addr)) {
            return { ok: false, message: `无效的钱包地址：${addr}` };
        }
    }

    return {
        ok: true,
        addresses: rawList
    };
}
const handleSuccess = async (addressArray) => {
    const res = await $userApi.queryAdd(addressArray)
    if (res.success) {
        dialogVisible.value = false;
        validateForm.privateKey=''
        emit("change");
    }

    submitLoading.value = false;
}
const handleCancel = () => {
    if (formRef.value) {
        formRef.value.resetFields();
    }
    emit("change");
    dialogVisible.value = false;
};

defineExpose({
    openDialog
});
</script>
