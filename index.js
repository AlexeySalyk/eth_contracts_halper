const solc = require('solc');
const fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3();

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

        this.name = param.contractName;

        if (param.filePath) {
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
                    this.sourceCode = this.sourceCode.replace(key, replace);
                }
            }
        }

        //compile
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
            }
        };

        this.compilerOutput = JSON.parse(solc.compile(JSON.stringify(input)));

        var haveErrors = false;
        this.compilerOutput.errors.forEach(error => {
            if (error.type == 'CompilerError' || error.type == 'ParserError') {
                console.log(error);
                haveErrors = 1;
            }
        });
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

        let abi = this.compilerOutput.contracts['source1.sol'][param.contractName].abi;
        this.contract = new web3.eth.Contract(abi);


        this.methods = this.contract.methods;
        this.deploy = this.contract.deploy;
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
        //console.log(this.compilerOutput.contracts['source1.sol'][this.name].evm.bytecode.object);
        //console.log(args)

        return this.contract.deploy({
            data: this.compilerOutput.contracts['source1.sol'][this.name].evm.bytecode.object,
            arguments: args
        }).encodeABI();
    }

}

module.exports = Contract;