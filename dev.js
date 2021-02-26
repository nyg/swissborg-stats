const sas = require('./index.js')

sas.parse('test/account-statement-test.xlsx')
    .then(wb => {

        console.log(sas.getUserId(wb))
        console.log(sas.getStartDate(wb))
        console.log(sas.getEndDate(wb))
        console.log(sas.getLocalCurrency(wb))
        console.log(sas.getTimeZone(wb))

        const ledgerEntries = sas.getLedgerEntries(wb)
        console.log(sas.getTrades(ledgerEntries))
        console.log(sas.getDeposits(ledgerEntries))
    })