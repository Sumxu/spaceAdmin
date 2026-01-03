<script setup lang="ts">
import { useRenderIcon } from "../ReIcon/src/hooks";

defineOptions({ name: "TableButtons" });
export type BtnOptions = {
  plain?: boolean;
  round?: boolean;
  circle?: boolean;
};
export type BtnsOptions = {
  key: string;
  label?: string;
  type?: string;
  icon?: string;
  loading?: boolean;
  state?: boolean;
  options?: BtnOptions;
  permission?: [];
};
const props = defineProps({
  size: {
    required: false,
    type: String as PropType<"" | "default" | "small" | "large">,
    default: "default"
  },
  leftBtns: {
    required: false,
    type: Object as PropType<BtnsOptions[]>,
    default: function () {
      return [];
    }
  },
  rightBtns: {
    required: false,
    type: Object as PropType<BtnsOptions[]>,
    default: function () {
      return [];
    }
  }
});
const emits = defineEmits(["click"]);
</script>

<template>
  <div class="flex items-center justify-between mb-2">
    <div class="flex items-center justify-center">
      <el-button
        v-for="(item, index) in props.leftBtns"
        :key="index"
        v-auth="item?.permission || []"
        :type="item?.type"
        :round="item.options?.round"
        :loading="item?.loading || false"
        :circle="item.options?.circle"
        :plain="item.options?.plain"
        :size="props?.size || 'small'"
        :icon="useRenderIcon(item?.icon)"
        :disabled="!item?.state || false"
        @click="emits('click', item.key, item)"
        >{{ item.label }}</el-button
      >
      <slot name="left" />
    </div>
    <div class="flex items-center justify-center">
      <el-button
        v-for="(item, index) in props.rightBtns"
        :key="index"
        v-auth="item?.permission || []"
        :type="item?.type"
        :round="item.options?.round"
        :circle="item.options?.circle"
        :plain="item.options?.plain"
        :size="props?.size || 'small'"
        :icon="useRenderIcon(item?.icon)"
        :disabled="!item?.state || false"
        @click="emits('click', item.key, item)"
      />
      <slot name="right" />
    </div>
  </div>
</template>
