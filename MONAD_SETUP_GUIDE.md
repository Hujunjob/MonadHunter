# 🚀 Monad Testnet Setup Guide

## How to Connect Your Wallet to Monad Testnet

### Method 1: Automatic Setup (Recommended)

1. **Start the Game**
   ```bash
   npm run dev
   ```

2. **Connect Your Wallet**
   - Click "Connect Wallet" in the game
   - Choose your preferred wallet (MetaMask, WalletConnect, etc.)

3. **Add Monad Network**
   - You'll see a blue notification box saying "Switch to Monad Testnet"
   - Click the "Add Monad" button
   - Your wallet will prompt you to add the network
   - Click "Add Network" in your wallet

4. **Switch to Monad**
   - Your wallet should automatically switch to Monad Testnet
   - You'll see "⚡ Monad Testnet" in the network indicator

### Method 2: Manual Setup

If the automatic method doesn't work, add the network manually:

#### For MetaMask:
1. Open MetaMask
2. Click the network dropdown (top of the popup)
3. Click "Add Network"
4. Click "Add a network manually"
5. Enter the following details:

```
Network Name: Monad Testnet
New RPC URL: https://testnet-rpc.monad.xyz
Chain ID: 10143
Currency Symbol: MON
Block Explorer URL: https://testnet-explorer.monad.xyz
```

6. Click "Save"
7. Switch to "Monad Testnet" in the network dropdown

#### For Other Wallets:
Use the same network details above in your wallet's "Add Network" or "Custom RPC" section.

### Method 3: Direct Import

Click this link to automatically add Monad Testnet to MetaMask:
[Add Monad Testnet to MetaMask](https://chainlist.org/chain/10143)

## Getting Test Tokens

Once connected to Monad Testnet, you'll need MON tokens for gas fees:

1. **Visit the Monad Faucet**: https://faucet.monad.xyz
2. **Enter your wallet address**
3. **Complete any required verification**
4. **Receive test MON tokens**

## Verify Your Connection

After setup, you should see:
- ✅ "Connected to Monad Testnet" message in the game
- ⚡ "Monad Testnet" in the network indicator
- MON balance in your wallet

## Game Features on Monad

With Monad Testnet connected, you can:
- 🎮 **Play MonadHunter** with normal gameplay
- 📊 **Upload scores to blockchain** after each game
- 🏆 **View your best on-chain records** 
- ⚡ **Experience ultra-fast transactions** (sub-second confirmations)
- 💰 **Pay minimal gas fees** (almost free gaming!)

## Troubleshooting

### Common Issues:

1. **"Contract not deployed on this network"**
   - Make sure you're connected to Monad Testnet (Chain ID: 10143)
   - The contract address is: `0xc038B79eDB5e68C3d109627507614745EB555Ace`

2. **Transaction fails**
   - Make sure you have MON tokens for gas
   - Try increasing gas limit in advanced settings

3. **Network not appearing**
   - Double-check the RPC URL: `https://testnet-rpc.monad.xyz`
   - Ensure Chain ID is exactly: `10143`

4. **Wallet won't connect**
   - Try refreshing the page
   - Clear browser cache
   - Try a different browser

### Getting Help:

- Check the browser console for error messages
- Verify you're on the correct network
- Make sure you have sufficient MON for gas fees
- Try disconnecting and reconnecting your wallet

## Why Monad?

🚀 **Ultra-Fast**: 10,000+ TPS with sub-second finality
💸 **Low Cost**: Minimal gas fees perfect for gaming
🔄 **EVM Compatible**: Works with all Ethereum wallets and tools
🎮 **Gaming Optimized**: Built for high-frequency dApp interactions

---

**Ready to hunt? Connect to Monad and start playing! ⚡🏆**