<template>
    <el-dialog :model-value="visible" title="规格编辑" width="500px" :before-close="handleBeforeClose"
        @close="handleCancel">
        <el-form :model="formData" label-width="120px">
            <!-- 名称 -->
            <el-form-item label="名称" required>
                <el-input v-model="formData.name" placeholder="请输入规格名称" />
            </el-form-item>

            <!-- 图片 -->
            <el-form-item label="图片" required>
                <Upload v-model="uploadValue" :limit="1" :multiple="false" accept="image" type="image"
                    :show-list="true" />
            </el-form-item>

            <!-- 价格 -->
            <el-form-item label="价格" required>
                <el-input-number v-model="formData.price" :min="0" style="width: 100%" />
            </el-form-item>

            <!-- 积分 -->
            <el-form-item label="积分" required>
                <el-input-number v-model="formData.integral" :min="0" disabled style="width: 100%" />
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import Upload from "@/components/upload/index.vue";

export interface Spec {
    id?: number;
    name: string;
    pic: string;
    price: number;
    integral: number;
}

interface Props {
    visible: boolean;
    initialData?: Spec;
    classifyId: number | string
}

const props = defineProps<Props>();
const emit = defineEmits<{
    (e: "update:visible", value: boolean): void;
    (e: "submit", data: Spec): void;
}>();

const formData = reactive<Spec>({
    id: undefined,
    name: "",
    pic: "",
    price: 0,
    integral: 0,
});

// 中间变量绑定 Upload
const uploadValue = ref<string[]>([]);
const classifyIdList = [
    { id: 1, name: "安品区", subsidy: 1 },
    { id: 2, name: "优品区", subsidy: 2 },
    { id: 3, name: "臻品区", subsidy: 4 },
    { id: 4, name: "兑换区", subsidy: 0 },
]
// 监听 uploadValue 变化，把第一个值赋给 formData.pic
watch(uploadValue, (val) => {
    formData.pic = val || "";
});

// 打开弹窗时初始化表单
watch(
    () => props.visible,
    (val) => {
        if (val) resetForm();
    },
    { immediate: true }
);
// 监听价格变化，根据 classifyId 计算积分
watch(
    () => formData.price,
    (newPrice) => {
        const classify = classifyIdList.find(c => c.id == props.classifyId);
        if (classify) {
            formData.integral = newPrice * classify.subsidy; // 可根据实际计算规则修改
        } else {
            formData.integral = 0;
        }
    }
);
const resetForm = () => {
    if (props.initialData && props.initialData.id !== undefined) {
        formData.id = props.initialData.id;
        formData.name = props.initialData.name || "";
        formData.pic = props.initialData.pic || "";
        formData.price = props.initialData.price || 0;
        // 初始化积分
        const classify = classifyIdList.find(c => c.id == props.classifyId);
        formData.integral = classify ?formData.price * classify.subsidy : 0;
        uploadValue.value = formData.pic;
    } else {
        formData.id = undefined;
        formData.name = "";
        formData.pic = "";
        formData.price = 0;
        const classify = classifyIdList.find(c => c.id == props.classifyId);
        formData.integral = classify ?formData.price * classify.subsidy : 0;
        uploadValue.value = [];
    }
};

// 关闭确认
const handleBeforeClose = (done: () => void) => {
    ElMessageBox.confirm("确定要关闭吗？未保存的数据将丢失")
        .then(() => done())
        .catch(() => { });
};

const handleCancel = () => {
    resetForm();
    emit("update:visible", false);
};

const handleSubmit = () => {
    if (!formData.name || !formData.pic || formData.price === undefined || formData.integral === undefined) {
        ElMessage.warning("请填写完整的规格信息");
        return;
    }
    if (formData.price == 0) {
        ElMessage.warning("请填写完整的规格信息");
        return;
    }
    emit("submit", { ...formData });
    emit("update:visible", false);
};
</script>
