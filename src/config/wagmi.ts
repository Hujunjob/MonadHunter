import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MonadHunter',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false, // If your dApp uses server side rendering (SSR)
});