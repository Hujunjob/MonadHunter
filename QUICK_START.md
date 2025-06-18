# MonadHunter - Quick Start Guide

## 🎮 Game + Blockchain Integration

MonadHunter is a vampire survivor-style game with on-chain score recording.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy and edit environment file
cp .env.example .env

# Add your private key (without 0x prefix) for contract deployment
# Edit PRIVATE_KEY in .env file
```

### 3. Start Development

**Option A: Local Blockchain (Recommended for testing)**
```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy contract
npm run deploy:localhost

# Terminal 3: Start game
npm run dev
```

**Option B: Use Testnet**
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Or deploy to Monad testnet
npm run deploy:monad

# Start game
npm run dev
```

## 🎯 How to Play

1. **Connect Wallet**: Use RainbowKit to connect your wallet
2. **Play Game**: 
   - Arrow keys to move
   - Spacebar to shoot
   - Survive and level up!
3. **Upload Score**: When game ends, upload your score to blockchain
4. **View Records**: Your best on-chain score displays on main menu

## 🌐 Supported Networks

- **Ethereum Mainnet**
- **Sepolia Testnet** (recommended for testing)
- **Monad Testnet** ⚡ (ultra-fast, low fees)
- **Arbitrum**
- **Optimism** 
- **Polygon**
- **Base**

## 🔧 Smart Contract

The `MonadHunterScore` contract stores:
- Player level
- Kill count  
- Game time
- Timestamp

Your best score is permanently recorded on-chain!

## 📁 Project Structure

```
contracts/           # Smart contracts
scripts/            # Deployment scripts  
src/
  components/       # React components
    ScoreUpload.tsx # Score upload modal
    PlayerStats.tsx # Blockchain stats display
  hooks/           # Contract interaction hooks
  config/          # Network & contract configs
deployments/       # Contract deployment info
```

## 🛠 Development Commands

```bash
npm run dev          # Start development server
npm run compile      # Compile smart contracts
npm run node         # Start local Hardhat node
npm run deploy:localhost  # Deploy to local network
npm run deploy:sepolia    # Deploy to Sepolia testnet
npm run deploy:monad      # Deploy to Monad testnet
npm run build        # Build for production
```

## 🎉 Features

- ✅ Wallet connection with RainbowKit
- ✅ On-chain score storage
- ✅ Multi-network support
- ✅ Personal best tracking
- ✅ Game history on blockchain
- ✅ Ultra-fast Monad integration
- ✅ Beautiful UI with score comparison

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test on local blockchain
4. Submit pull request

## 📞 Support

For issues or questions:
- Check [BLOCKCHAIN_INTEGRATION.md](./BLOCKCHAIN_INTEGRATION.md) for detailed setup
- Open GitHub issue for bugs
- Test on Sepolia/Monad testnet before mainnet

---

**Happy Gaming! 🎮⚡🏆**