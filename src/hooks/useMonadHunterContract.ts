import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { CONTRACT_ABI, getContractAddress, CONTRACT_ADDRESSES } from '../config/contracts';

interface GameScore {
  level: number;
  killCount: number;
  gameTime: number;
  timestamp: number;
}

export function useMonadHunterContract() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitHash, setLastSubmitHash] = useState<string | null>(null);
  
  const contractAddress = getContractAddress(chainId);

  // Read player's current best score
  const { 
    data: playerScore, 
    isLoading: isLoadingScore,
    refetch: refetchScore 
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerScore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && !!contractAddress
    }
  });

  // Check if player has played before
  const { data: hasPlayed } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'hasPlayedBefore',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && !!contractAddress
    }
  });

  // Get leaderboard
  const getLeaderboard = (count: number = 10) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getLeaderboard',
      args: [BigInt(count)],
      query: {
        enabled: !!contractAddress && isConnected
      }
    });
  };

  // Contract write functions
  const { writeContract, data: writeData, error: writeError } = useWriteContract();

  // Wait for transaction receipt
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Submit score to contract
  const submitScore = async (level: number, killCount: number, gameTime: number) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    console.log('Submitting score:', { level, killCount, gameTime, chainId, contractAddress });
    
    if (!contractAddress) {
      throw new Error(`Contract not deployed on chain ${chainId}. Available chains: ${Object.keys(CONTRACT_ADDRESSES).join(', ')}`);
    }

    // Validate input data
    if (level <= 0) {
      throw new Error('Level must be greater than 0');
    }
    if (gameTime <= 0) {
      throw new Error('Game time must be greater than 0');
    }

    try {
      setIsSubmitting(true);
      
      console.log('Calling writeContract with:', {
        address: contractAddress,
        functionName: 'submitScore',
        args: [BigInt(level), BigInt(killCount), BigInt(gameTime)]
      });
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitScore',
        args: [BigInt(level), BigInt(killCount), BigInt(gameTime)],
      });

    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse player score data
  const parsedPlayerScore: GameScore | null = playerScore ? {
    level: Number(playerScore[0]),
    killCount: Number(playerScore[1]),
    gameTime: Number(playerScore[2]),
    timestamp: Number(playerScore[3])
  } : null;

  // Effect to refetch score after successful transaction
  useEffect(() => {
    if (isConfirmed && writeData) {
      setLastSubmitHash(writeData);
      refetchScore();
    }
  }, [isConfirmed, writeData, refetchScore]);

  return {
    // Contract state
    playerScore: parsedPlayerScore,
    hasPlayed: Boolean(hasPlayed),
    isLoadingScore,
    
    // Transaction state
    submitScore,
    isSubmitting: isSubmitting || isConfirming,
    isConfirmed,
    lastSubmitHash,
    
    // Errors
    submitError: writeError || receiptError,
    
    // Utils
    isConnected,
    refetchScore,
    getLeaderboard
  };
}