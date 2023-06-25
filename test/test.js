const { expect } = require('chai');
const Contract = require('../index.js');
const solc = require('solc');

describe('Comple of smart contract', () => {
    it('standart compile with default solc version: ' + solc.version(), async () => {
        let b = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800' });
        expect(b.name).to.be.equal('MSGSender_v800');
    });

    it('compile with local alternative compiler version v0.4.26 downloaded from remote', async () => {
        let a = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: 'v0.4.26+commit.4563c3fc' });
        expect(a.name).to.be.equal('MSGSender_v426');
    });

    // it('compile with local alternative compiler version v0.4.26', async () => {
    //     let a = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426', compilerVersion: '0.4.26' });
    //     expect(a.name).to.be.equal('MSGSender_v426');
    // });

    it('compile with a local alternative solc version v0.8.20', async () => {
        let a = new Contract({ filePath: __dirname + '/test_contracts/b.sol', contractName: 'MSGSender_v800', compilerVersion: '0.8.20' });
        expect(a.name).to.be.equal('MSGSender_v800');
    });

    it('replacing contract name', async () => {
        let a = new Contract({ filePath: __dirname + '/test_contracts/a.sol', contractName: 'MSGSender_v426_replaced', compilerVersion: 'v0.4.26+commit.4563c3fc', replacements: { 'MSGSender_v426': 'MSGSender_v426_replaced' } });
        expect(a.name).to.be.equal('MSGSender_v426_replaced');
    });
});




