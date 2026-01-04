// src/hooks/useNFTMulticall.ts
import { ethers } from "ethers";
import { contractAddress } from "@/config/contract";

interface NFTCall {
  address: string;
  abi: any;
  params?: any[];
}

/**
 * Vue3 版本：Ethers v6 + 动态 ABI 的 NFT Multicall
 */
export function useNFTMulticall() {
  const fetch = async (methodName: string, calls: NFTCall[]) => {
    try {
      // v6 provider
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      // MultiCall 合约
      const multicallContract = new ethers.Contract(
        contractAddress.multiCallToken,
        [
          "function aggregate(tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)"
        ],
        provider
      );

      // 构造 callData（v6 用 encodeFunctionData）
      const callDataArray = [];

      for (const { address, abi, params = [] } of calls) {
        const contract = new ethers.Contract(address, abi, provider);
        // v6 encodeFunctionData
        const callData = contract.interface.encodeFunctionData(
          methodName,
          params
        );

        callDataArray.push({
          target: address,
          callData
        });
      }

      // 执行 aggregate
      const result = await multicallContract.aggregate(callDataArray);
      const returnData = result[1]; // v6 返回 tuple，returnData 在第 1 个位置

      // 解析每个返回值
      const results = returnData.map((data: any, index: number) => {
        const { address, abi } = calls[index];
        const contract = new ethers.Contract(address, abi, provider);

        // v6 decodeFunctionResult
        const decoded = contract.interface.decodeFunctionResult(
          methodName,
          data
        );

        return decoded.length === 1 ? decoded[0] : decoded;
      });

      return { success: true, data: results };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || "Multicall failed" };
    }
  };

  return { fetch };
}
