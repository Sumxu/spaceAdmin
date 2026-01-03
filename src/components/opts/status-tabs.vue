<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  modelValue: string | number; // 当前激活的tab
  tabs: Array<{ label: string; value: string | number }>; // tab配置
}>();

const emit = defineEmits(["update:modelValue", "change"]);

const handleChange = (val: string | number) => {
  emit("update:modelValue", val);
  emit("change", val);
};
</script>

<template>
  <el-tabs
    :model-value="props.modelValue"
    style="margin-top: 20px"
    @tab-change="handleChange"
  >
    <el-tab-pane
      v-for="tab in props.tabs"
      :key="tab.value"
      :label="tab.label"
      :name="tab.value"
    />
  </el-tabs>
</template>
