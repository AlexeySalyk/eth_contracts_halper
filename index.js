const solc = require('solc');
const fs = require('fs');
var Web3 = require('web3');
const DEBUG = process.env.DEBUG || false;

class Contract {
    /**
     * 
     * @param {Object} param
     * @param {string} param.filePath path to solidity source file  
     * @param {string} param.sourceCode
     * @param {Object} param.replacements {key:value} object, key is the value to be replaced, and value is what will be instead on source code
     * @param {string} param.contractName name of solidity contract inside source file 
     * @param {string} param.compilerVersion version of solidity compiler, like 0.8.20
     * @param {string} param.web3Provider web3 provider, like http://localhost:8545 (uused for contract method calls)
     * @param {string} param.address contract address (used for contract method calls)
     */
    constructor(param) {

        this.web3 = new Web3(param.web3Provider || 'http://localhost:8545');
        if(param.address) this.address = param.address;

        // loading source code
        if (param.filePath) {
            if (this.sourceCode) console.error('the source code already passed to constructor by filePath, and will be ignored');
            this.sourceCode = fs.readFileSync(param.filePath, { encoding: 'utf8', flag: 'r' });
        } else if (param.sourceCode) {
            this.sourceCode = param.sourceCode;
        } else {
            throw new Error('source code not passed to constructor');
        }
        if (param.replacements) {
            for (const key in param.replacements) {
                if (Object.hasOwnProperty.call(param.replacements, key)) {
                    const replace = param.replacements[key];
                    this.sourceCode = this.sourceCode.replaceAll(key, replace);
                }
            }
        }

        // checking contract name and presence in source code
        if (!param.contractName) throw new Error('contract name not passed to constructor');
        this.name = param.contractName;
        if (!this.sourceCode.includes('contract ' + this.name)) throw new Error('contract ' + this.name + ' not found in file ' + param.filePath);

        // loading compiler
        if (param.compilerVersion) {
            if (param.compilerVersion == 'remote') return;
            try {
                let solc_alerrnative = require('solc_' + param.compilerVersion);
                if (DEBUG) console.log('using local alternative compiler version:', solc_alerrnative.version());
                this._compile(solc_alerrnative);
            } catch (error) {
                console.error('error (use compilerVersion: "remote" for remote ver.) loading local alternative compiler:', error);
            }
        } else {
            if (DEBUG) console.log('using default compiler version:', solc.version());
            this._compile(solc);
        }
    }

    // properties:
    sourceCode = null;
    name = null;
    web3 = null;
    address = null;

    contract = null;
    bytecode = null;
    methods = null;
    deployed = null;
    functionHashes = null;
    compiledWithVersion = null; // version used to compile contract


    _compile = (_solc, remote = false) => {
        //Old library version (only for local package)
        if (_solc.version().includes('0.4.26') && !remote) {
            let output = _solc.compile(this.sourceCode, 1);
            let ctr = output.contracts[':' + this.name];
            if (!ctr) {
                output.errors.forEach(element => {
                    console.error(element);
                });
                throw new Error("CONTRACTS NOT COMPILED");
            }

            let abi = JSON.parse(ctr.interface);
            this.contract = new this.web3.eth.Contract(abi);
            if(this.address) this.contract.options.address = this.address;

            this.bytecode = ctr.bytecode;
            this.methods = this.contract.methods;
            this.deploy = this.contract.deploy;
            this.functionHashes = ctr.functionHashes;
        } else {  // New library version    
            // compiler config
            var input = {
                language: 'Solidity',
                sources: {
                    'source1.sol': {
                        content: this.sourceCode
                    }
                },
                settings: {
                    outputSelection: {
                        '*': {
                            '*': ['*']
                        }
                    },
                    optimizer: {
                        // disabled by default
                        enabled: true,
                        // Optimize for how many times you intend to run the code.
                        // Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
                        runs: 200
                    },
                    //stopAfter: "parsing",
                },
            };

            let output = _solc.compile(JSON.stringify(input));
            output = JSON.parse(output);
            let haveErrors = false;
            output.errors?.forEach(error => {
                if (error.type == 'CompilerError' || error.type == 'ParserError') {
                    console.error('compiler error:', error);
                    haveErrors = 1;
                }
            });
            if (haveErrors) throw new Error("CONTRACT NOT COMPILED");

            let abi = output.contracts['source1.sol'][this.name].abi;
            this.contract = new this.web3.eth.Contract(abi);
            if(this.address) this.contract.options.address = this.address;

            this.bytecode = output.contracts['source1.sol'][this.name].evm.bytecode.object;
            this.methods = this.contract.methods;
            this.deploy = this.contract.deploy;
            this.functionHashes = output.contracts['source1.sol'][this.name].evm.methodIdentifiers;
        }

        // Clean up after solidity. Note you must run this after calling solc.compile().
        //process.removeAllListeners("uncaughtException");
        //process.removeAllListeners('unhandledRejection');

        var listeners = process.listeners("uncaughtException");
        var solc_listener = listeners[listeners.length - 1];
        if (solc_listener) process.removeListener("uncaughtException", solc_listener);

        listeners = process.listeners("unhandledRejection");
        solc_listener = listeners[listeners.length - 1];
        if (solc_listener) process.removeListener("unhandledRejection", solc_listener);

        this.compiledWithVersion = _solc.version();
    }

    /**
     * download remote compiler version and compile contract
     * @param {String} compilerVersion compiler version, like v0.8.20+commit.5b0b510c see https://etherscan.io/solcversions for available versions
     * @returns {Promise} promise with contract object
     */
    remoteCompiler = async (compilerVersion) => {
        if (DEBUG) console.log('using remote compiler version:', compilerVersion, 'downloading...');
        if (!compilerVersion.includes('commit')) throw new Error('compiler version must include commit hash, like v0.8.20+commit.5b0b510c see https://etherscan.io/solcversions for available versions');

        if (!compilerVersion.includes('v')) compilerVersion = 'v' + compilerVersion;
        const thisCtx = this;
        return new Promise((resolve, reject) => {
            solc.loadRemoteVersion(compilerVersion, function (err, solcSnapshot) {
                if (err) {
                    console.error('error loading remote compiler version:', compilerVersion, err);
                    return reject(err);
                }
                thisCtx._compile(solcSnapshot, 1);
                resolve(thisCtx);
            });
        });
    }


    /**
     * Returns function selector if function is declared in contract otherwise returns undefined
     * @param {String} func function, like declared in solidity -example myFunc(uint256,uint256)
     * @returns {String} function selector
    */
    getFuncHash = (func) => {
        return "0x" + this.functionHashes[func];
    }

    /**
     * Returns bytecode for contract creation
     * @param {Array} args constructor arguments in order as declared in source code 
     * @returns {String} bytecode for contract creation
     */
    getDeployData = (args = []) => {
        return this.contract.deploy({
            data: this.bytecode,
            arguments: args
        }).encodeABI();
    }

}

module.exports = Contract;
