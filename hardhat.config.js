require("@nomicfoundation/hardhat-toolbox");
require("./tasks/all");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  solidity: "0.8.20",
};
