const sas = require('./index.js')

sas.parse('test/account-statement-test.xlsx')
    .then(wb => {

        console.log(sas.getUserId(wb))
        console.log(sas.getDateRange(wb))

        const ledgerEntries = sas.getLedgerEntries(wb)
        console.log(ledgerEntries)
        //console.log(sas.getTrades(ledgerEntries))
        //console.log(sas.getDeposits(ledgerEntries))
    })