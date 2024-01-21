const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [usdDeployer, bondDeployer, dvdDeployer] = await hre.ethers.getSigners();
    const usd = await hre.ethers.deployContract("USD", usdDeployer);
    const bond = await hre.ethers.deployContract("Bond", bondDeployer);
    const dvdManager = await hre.ethers.deployContract("DvDManager", dvdDeployer);

    await usd.waitForDeployment();
    await bond.waitForDeployment();
    await dvdManager.waitForDeployment();

    console.log(`USD contract ID ${usd.target}`);
    console.log(`Bond contract ID ${bond.target}`);
    console.log(`DvDManager contract ID ${dvdManager.target}`);

    try {
        fs.writeFileSync("./usdaddress.txt", usd.target);
        fs.writeFileSync("./bondaddress.txt", bond.target);
        fs.writeFileSync("./dvdaddress.txt", dvdManager.target);
    } catch (e) {
        console.error(e);
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1
});