const solc = require('solc');
const fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3();
const DEBUG = process.env.DEBUG || false;

class Contract {
    /**
     * 
     * @param {Object} param
     * @param {string} param.filePath path to solidity source file  
     * @param {string} param.sourceCode
     * @param {Object} param.replacements {key:value} object, key is the value to be replaced, and value is what will be instead on source code
     * @param {string} param.contractName name of solidity contract inside source file 
     */
    constructor(param) {

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
            let solc_alerrnative = null;
            try {
                solc_alerrnative = require('solc_' + param.compilerVersion);
            } catch (error) { }

            if (solc_alerrnative) {
                if (DEBUG) console.log('using local alternative compiler version:', solc_alerrnative.version());
                this._compile(solc_alerrnative);
            } else {
                if (DEBUG) console.log('using remote compiler version:', param.compilerVersion, 'downloading...');
                if (!param.compilerVersion.includes('commit')) throw new Error('compiler version must include commit hash, like v0.8.20+commit.5b0b510c see https://etherscan.io/solcversions for available versions');
                if (!param.compilerVersion.includes('v')) param.compilerVersion = 'v' + param.compilerVersion;

                // if compiler version is not installed, will be downloaded from remote
                this._remoteCompiler(param.compilerVersion);
            }
        } else {
            if (DEBUG) console.log('using local compiler version:', solc.version());
            this._compile(solc);
        }
    }


    _compile = (_solc) => {

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

        var haveErrors = false;
        let output = null;

        // if (_solc.version().includes('0.4.26')) {
        //     output = _solc.compile({ sources: input.sources },1);
        // }
        output = _solc.compile(JSON.stringify(input));
        if (output.errors) {
            console.log('compiling contract', output.errors);
            haveErrors = 1;
        } else {
            this.compilerOutput = JSON.parse(output);
            this.compilerOutput.errors?.forEach(error => {
                if (error.type == 'CompilerError' || error.type == 'ParserError') {
                    console.error('compiler error:', error);
                    haveErrors = 1;
                }
            });
        }
        if (haveErrors) throw new Error("CONTRACT NOT COMPILED");

        // Clean up after solidity. Note you must run this after calling solc.compile().
        //process.removeAllListeners("uncaughtException");
        //process.removeAllListeners('unhandledRejection');

        var listeners = process.listeners("uncaughtException");
        var solc_listener = listeners[listeners.length - 1];
        if (solc_listener) process.removeListener("uncaughtException", solc_listener);

        listeners = process.listeners("unhandledRejection");
        solc_listener = listeners[listeners.length - 1];
        if (solc_listener) process.removeListener("unhandledRejection", solc_listener);

        let abi = this.compilerOutput.contracts['source1.sol'][this.name].abi;
        this.contract = new web3.eth.Contract(abi);

        this.bytecode = this.compilerOutput.contracts['source1.sol'][this.name].evm.bytecode.object;
        this.methods = this.contract.methods;
        this.deploy = this.contract.deploy;
    }

    _remoteCompiler = async (compilerVersion) => {
        const thisCtx = this;
        return new Promise((resolve, reject) => {
            solc.loadRemoteVersion(compilerVersion, function (err, solcSnapshot) {
                if (err) {
                    console.error('error loading remote compiler version:', compilerVersion, err);
                    return reject(err);
                }
                thisCtx._compile(solcSnapshot);
                resolve(thisCtx);
            });
        });
    }


    /**
     * @param {String} func function, like declared in solidity
     * @returns {String} function selector
    */
    getFuncHash = (func) => {
        return "0x" + this.compilerOutput.contracts['source1.sol'][this.name].evm.methodIdentifiers[func];
    }

    /**
     * Returns bytecode for contract creation
     * @param {Array} args constructor arguments in order as declared in source code 
     * @returns {String} bytecode for contract creation
     */
    getDeployData = (args = []) => {
        return this.contract.deploy({
            data: this.compilerOutput.contracts['source1.sol'][this.name].evm.bytecode.object,
            arguments: args
        }).encodeABI();
    }

}

module.exports = Contract;
