# eth_contracts_halper

Utility for compiling and creating ethereum smart contracts

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install eth_contracts_halper.

```bash
npm install eth_contracts_halper
```

## Usage

- ## Simple usage

  ```js
  var contract = new Contract({
          filePath: __dirname + '/contranct.sol',
          contractName: 'CONTRACT'
  });
  console.log(contract.copiledWithVersion);
  ```

- ## Use alternative compiler version  
  
  You can use a localy installed alternative compiler version, if it is available.  
  List of installed version:
  - 0.8.20
  - 0.7.6
  - 0.4.26

  You can also check the [package.json](./package.json) file for more information about available compiler versions.  
  Alternative compiler version must be described like `"solc_0.8.20": "npm:solc@0.8.20"` in `dependencies` section.  

  For usage of alternative compiler version `INSTALLED LOCALY` you need to declare compiler version like `compilerVersion: '0.8.20'` (without commit hash)

  ```js
  var contract = new Contract({
        filePath: __dirname + '/contranct.sol',
        contractName: 'CONTRACT',
        compilerVersion: '0.8.20'
  });
  ```

- ## Use remote compiler version
  
  You can use a compiler version that is not installed locally.  
  Compiler version must be declared with commit hash, like in example below.  
  It will be downloaded but constuctor will not return the contrarct ready to use.  
  You neeed to declare 'remote' as compilerVersion, and end pass the verion in function remoteCompile() as argument. Using a remote compiler version requires asyncronous code and can't be used in constructor, for this reason you need to use a remoteCompile() function, that will return a promise.

  ```js
  var contract = new Contract({
        filePath: __dirname + '/contranct.sol',
        contractName: 'CONTRACT',
        compilerVersion: 'remote'
  });
  let contract = await contract.remoteCompile('v0.4.26+commit.4563c3fc')
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