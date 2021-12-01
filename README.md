# DEX EatTheBlocks

_This project is a decentralized exchange created for trade and create limit orders. Is a DEMO builded thanks to the course EathTheBlocks_

## Starting 🚀

_To run corretly this project locally, you need to have npm and truffle installed. Also you will need have installed metamask extension in your browser and add a custome rpc (truffle develop)._

The new RPC URL it will be [http://127.0.0.1:9545](https://www.trufflesuite.com/docs/truffle/getting-started/truffle-with-metamask) 
The chain Id it will be _1337_

_Also, you will need to copy the Mnemonic code into your metamask to use the fake accounts.

## Running the project 📦

_To run this project locally, you will need to follow the next steps._

Inside Dex, you wil run in your terminal the next commands:
```
truffle develop
```
And inside the truffle terminal
```
migrate --reset
```

Then inside client you only need to run
```
npm start
```

### Pre-requirements 📋

_You will need to install the next libraries to run this project. For truffle will need to be installed in your machine. The others ones could be installed using only the command npm i_

```
npm install -g truffle
```
```
yarn add @openzeppelin/contracts
```
```
yarn add @openzeppelin/test-helpers
```

### Installing 🔧

_You can run a simple command to install everything_


```
yarn 
```

## Testings ⚙️

_To test the functions from the smart contract._

```
truffle test
```
### What we are testing 🔩

_Is very expensive to deploy and check later if our Smart Contract is working, to avoid this, we test internally all the function that we are going to use._


## Builded with 🛠️

* [React](https://es.reactjs.org/) - Framework web
* [Solidity](https://solidity-es.readthedocs.io/es/latest/) - Smart Contract Language
* [REMIX](https://remix.ethereum.org/) - Used first to write the Smart Contract and check issues or errors
* [Truffle](https://www.trufflesuite.com/) - Used for deployment and testing locally


## Thanks to 🎁

* EatTheBlocks 

