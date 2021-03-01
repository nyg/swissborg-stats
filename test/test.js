const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sas = require('../index')

chai.use(chaiAsPromised);
chai.should();

describe('Account Statement Parsing', function() {

    describe('#parse()', function() {

        it('should parse existing test file', function() {
            return sas.parse('test/account-statement-test.xlsx').should.be.fulfilled
        })

        it('should not parse unknown file', function() {
            return sas.parse('file not found').should.be.rejectedWith(Error, 'File not found: file not found')
        })
    })
})

describe('Account Statement Content', function() {

    let wb;
    this.beforeAll(async function () {
        wb = await sas.parse('test/account-statement-test.xlsx')
    })

    describe('Account Statement Header', function() {

        describe('#getUserId()', function() {
            it('should return a user id', function() {
                sas.getUserId(wb).should.equal('0123456789deadbeef0123456789babe')
            })
        })

        describe('#getDateRange()', function() {
            it('should return a date range', function() {
                let range = sas.getDateRange(wb)
                range.start.should.deep.equal(new Date('2021-01-01T00:00:00Z'))
                range.end.should.deep.equal(new Date('2021-02-15T00:00:00Z'))
            })
        })
    })

    describe('Account Statement Ledger', function() {

        describe('#getLedgerEntries()', function() {
            it('should return ledger entries', function() {
                sas.getLedgerEntries(wb).should.have.lengthOf(9)
            })
        })
    })

    describe('Account Statement Ledger Content', function() {

        let ledgerEntries;
        this.beforeAll(async function () {
            ledgerEntries = sas.getLedgerEntries(wb)
        })

        describe('#getDeposits()', function() {
            it('should return deposits', function() {
                const deposits = sas.getDeposits(ledgerEntries)
                deposits.should.have.lengthOf(1)
            })
        })

        describe('#getWithdrawals()', function() {
            it('should return withdrawals', function() {
                const withdrawals = sas.getWithdrawals(ledgerEntries)
                withdrawals.should.have.lengthOf(1)
            })
        })

        describe('#getTrades()', function() {
            it('should return trades', function() {
                const trades = sas.getTrades(ledgerEntries)
                trades.should.have.lengthOf(2)
            })
        })

        describe('#getRewards()', function() {
            it('should return rewards', function() {
                const rewards = sas.getRewards(ledgerEntries)
                rewards.should.have.lengthOf(1)
            })
        })

        describe('#getEarnings()', function() {
            it('should return smart yield earnings', function() {
                const rewards = sas.getEarnings(ledgerEntries)
                rewards.should.have.lengthOf(2)
            })
        })
    })
})
