<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { phoneRules } from "../utils/rule";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useWalletStoreHook } from "@/store/modules/wallet";
import TokenBrandedMetamask from "~icons/token-branded/metamask";
import { initRouter, getTopMenu } from "@/router/utils";
import { formatAddress } from "@/utils/wallet";

const { t } = useI18n();
const loading = ref(false);

const { connect } = useWalletStoreHook();
const router = useRouter();

const viewAddress = ref("");

const ruleForm = reactive({
  address: useWalletStoreHook().currentAddress,
  message: "Welcome Login Admin"
});
const ruleFormRef = ref<FormInstance>();

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      const signature = await (window as any).ethereum.request({
        method: "personal_sign",
        params: [ruleForm.message, ruleForm.address]
      });
      if (signature) {
        useUserStoreHook()
          .loginByWallet({
            address: ruleForm.address,
            signature: signature,
            message: ruleForm.message
          })
          .then(res => {
            if (res.success) {
              // 获取后端路由
              return initRouter().then(() => {
                router.push(getTopMenu(true).path).then(() => {
                  message(t("login.pureLoginSuccess"), { type: "success" });
                });
              });
            } else {
              message(t("login.pureLoginFail") + ":" + res.msg, {
                type: "error"
              });
            }
          })
          .finally(() => (loading.value = false));
      }
    } else {
      loading.value = false;
    }
  });
};

const onConnect = async () => {
  const addr = await connect();
  if (addr) {
    ruleForm.address = addr;
    viewAddress.value = formatAddress(addr);
  }
};

function onBack() {
  useUserStoreHook().SET_CURRENTPAGE(0);
}
</script>

<template>
  <el-form ref="ruleFormRef" :model="ruleForm" :rules="phoneRules" size="large">
    <Motion>
      <el-form-item prop="address">
        <div class="w-full flex justify-between">
          <el-input
            v-model="viewAddress"
            disabled
            placeholder="钱包地址"
            :prefix-icon="useRenderIcon(TokenBrandedMetamask)"
          />
          <el-button class="ml-2!" @click="onConnect()"> 链接钱包 </el-button>
        </div>
      </el-form-item>
    </Motion>

    <Motion :delay="150">
      <el-form-item>
        <el-button
          class="w-full"
          size="default"
          type="primary"
          :loading="loading"
          @click="onLogin(ruleFormRef)"
        >
          签名登陆
        </el-button>
      </el-form-item>
    </Motion>

    <Motion :delay="200">
      <el-form-item>
        <el-button class="w-full" size="default" @click="onBack">
          {{ t("login.pureBack") }}
        </el-button>
      </el-form-item>
    </Motion>
  </el-form>
</template>
