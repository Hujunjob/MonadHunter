// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MonadHunterScore {
    struct GameResult {
        uint256 level;
        uint256 killCount;
        uint256 gameTime;
        uint256 timestamp;
    }
    
    mapping(address => GameResult) public playerBestScores;
    mapping(address => GameResult[]) public playerHistory;
    address[] public players;
    
    event ScoreSubmitted(
        address indexed player,
        uint256 level,
        uint256 killCount,
        uint256 gameTime,
        uint256 timestamp
    );
    
    event NewHighScore(
        address indexed player,
        uint256 newLevel,
        uint256 newKillCount
    );
    
    function submitScore(
        uint256 _level,
        uint256 _killCount,
        uint256 _gameTime
    ) external {
        require(_level > 0, "Level must be greater than 0");
        require(_gameTime > 0, "Game time must be greater than 0");
        // Note: killCount can be 0 for very short games
        
        GameResult memory newResult = GameResult({
            level: _level,
            killCount: _killCount,
            gameTime: _gameTime,
            timestamp: block.timestamp
        });
        
        // Check if this is a new high score (by level first, then by kill count)
        GameResult memory currentBest = playerBestScores[msg.sender];
        bool isNewHigh = false;
        
        // If no previous score exists (timestamp == 0), add player to players array
        if (currentBest.timestamp == 0) {
            players.push(msg.sender);
        }
        
        // If no previous score exists or this is a better score
        if (currentBest.timestamp == 0 || 
            _level > currentBest.level || 
            (_level == currentBest.level && _killCount > currentBest.killCount)) {
            playerBestScores[msg.sender] = newResult;
            isNewHigh = true;
            emit NewHighScore(msg.sender, _level, _killCount);
        }
        
        // Always add to history
        playerHistory[msg.sender].push(newResult);
        
        emit ScoreSubmitted(msg.sender, _level, _killCount, _gameTime, block.timestamp);
    }
    
    function getPlayerScore(address _player) external view returns (
        uint256 level,
        uint256 killCount,
        uint256 gameTime,
        uint256 timestamp
    ) {
        GameResult memory score = playerBestScores[_player];
        return (score.level, score.killCount, score.gameTime, score.timestamp);
    }
    
    function getPlayerHistory(address _player) external view returns (GameResult[] memory) {
        return playerHistory[_player];
    }
    
    function hasPlayedBefore(address _player) external view returns (bool) {
        return playerBestScores[_player].timestamp > 0;
    }
    
    function getTotalPlayers() external view returns (uint256) {
        return players.length;
    }

    function getLeaderboard(uint256 _count) external view returns (address[] memory topPlayers, GameResult[] memory topScores) {
        uint256 totalPlayers = players.length;
        uint256 returnCount = _count > totalPlayers ? totalPlayers : _count;
        
        if (returnCount == 0) {
            return (new address[](0), new GameResult[](0));
        }

        // Create arrays to store players and their scores
        address[] memory allPlayers = new address[](totalPlayers);
        GameResult[] memory allScores = new GameResult[](totalPlayers);
        
        // Copy all players and their best scores
        for (uint256 i = 0; i < totalPlayers; i++) {
            allPlayers[i] = players[i];
            allScores[i] = playerBestScores[players[i]];
        }
        
        // Sort by killCount (descending), then by level (descending), then by gameTime (ascending)
        for (uint256 i = 0; i < totalPlayers - 1; i++) {
            for (uint256 j = 0; j < totalPlayers - i - 1; j++) {
                bool shouldSwap = false;
                
                // First compare by killCount (higher is better)
                if (allScores[j].killCount < allScores[j + 1].killCount) {
                    shouldSwap = true;
                } else if (allScores[j].killCount == allScores[j + 1].killCount) {
                    // If killCount is same, compare by level (higher is better)
                    if (allScores[j].level < allScores[j + 1].level) {
                        shouldSwap = true;
                    } else if (allScores[j].level == allScores[j + 1].level) {
                        // If level is also same, compare by gameTime (lower is better)
                        if (allScores[j].gameTime > allScores[j + 1].gameTime) {
                            shouldSwap = true;
                        }
                    }
                }
                
                if (shouldSwap) {
                    // Swap players
                    address tempPlayer = allPlayers[j];
                    allPlayers[j] = allPlayers[j + 1];
                    allPlayers[j + 1] = tempPlayer;
                    
                    // Swap scores
                    GameResult memory tempScore = allScores[j];
                    allScores[j] = allScores[j + 1];
                    allScores[j + 1] = tempScore;
                }
            }
        }
        
        // Return only the top _count results
        topPlayers = new address[](returnCount);
        topScores = new GameResult[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            topPlayers[i] = allPlayers[i];
            topScores[i] = allScores[i];
        }
        
        return (topPlayers, topScores);
    }
}