// Contract addresses - UPDATE THESE AFTER DEPLOYING TO SEPOLIA
export const CONTRACT_ADDRESSES = {
  nftContract: "0x8d986c5D65E31434A252E699632726a194900b46",
  gameContract: "0x5813670078a2e0197991E113ccCCE2D4dF0A9497",
  tournamentContract: "0xa4125c30F440A6f506bB0db7f53D2834252ABBeF"
};

export const NETWORK_CONFIG = {
  chainId: "0xaa36a7", // 11155111 in hex for Sepolia
  chainName: "Sepolia Testnet",
  rpcUrls: [
    "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    "https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  }
};

export const MIN_BET = "0.0001"; // 0.0001 ETH for testnet (extremely low)
