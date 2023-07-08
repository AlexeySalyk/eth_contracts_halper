const { expect } = require('chai');
const Contract = require('../index.js');
const solc = require('solc');

describe('Comple of smart contract', () => {
    it('standart compile with default solc version: ' + solc.version(), async () => {
        let ctr = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800' });
        let deployMsgData = ctr.getDeployData();
        expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
        expect(ctr.compiledWithVersion).to.be.equal(solc.version());
    });

    it('compile with local alternative compiler version v0.4.26', async () => {
        let ctr = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: '0.4.26' });
        let deployMsgData = ctr.getDeployData();
        expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
        expect(ctr.compiledWithVersion).to.be.equal('0.4.26+commit.4563c3fc.Emscripten.clang');
    });

    it('compile with a local alternative solc version v0.8.20', async () => {
        let ctr = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800', compilerVersion: '0.8.20' });
        let deployMsgData = ctr.getDeployData();
        expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
    });

    it('compile with alternative compiler version v0.4.26 downloaded from remote', async () => {
        let ctr = await new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: 'remote' }).remoteCompiler('v0.4.26+commit.4563c3fc');
        let deployMsgData = ctr.getDeployData();
        expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
    });

    it('replacing contract name', async () => {
        let ctr = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426_replaced', compilerVersion: '0.4.26', replacements: { 'MSGSender_v426': 'MSGSender_v426_replaced' } });
        expect(ctr.sourceCode).to.be.contain('MSGSender_v426_replaced');
    });
});

describe('Test of class functions', () => {
    describe('getFunctionSignature', () => {
        it('compile with default solc version: ' + solc.version(), async () => {
            let ctr = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800' });
            let funcHash = ctr.getFuncHash('kill()');
            expect(funcHash).to.be.equal('0x41c0e1b5');
            expect(ctr.compiledWithVersion).to.be.equal(solc.version());
        });

        it('compile with local alternative compiler version v0.4.26', async () => {
            let ctr = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: '0.4.26' });
            let funcHash = ctr.getFuncHash('kill()');
            expect(funcHash).to.be.equal('0x41c0e1b5');
        });

        it('compile with a local alternative solc version v0.8.20', async () => {
            let ctr = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800', compilerVersion: '0.8.20' });
            let funcHash = ctr.getFuncHash('kill()');
            expect(funcHash).to.be.equal('0x41c0e1b5');
        });

        it('compile with alternative compiler version v0.4.26 downloaded from remote', async () => {
            let ctr = await new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: 'remote' }).remoteCompiler('v0.4.26+commit.4563c3fc');
            let funcHash = ctr.getFuncHash('kill()');
            expect(funcHash).to.be.equal('0x41c0e1b5');
        });
    });

    describe('getDeployMsgData', () => {

        it('comile with default solc version: ' + solc.version(), async () => {
            let ctr = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800' });
            let deployMsgData = ctr.getDeployData();
            expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
            expect(ctr.compiledWithVersion).to.be.equal(solc.version());
        });

        it('compile with local alternative compiler version v0.4.26', async () => {
            let ctr = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: '0.4.26' });
            let deployMsgData = ctr.getDeployData();
            expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
        });

        it('compile with a local alternative solc version v0.8.20', async () => {
            let ctr = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800', compilerVersion: '0.8.20' });
            let deployMsgData = ctr.getDeployData();
            expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
        });

        it('compile with alternative compiler version v0.4.26 downloaded from remote', async () => {
            let ctr = await new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: 'remote' }).remoteCompiler('v0.4.26+commit.4563c3fc');
            let deployMsgData = ctr.getDeployData();
            expect(deployMsgData.slice(0, 6)).to.be.equal('0x6080');
        });
    });
});



