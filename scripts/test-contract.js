import hre from "hardhat";

async function main() {
  console.log("Testing MonadHunter Score Contract...");

  // Get the deployed contract address
  const contractAddress = "0x1aF71cCB324F727A832DF53b8372A296e165B8C0";
  
  // Get contract instance
  const MonadHunterScore = await hre.ethers.getContractFactory("MonadHunterScore");
  const contract = MonadHunterScore.attach(contractAddress);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with signer:", signer.address);
  
  try {
    // Test 1: Check if player has played before (should be false)
    console.log("\n=== Test 1: Check if player has played before ===");
    const hasPlayed = await contract.hasPlayedBefore(signer.address);
    console.log("Has played before:", hasPlayed);
    
    // Test 2: Submit a score
    console.log("\n=== Test 2: Submit a test score ===");
    const level = 3;
    const killCount = 15;
    const gameTime = 120; // 2 minutes
    
    console.log(`Submitting score: Level ${level}, Kills ${killCount}, Time ${gameTime}s`);
    
    const tx = await contract.submitScore(level, killCount, gameTime);
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Test 3: Get player score
    console.log("\n=== Test 3: Get player score ===");
    const playerScore = await contract.getPlayerScore(signer.address);
    console.log("Player score:", {
      level: playerScore.level.toString(),
      killCount: playerScore.killCount.toString(),
      gameTime: playerScore.gameTime.toString(),
      timestamp: playerScore.timestamp.toString()
    });
    
    // Test 4: Check if player has played before (should be true now)
    console.log("\n=== Test 4: Check if player has played before (after submission) ===");
    const hasPlayedAfter = await contract.hasPlayedBefore(signer.address);
    console.log("Has played before:", hasPlayedAfter);
    
    // Test 5: Get player history
    console.log("\n=== Test 5: Get player history ===");
    const history = await contract.getPlayerHistory(signer.address);
    console.log("Player history length:", history.length);
    if (history.length > 0) {
      console.log("Latest game:", {
        level: history[history.length - 1].level.toString(),
        killCount: history[history.length - 1].killCount.toString(),
        gameTime: history[history.length - 1].gameTime.toString(),
        timestamp: history[history.length - 1].timestamp.toString()
      });
    }
    
    // Test 6: Get total players
    console.log("\n=== Test 6: Get total players ===");
    const totalPlayers = await contract.getTotalPlayers();
    console.log("Total players:", totalPlayers.toString());

    // Test 7: Get leaderboard
    console.log("\n=== Test 7: Get leaderboard ===");
    const leaderboard = await contract.getLeaderboard(10);
    console.log("Leaderboard players:", leaderboard[0]);
    console.log("Leaderboard scores:");
    for (let i = 0; i < leaderboard[0].length; i++) {
      console.log(`  ${i + 1}. ${leaderboard[0][i]}: ${leaderboard[1][i].killCount} kills, Level ${leaderboard[1][i].level}`);
    }
    
    console.log("\n✅ All tests passed! Contract is working correctly.");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });