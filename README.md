# 🧛 MonadHunter

一个基于 React + Phaser 的吸血鬼幸存者风格游戏，集成了 MultiSynq 反作弊保护系统。

## 🎮 游戏特色

- **经典玩法**: 吸血鬼幸存者风格的生存游戏
- **Web3 集成**: RainbowKit 钱包连接，支持多种主流钱包
- **观察者模式**: 实时观看其他玩家的游戏，创新的社交功能
- **反作弊保护**: 集成 MultiSynq 服务端验证系统
- **现代技术栈**: React + TypeScript + Phaser + RainbowKit

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置以下内容：
# - WalletConnect Project ID (必须): https://cloud.walletconnect.com
# - MultiSynq API Key (可选): https://multisynq.io/coder
```

### 3. 启动游戏
```bash
npm run dev
```

## 🔐 Web3 功能

### 钱包连接
- **必须连接钱包**: 用户需要连接 Web3 钱包才能开始游戏
- **多钱包支持**: MetaMask、WalletConnect、Coinbase Wallet 等
- **多链支持**: Ethereum、Polygon、Optimism、Arbitrum、Base

### 游戏模式
- **🎮 开始游戏**: 正常的游戏体验
- **👁️ 观察者模式**: 输入其他玩家钱包地址，实时观看他们的游戏

### 反作弊系统
- **配置了 MultiSynq API Key**: 自动启用反作弊保护
- **未配置**: 使用本地模式（适合开发调试）

## 🎯 游戏操作

- **移动**: 方向键 ←↑↓→
- **射击**: 空格键或回车键（自动瞄准最近敌人）
- **重启**: 点击游戏内的重启按钮

## 📦 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🔧 技术架构

- **前端**: React 19 + TypeScript + Vite
- **Web3**: RainbowKit + Wagmi + Viem
- **游戏引擎**: Phaser 3.90
- **反作弊**: MultiSynq 客户端同步
- **样式**: CSS3 + 现代设计 + 玻璃拟态效果

## 📖 文档

- [RainbowKit 钱包集成与观察者模式](./RAINBOWKIT_INTEGRATION.md)
- [MultiSynq 反作弊集成说明](./MULTISYNQ_INTEGRATION.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License