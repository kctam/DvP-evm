// Not done yet

const {loadFixture,} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { ethers } = require("hardhat");

describe("DvD", () => {
    async function deployLockFixture() {
        const [usdDeployer, bondDeployer, dvdDeployer, buyer, seller] = await ethers.getSigner();
        const Usd = await ethers.getContractFactory("USD");
        const usd = await Usd.connect(usdDeployer).deploy();
        const Bond = await ethers.getContractFactory("Bond");
        const bond = await Bond.connect(bondDeployer).deploy();
        const DvdManager = await ethers.getContractFactory("DvDManager");
        const dvd = await DvdManager.connect(dvdDeployer).deploy();

        return { usd, bond, dvd, usdDeployer, bondDeployer, dvdDeployer, buyer, seller}
    }

    describe("Successful DvD", () => {
        it("")
    })

})