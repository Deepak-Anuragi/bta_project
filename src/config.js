// Contract addresses - UPDATE THESE AFTER DEPLOYING TO SEPOLIA
export const CONTRACT_ADDRESSES = {
  nftContract: "0x2d34Bc862FfB37b7251A01AC4ff39C0e5Beeb382",
  gameContract: "0x7523cf0bAd476a3B875dc6A712ca9747A5648fD4",
  tournamentContract: "0xB24f4fA2fb67c554FBe6B9344d0BeFF768e301A9"
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
