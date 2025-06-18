# MonadHunter Blockchain Integration

## Overview

MonadHunter now includes full blockchain integration using Scaffold-ETH 2 framework. Players can upload their game scores to the blockchain and view their permanent on-chain records.

## Features

### Smart Contract
- **MonadHunterScore.sol**: Stores player scores on-chain
- Records level, kill count, game time, and timestamp
- Tracks personal best scores (by level, then by kill count)
- Maintains complete game history for each player
- Emits events for score submissions and new records

### Frontend Integration
- **ScoreUpload Component**: Modal for uploading scores after game over
- **PlayerStats Component**: Displays player's best on-chain score
- **useMonadHunterContract Hook**: Handles all contract interactions
- Seamless integration with existing wallet connection (RainbowKit)

### Game Flow
1. Player plays MonadHunter game
2. Upon game over, score upload modal appears
3. Player can choose to upload score to blockchain (requires gas fee)
4. On-chain records are displayed in the main menu
5. Personal best scores are tracked and highlighted

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file and fill in your details:
```bash
cp .env.example .env
```

Required environment variables:
- `PRIVATE_KEY`: Your wallet private key for contract deployment
- `SEPOLIA_RPC_URL`: Sepolia testnet RPC endpoint
- `ETHERSCAN_API_KEY`: For contract verification

### 3. Local Development

Start a local Hardhat node:
```bash
npm run node
```

Deploy the contract to local network:
```bash
npm run deploy:localhost
```

Update the contract address in `src/hooks/useMonadHunterContract.ts`:
```typescript
const CONTRACT_ADDRESS = '0x...'; // Replace with deployed address
```

### 4. Testnet Deployment

Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

Deploy to Monad testnet:
```bash
npm run deploy:monad
```

### 5. Start the Game
```bash
npm run dev
```

## Contract Details

### MonadHunterScore Contract

**Functions:**
- `submitScore(level, killCount, gameTime)`: Submit a new score
- `getPlayerScore(player)`: Get player's best score
- `getPlayerHistory(player)`: Get all scores for a player
- `hasPlayedBefore(player)`: Check if player has any records

**Events:**
- `ScoreSubmitted`: Emitted when any score is submitted
- `NewHighScore`: Emitted when a new personal best is achieved

### Gas Costs
- Score submission: ~50,000-80,000 gas
- Very affordable on L2s (Arbitrum, Optimism, Polygon, Base)

## Network Support

The game supports all major EVM networks:
- Ethereum Mainnet
- Sepolia Testnet
- **Monad Testnet** 🆕
- Arbitrum
- Optimism
- Polygon
- Base

### Monad Integration
MonadHunter now supports Monad testnet, leveraging Monad's high-performance EVM-compatible blockchain:
- **Chain ID**: 10143
- **RPC**: https://testnet-rpc.monad.xyz
- **Explorer**: https://testnet-explorer.monad.xyz
- **Native Token**: MON
- **Ultra-fast transactions** and **low gas fees** perfect for gaming!

## Security Considerations

- Smart contract is simple and focused on score storage only
- No token transfers or complex logic
- All scores are publicly viewable (as intended for leaderboards)
- Players control their own score submissions

## Future Enhancements

Potential additions:
- Global leaderboards
- Achievement NFTs
- Seasonal competitions
- Token rewards for high scores
- Cross-chain score aggregation

## Troubleshooting

### Common Issues

1. **Contract address not set**: Make sure to update `CONTRACT_ADDRESS` in the hook
2. **Wrong network**: Ensure your wallet is connected to the correct network
3. **Gas estimation failed**: Usually means contract address is incorrect
4. **Transaction reverted**: Check that game stats are valid (>0)

### Getting Help

- Check browser console for detailed error messages
- Verify contract is deployed correctly on the network
- Ensure wallet has enough ETH for gas fees
- Make sure you're connected to the correct network in your wallet

## Files Structure

```
contracts/
  MonadHunterScore.sol          # Main smart contract
scripts/
  deploy.js                     # Deployment script
src/
  hooks/
    useMonadHunterContract.ts   # Contract interaction hook
  components/
    ScoreUpload.tsx             # Score upload modal
    PlayerStats.tsx             # Player stats display
hardhat.config.js               # Hardhat configuration
```

This integration provides a seamless Web3 gaming experience while maintaining the fun and accessibility of the core MonadHunter game!