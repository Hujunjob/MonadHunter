// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MonadHunterScore {
    struct GameResult {
        uint256 level;
        uint256 killCount;
        uint256 gameTime;
        uint256 timestamp;
    }
    
    mapping(address => GameResult) public playerScores;
    mapping(address => GameResult[]) public playerHistory;
    
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
        require(_killCount > 0, "Kill count must be greater than 0");
        require(_gameTime > 0, "Game time must be greater than 0");
        
        GameResult memory newResult = GameResult({
            level: _level,
            killCount: _killCount,
            gameTime: _gameTime,
            timestamp: block.timestamp
        });
        
        // Check if this is a new high score (by level first, then by kill count)
        GameResult memory currentBest = playerScores[msg.sender];
        bool isNewHigh = false;
        
        if (_level > currentBest.level || 
            (_level == currentBest.level && _killCount > currentBest.killCount)) {
            playerScores[msg.sender] = newResult;
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
        GameResult memory score = playerScores[_player];
        return (score.level, score.killCount, score.gameTime, score.timestamp);
    }
    
    function getPlayerHistory(address _player) external view returns (GameResult[] memory) {
        return playerHistory[_player];
    }
    
    function hasPlayedBefore(address _player) external view returns (bool) {
        return playerScores[_player].timestamp > 0;
    }
    
    function getLeaderboard() external view returns (
        address[] memory players,
        uint256[] memory levels,
        uint256[] memory killCounts
    ) {
        // Note: This is a simplified version. In production, you'd want to implement
        // a more efficient leaderboard system with events and off-chain indexing
        // For now, this returns empty arrays as a placeholder
        players = new address[](0);
        levels = new uint256[](0);
        killCounts = new uint256[](0);
    }
}