# eth_contracts_halper

utility for compiling and creating ethereum smart contracts

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install eth_contracts_halper.

```bash
npm install eth_contracts_halper
```

## Usage

```js
var contract = new Contract({
        filePath: __dirname + '/contranct.sol',
        contractName: 'CONTRANT'
});
```

Optionally you can use specific compiler version.  
Compiler version must be declared with commit hash, like in example below.  
If declared compiler version is not installed, it will be downloaded and constuctor will return promise.  
As alternative you can try to use a localy installed alternative compiler version, if it is available (look package.json, alternative compiler version must be described like `"solc_0.8.20": "npm:solc@0.8.20"` in `dependencies` section) in this case you need to declare compiler version like `compilerVersion: '0.8.20'` (without commit hash)

```js
var contract = new Contract({
        filePath: __dirname + '/contranct.sol',
        contractName: 'CONTRANT',
        compilerVersion: 'v0.4.26+commit.4563c3fc'
});
```

## Debugging

For debugging mode you need to set DEBUG environment variable  
example:  

```bash
DEBUG=true node index.js
```

## Tests

```bash
npm test
```

## License

[MIT](https://choosealicense.com/licenses/mit/)