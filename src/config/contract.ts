interface ContractMap {
  GaussDistributor: string;
  GaussMintage: string;
  GaussNFTContract: string;
  multiCallToken:string;
  usdtToken:string;
}
// 开发环境合约（测试网）
const devContract: ContractMap = {
  GaussDistributor: "0xE2b8E2a255fa9643deE3935Bf107e6933C0e0596",
  GaussMintage: "0x08ae5e946f9e921886d16D8Ed57d833eF7ab0388",
  GaussNFTContract: "0x183d0628595219ba7f1Dc67C4F4b99628F04Ef4B",
  multiCallToken: "0x1d3C076d568F3dCaF3CBbecbd724Fc901c9fCf81",
  usdtToken:"0xc8e19c19479a866142b42fb390f2ea1ff082e0d2",
};
// 生产环境合约（主网）
const prodContract: ContractMap = {
  GaussDistributor: "0xE2b8E2a255fa9643deE3935Bf107e6933C0e0596",
  GaussMintage: "0x08ae5e946f9e921886d16D8Ed57d833eF7ab0388",
  GaussNFTContract: "0x183d0628595219ba7f1Dc67C4F4b99628F04Ef4B",
  multiCallToken: "0x1d3C076d568F3dCaF3CBbecbd724Fc901c9fCf81",
  usdtToken:"0xc8e19c19479a866142b42fb390f2ea1ff082e0d2",
};

// 根据环境选择配置
export const contractAddress: ContractMap =
  import.meta.env.MODE === "development" ? devContract : prodContract;
