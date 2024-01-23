require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs");

task("showAssetBalance", "Test Balance with ")
  .setAction (async () => {
    let usdaddress;
    let bondaddress;
    try {
      usdaddress = fs.readFileSync('./usdaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    try {
      bondaddress = fs.readFileSync('./bondaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }
    
    const [usdDeployer, bondDeployer, dvdDeployer, buyer, seller] = await hre.ethers.getSigners();
    const usd = await hre.ethers.getContractAt("USD", usdaddress, usdDeployer);
    const bond = await hre.ethers.getContractAt("Bond", bondaddress, bondDeployer);
    const buyerUSDBalance = await usd.balanceOf(buyer);
    const sellerUSDBalance = await usd.balanceOf(seller);
    const buyerBondBalance = await bond.balanceOf(buyer);
    const sellerBondBalance = await bond.balanceOf(seller);

    console.log();
    console.log(`Buyer USD balance ${buyerUSDBalance}`);
    console.log(`Seller USD balance ${sellerUSDBalance}`);
    console.log();
    console.log(`Buyer Bond balance ${buyerBondBalance}`);
    console.log(`Seller Bond balance ${sellerBondBalance}`);    
    console.log();
  })

task("initialPositions", "Predeposit asset to buyer and seller")
  .setAction( async () => {
    let usdaddress;
    let bondaddress;
    try {
      usdaddress = fs.readFileSync('./usdaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    try {
      bondaddress = fs.readFileSync('./bondaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }
    
    const [usdDeployer, bondDeployer, dvdDeployer, buyer, seller] = await hre.ethers.getSigners();
    const usd = await hre.ethers.getContractAt("USD", usdaddress, usdDeployer);
    const bond = await hre.ethers.getContractAt("Bond", bondaddress, bondDeployer);
    const buyeramount = 1000000; // USD 1m
    const selleramount = 10000; // 10k units of Bond

    const tx1 = await usd.connect(usdDeployer).increaseSupply(buyeramount);
    await tx1.wait();

    const tx2 = await usd.connect(usdDeployer).transfer(buyer, buyeramount);
    await tx2.wait();

    const tx3 = await bond.connect(bondDeployer).increaseSupply(selleramount);
    await tx3.wait();

    const tx4 = await bond.connect(bondDeployer).transfer(seller, selleramount);
    await tx4.wait();

    console.log('Positioning done');
    console.log();
  })

task("buyerInitiateDvD", "Buyer initiates a DvD ")
  .setAction ( async () => {
    let usdaddress;
    let bondaddress;
    let dvdaddress;
    try {
      usdaddress = fs.readFileSync('./usdaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    try {
      bondaddress = fs.readFileSync('./bondaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    try {
      dvdaddress = fs.readFileSync('./dvdaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    const [usdDeployer, bondDeployer, dvdDeployer, buyer, seller] = await hre.ethers.getSigners();
    const usd = await hre.ethers.getContractAt("USD", usdaddress, usdDeployer);
    const bond = await hre.ethers.getContractAt("Bond", bondaddress, bondDeployer);
    const dvd = await hre.ethers.getContractAt("DvDManager", dvdaddress, dvdDeployer);
    const buyeramount = 400000; // USD 400k for 3000 units of bond
    const selleramount = 3000;

    const tx1 = await usd.connect(buyer).approve(dvd, buyeramount);
    await tx1.wait();

    const tx2 = await dvd.connect(buyer).initiateDVDTransfer(
      usd,
      buyeramount,
      seller,
      bond,
      selleramount
    );
    const tx2receipt = await tx2.wait();
    const tx2eventlog = tx2receipt.logs;
    console.log(`DvD Transfer ID ${tx2eventlog[0].args[0]}`);
  })

task("sellerTakeDvD", "Seller takes the DvD ")
  .addParam("txid", "Transfer ID")
  .setAction ( async (args) => {
    let usdaddress;
    let bondaddress;
    let dvdaddress;
    try {
      usdaddress = fs.readFileSync('./usdaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    try {
      bondaddress = fs.readFileSync('./bondaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    try {
      dvdaddress = fs.readFileSync('./dvdaddress.txt','utf8');
    } catch (e) {
      console.error(e)
    }

    const [usdDeployer, bondDeployer, dvdDeployer, buyer, seller] = await hre.ethers.getSigners();
    const usd = await hre.ethers.getContractAt("USD", usdaddress, usdDeployer);
    const bond = await hre.ethers.getContractAt("Bond", bondaddress, bondDeployer);
    const dvd = await hre.ethers.getContractAt("DvDManager", dvdaddress, dvdDeployer);
    // const buyeramount = 400000; // USD 400k for 3000 units of bond
    const selleramount = 3000;

    const tx1 = await bond.connect(seller).approve(dvd, selleramount);
    await tx1.wait();

    const tx2 = await dvd.connect(seller).takeDVDTransfer(args.txid);
    await tx2.wait();
  })

// Commands
// npx hardhat run --network localhost scripts/deploy-all.js
// npx hardhat initialPositions --network localhost 
// npx hardhat buyerInitiateDvD --network localhost
// npx hardhat sellerTakeDvD --network localhost --txid 0xf16e4de5dc2dd6207642bfc502f2b810baee13b6bcfcdad9b76463b43075d370
// 
// npx hardhat showAssetBalance --network localhost
