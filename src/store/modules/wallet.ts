import { defineStore } from "pinia";
import { storageLocal } from "../utils";
import { message } from "@/utils/message";
import { ethers } from "ethers";

const walletKey = "pure-wallet";

export interface WalletState {
  addressList: string[];
  currentAddress: string;
  isConnected: boolean;
}

export const useWalletStore = defineStore("pure-wallet", {
  state: (): WalletState => ({
    addressList:
      storageLocal().getItem<WalletState>(walletKey)?.addressList ?? [],
    currentAddress:
      storageLocal().getItem<WalletState>(walletKey)?.currentAddress ?? "",
    isConnected:
      storageLocal().getItem<WalletState>(walletKey)?.isConnected ?? false
  }),

  actions: {
    /** 持久化 */
    _persist() {
      storageLocal().setItem(walletKey, {
        addressList: this.addressList,
        currentAddress: this.currentAddress,
        isConnected: this.isConnected
        // provider 和 signer 不存
      });
    },

    /** 切换当前钱包 */
    setCurrentAddress(address: string) {
      if (this.addressList.includes(address)) {
        this.currentAddress = address;
        this._persist();
      }
    },

    /** 连接钱包 */
    async connect() {
      if (!(window as any).ethereum) {
        message("请先安装 MetaMask!", { type: "error" });
        return "";
      }
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });

        if (!accounts || accounts.length === 0) {
          message("未检测到账户，请在 MetaMask 中登录", { type: "warning" });
          return "";
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = signer.address;

        // 挂载到 window 全局
        window.provider = provider;
        window.signer = signer;

        if (!this.addressList.includes(address)) {
          this.addressList.push(address);
        }
        this.currentAddress = address;
        this.isConnected = true;

        this._persist();

        message("钱包已连接: " + address, { type: "success" });
        return address;
      } catch (err: any) {
        console.error("连接钱包失败:", err);
        message("连接钱包失败: " + err.message, { type: "error" });
        return "";
      }
    },

    /** 断开连接 */
    disconnect() {
      this.isConnected = false;
      this.currentAddress = "";

      // 清理 window 全局
      delete window.provider;
      delete window.signer;

      this._persist();
    }
  }
});

// hook 封装
export function useWalletStoreHook() {
  return useWalletStore();
}
