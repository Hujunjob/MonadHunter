import React, { useState } from 'react';
import { useMonadHunterContract } from '../hooks/useMonadHunterContract';

interface GameStats {
  level: number;
  killCount: number;
  gameTime: number;
}

interface ScoreUploadProps {
  gameStats: GameStats;
  onUploadComplete?: () => void;
  onClose?: () => void;
}

export const ScoreUpload: React.FC<ScoreUploadProps> = ({ 
  gameStats, 
  onUploadComplete,
  onClose 
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    submitScore,
    isSubmitting,
    isConfirmed,
    submitError,
    isConnected,
    playerScore
  } = useMonadHunterContract();

  const handleUpload = async () => {
    try {
      setUploadStatus('uploading');
      setErrorMessage('');
      
      console.log('Starting score upload:', gameStats);
      
      await submitScore(gameStats.level, gameStats.killCount, gameStats.gameTime);
      
      console.log('Score submission initiated');
      // Wait for confirmation
      // The useMonadHunterContract hook will handle the confirmation state
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      
      // Extract meaningful error message
      let errorMsg = 'Upload failed';
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle wagmi/viem errors
        if ('shortMessage' in error) {
          errorMsg = (error as any).shortMessage;
        } else if ('message' in error) {
          errorMsg = (error as any).message;
        } else if ('details' in error) {
          errorMsg = (error as any).details;
        }
      }
      
      setErrorMessage(errorMsg);
      console.error('Detailed error:', error);
    }
  };

  // Update status based on contract state
  React.useEffect(() => {
    if (isConfirmed && uploadStatus === 'uploading') {
      setUploadStatus('success');
      onUploadComplete?.();
    }
  }, [isConfirmed, uploadStatus, onUploadComplete]);

  React.useEffect(() => {
    if (submitError && uploadStatus === 'uploading') {
      setUploadStatus('error');
      setErrorMessage(submitError.message || 'Transaction failed');
    }
  }, [submitError, uploadStatus]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isNewRecord = () => {
    if (!playerScore || playerScore.timestamp === 0) return true;
    return gameStats.level > playerScore.level || 
           (gameStats.level === playerScore.level && gameStats.killCount > playerScore.killCount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">🏆 Game Over!</h2>
          {isNewRecord() && (
            <p className="text-green-400 font-semibold">🎉 New Personal Record!</p>
          )}
        </div>

        {/* Game Stats */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Your Results</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>🏅 Level:</span>
              <span className="font-bold text-yellow-400">{gameStats.level}</span>
            </div>
            <div className="flex justify-between">
              <span>💀 Kills:</span>
              <span className="font-bold text-red-400">{gameStats.killCount}</span>
            </div>
            <div className="flex justify-between">
              <span>⏱️ Time:</span>
              <span className="font-bold text-blue-400">{formatTime(gameStats.gameTime)}</span>
            </div>
          </div>
        </div>

        {/* Previous Best Score */}
        {playerScore && playerScore.timestamp > 0 && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Previous Best</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>🏅 Level:</span>
                <span>{playerScore.level}</span>
              </div>
              <div className="flex justify-between">
                <span>💀 Kills:</span>
                <span>{playerScore.killCount}</span>
              </div>
              <div className="flex justify-between">
                <span>⏱️ Time:</span>
                <span>{formatTime(playerScore.gameTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload Status */}
        {!isConnected ? (
          <div className="text-center mb-6">
            <p className="text-yellow-400 mb-4">Connect your wallet to save your score on-chain!</p>
          </div>
        ) : (
          <div className="text-center mb-6">
            {uploadStatus === 'idle' && (
              <p className="text-gray-300 mb-4">Upload your score to the blockchain!</p>
            )}
            {uploadStatus === 'uploading' && (
              <p className="text-blue-400 mb-4">
                📤 Uploading to blockchain...
                {isSubmitting && ' (Confirm in wallet)'}
              </p>
            )}
            {uploadStatus === 'success' && (
              <p className="text-green-400 mb-4">✅ Score uploaded successfully!</p>
            )}
            {uploadStatus === 'error' && (
              <div className="mb-4">
                <p className="text-red-400 mb-2">❌ Upload failed</p>
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isConnected && uploadStatus !== 'success' && (
            <button
              onClick={handleUpload}
              disabled={isSubmitting || uploadStatus === 'uploading'}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                isSubmitting || uploadStatus === 'uploading'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting || uploadStatus === 'uploading' ? 'Uploading...' : '📤 Upload Score'}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            {uploadStatus === 'success' ? 'Continue' : 'Skip Upload'}
          </button>
        </div>

        {/* Blockchain Info */}
        {isConnected && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            <p>🔗 Scores are permanently stored on the blockchain</p>
            <p>⛽ Small gas fee required for upload</p>
          </div>
        )}
      </div>
    </div>
  );
};