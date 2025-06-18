// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Local development
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat deployment address
  
  // Testnets
  11155111: '', // Sepolia - Update after deployment
  10143: '0x1aF71cCB324F727A832DF53b8372A296e165B8C0', // Monad Testnet
  
  // Mainnets
  1: '', // Ethereum Mainnet
  42161: '', // Arbitrum
  10: '', // Optimism
  137: '', // Polygon
  8453: '', // Base
  // 41171: '', // Monad Mainnet (when available)
} as const;

export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_level", "type": "uint256"},
      {"internalType": "uint256", "name": "_killCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_gameTime", "type": "uint256"}
    ],
    "name": "submitScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
    "name": "getPlayerScore",
    "outputs": [
      {"internalType": "uint256", "name": "level", "type": "uint256"},
      {"internalType": "uint256", "name": "killCount", "type": "uint256"},
      {"internalType": "uint256", "name": "gameTime", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
    "name": "hasPlayedBefore",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
    "name": "getPlayerHistory",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "level", "type": "uint256"},
          {"internalType": "uint256", "name": "killCount", "type": "uint256"},
          {"internalType": "uint256", "name": "gameTime", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct MonadHunterScore.GameResult[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPlayers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_count", "type": "uint256"}],
    "name": "getLeaderboard",
    "outputs": [
      {"internalType": "address[]", "name": "topPlayers", "type": "address[]"},
      {
        "components": [
          {"internalType": "uint256", "name": "level", "type": "uint256"},
          {"internalType": "uint256", "name": "killCount", "type": "uint256"},
          {"internalType": "uint256", "name": "gameTime", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct MonadHunterScore.GameResult[]",
        "name": "topScores",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "level", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "killCount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "gameTime", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ScoreSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "newLevel", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newKillCount", "type": "uint256"}
    ],
    "name": "NewHighScore",
    "type": "event"
  }
] as const;

// Helper function to get contract address for current chain
export function getContractAddress(chainId: number): string | undefined {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
}