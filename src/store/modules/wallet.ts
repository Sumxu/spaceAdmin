import { defineStore } from "pinia";
import { storageLocal } from "../utils";
import { message } from "@/utils/message";
import { ethers } from "ethers";

const walletKey = "pure-wallet";
const BSC_CHAIN_ID = 56; // 十进制
const BSC_CHAIN_ID_HEX = "0x38";
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
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        message("请先安装 MetaMask!", { type: "error" });
        return "";
      }

      try {
        // 1️⃣ 请求账户
        const accounts: string[] = await ethereum.request({
          method: "eth_requestAccounts"
        });

        if (!accounts || accounts.length === 0) {
          message("未检测到账户，请在 MetaMask 中登录", { type: "warning" });
          return "";
        }

        // 2️⃣ 检查当前链
        const currentChainId = await ethereum.request({
          method: "eth_chainId"
        });

        // 3️⃣ 如果不是 BSC 主网，切换
        if (currentChainId !== BSC_CHAIN_ID_HEX) {
          try {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: BSC_CHAIN_ID_HEX }]
            });
          } catch (switchError: any) {
            // 4️⃣ 如果 MetaMask 中没有该链，添加
            if (switchError.code === 4902) {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: BSC_CHAIN_ID_HEX,
                    chainName: "Binance Smart Chain Mainnet",
                    nativeCurrency: {
                      name: "BNB",
                      symbol: "BNB",
                      decimals: 18
                    },
                    rpcUrls: ["https://bsc-dataseed.binance.org/"],
                    blockExplorerUrls: ["https://bscscan.com"]
                  }
                ]
              });
            } else {
              throw switchError;
            }
          }
        }

        // 5️⃣ ethers v6 Provider
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // 6️⃣ 挂到全局（你原来的逻辑）
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
