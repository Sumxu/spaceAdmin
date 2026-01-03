<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import Upload from "@/components/upload/index.vue";
import EditorBase from "@/components/EditorBase/index.vue";
import { classifyMap } from "@/constants/constants";

// props 类型
interface GoodsInfoProps {
    visible: boolean;
    initialData?: {
        id?: number;
        name?: string;
        pic?: string[];
        merchantAddress?: string;
        merchantName?: string;
        isHome?: boolean;
        classify?: string | number;
        sort?: string | number
    };
    merChatList: Array<{ address: string; merchantName: string }>;
}

// props
const props = defineProps<GoodsInfoProps>();

// emit
const emit = defineEmits<{
    (e: "update:visible", value: boolean): void;
    (e: "submit", data: any): void;
}>();

// 弹窗内部可控的显示状态
const innerVisible = ref(props.visible);

// 同步父组件 visible
watch(
    () => props.visible,
    (val) => {
        innerVisible.value = val;
    }
);

// 当内部状态变化时通知父组件
watch(innerVisible, (val) => {
    emit("update:visible", val);
});

// 表单数据
const formData = reactive({
    id: undefined as number | undefined,
    name: "",
    pic: [] as string[],
    merchantAddress: "",
    merchantName: "",
    isHome: false,
    classify: 0,
    sort: 0,
    details: ""
});

// watch 初始数据变化（编辑或新增）
watch(
    () => props.initialData,
    (newData) => {
        if (newData) {
            Object.assign(formData, {
                ...newData,
                details: newData.details || "",
                pic: newData.pic ? newData.pic.split(",") : []
            });
        } else {
            formData.id = undefined;
            formData.name = "";
            formData.pic = [];
            formData.merchantAddress = "";
            formData.merchantName = "";
            formData.isHome = false;
            formData.classify = 0;
            formData.details = "";
            formData.sort = "";
        }
    },
    { immediate: true }
);

// 关闭弹窗前确认
const handleBeforeClose = (done: () => void) => {
    ElMessageBox.confirm("确定要关闭吗？未保存的数据将丢失")
        .then(() => done())
        .catch(() => { });
};
const merchantChange=(val)=>{
    console.log('val=merchantChange==',val)
   const filterArray=props.merChatList.filter((item)=>item.address==val)
   if(filterArray.length>0){
    formData.merchantAddress=filterArray[0].address
    formData.merchantName=filterArray[0].merchantName
   }
}
// 取消按钮
const handleCancel = () => {
    handleBeforeClose(() => {
        innerVisible.value = false;
    });
};

// 提交表单
const handleSubmit = () => {
    const fieldLabels: Record<string, string> = {
        name: "商品名称",
        merchantAddress: "商户地址",
        merchantName: "商户名称",
        isHome: "是否首页",
        classify: "分类",
        pic: "封面图片",
        details: "富文本内容",
        sort: '序号'
    };

    // 校验必填字段
    for (const key in fieldLabels) {
        const value = formData[key as keyof typeof formData];
        if (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0) ||
            (key === "classify" && Number(value) === 0)
        ) {
            ElMessage.warning(`请填写${fieldLabels[key]}`);
            return;
        }
    }
    if (formData.details === '<p><br></p>') {
        ElMessage.warning(`请填写富文本内容`);
        return;
    }

    const dataToSubmit = {
        ...formData,
        pic: Array.isArray(formData.pic) ? formData.pic.join(",") : formData.pic
    };

    emit("submit", dataToSubmit);
    innerVisible.value = false;
};
</script>

<template>
    <el-dialog v-model="innerVisible" style="height: 700px;overflow-y: scroll;" title="商品信息" width="800px"
        :before-close="handleBeforeClose">
        <el-form label-width="100px">

            <el-form-item label="名称">
                <el-input v-model="formData.name" placeholder="请输入商品名称" />
            </el-form-item>

            <!-- 商户地址：可选择已有地址，也可输入 -->
            <el-form-item label="商户地址">
                <el-select v-model="formData.merchantAddress" placeholder="请选择商户地址" style="width: 300px" filterable
                    allow-create clearable
                    @change="merchantChange"
                    >

                    <!-- 自定义显示：商户名称: 地址 -->
                    <template #label="{ label, value }">
                        <span>{{ label }}: </span>
                        <span style="font-weight: bold">{{ value }}</span>
                    </template>

                    <el-option v-for="item in props.merChatList" :key="item.merchantName" :label="item.merchantName"
                        :value="item.address" />
                </el-select>
            </el-form-item>

            <el-form-item label="商品排序">
                <el-input v-model="formData.sort" placeholder="请输入序号" />
            </el-form-item>

            <el-form-item label="是否首页">
                <el-select v-model="formData.isHome" placeholder="请选择">
                    <el-option label="是" :value="true" />
                    <el-option label="否" :value="false" />
                </el-select>
            </el-form-item>

            <el-form-item label="分类">
                <el-select v-model="formData.classify" placeholder="请选择分类">
                    <el-option v-for="(label, key) in classifyMap" :key="key" :label="label" :value="Number(key)" />
                </el-select>
            </el-form-item>

            <el-form-item label="封面图片">
                <Upload v-model="formData.pic" :limit="3" :multiple="true" accept="image" type="image" label="上传封面"
                    :show-list="true" />
            </el-form-item>

            <el-form-item label="富文本">
                <EditorBase v-model="formData.details" />
            </el-form-item>

        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
            </div>
        </template>
    </el-dialog>
</template>
