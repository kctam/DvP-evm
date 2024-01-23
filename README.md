# Demonstration of DvP (DvD) on EVM on Hardhat

Demo flow

Step 1: Install modules
```
npm install
```

Step 2: Launch a node in localhost
```
npx hardhat node
```

Step 3: In another terminal, deploy contracts, and check zero balances on all assets
```
npx hardhat run scripts/deploy-all.js
npx hardhat showAssetBalance
```

Step 4: Run task for initial position, and check balances
```
npx hardhat initialPositions
npx hardhat showAssetBalance
```

Step 5: Buyer initiates a DvP (DvD) for a fixed amount of USD 400,000 for 3,000 units of bonds
```
npx hardhat buyerInitiateDvD
```

Note the transfer ID.

Step 6: Seller takes this DvD, and check balances after the settlement
```
npx hardhat sellerTakeDvD --txid <transferID>
npx hardhat showAssetBalance
```

Demo ends. Press \<ctrl-c\> to quit the local node.