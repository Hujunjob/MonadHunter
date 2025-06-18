import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying MonadHunter Score Contract...");

  const MonadHunterScore = await hre.ethers.getContractFactory("MonadHunterScore");
  const monadHunterScore = await MonadHunterScore.deploy();

  await monadHunterScore.waitForDeployment();

  const contractAddress = await monadHunterScore.getAddress();
  console.log("MonadHunterScore deployed to:", contractAddress);

  // Verify the contract on Etherscan (if not on local network and verification is supported)
  const skipVerification = ["hardhat", "localhost", "monadTestnet"].includes(hre.network.name);
  
  if (!skipVerification) {
    console.log("Waiting for block confirmations...");
    await monadHunterScore.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  } else {
    console.log(`Skipping verification for ${hre.network.name} network`);
  }

  // Save deployment info
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    `./deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`Deployment info saved to ./deployments/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });