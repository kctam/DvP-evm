require("@nomicfoundation/hardhat-toolbox");

task("initialPositions", "Predeposit asset to buyer and seller")
  .addParam("usd", "USD address")
  .addParam("bond", "Bond address")
  .setAction( async (args) => {
    const [usdDeployer, bondDeployer, dvdDeployer, buyer, seller] = await hre.ethers.getSigners();
    const usd = await hre.ethers.getContractAt("USD", args.usd, usdDeployer);
    const bond = await hre.ethers.getContractAt("Bond", args.bond, bondDeployer);
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