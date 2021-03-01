const ExcelJS = require('exceljs')

exports.parse =  function(filename) {
    return new ExcelJS.Workbook().xlsx.readFile(filename)
}

exports.getUserId = function(workbook) {
    return workbook.worksheets[0].getRow(1).getCell(2).value
}

exports.getDateRange = function(workbook) {
    return {
        start: new Date(workbook.worksheets[0].getRow(2).getCell(2).value),
        end: new Date(workbook.worksheets[0].getRow(3).getCell(2).value)
    }
}

exports.getLedgerEntries = function(workbook) {

    let entries = []
    let balances = {}

    workbook.worksheets[0].eachRow((row, rowNumber) => {
        if (rowNumber > 9) {

            let type = row.getCell(3).value
            let currency = row.getCell(4).value
            let netAmount = row.getCell(9).value
            let decrease = type == 'Withdrawals' || type == 'Sell'

            // compute the balance of each asset
            balances[currency] = (balances[currency] ? balances[currency] : 0) + (decrease ? -netAmount : netAmount)

            entries.push({
                time: new Date(row.getCell(2).value + 'Z'),
                type: type,
                currency: currency,
                grossAmount: row.getCell(5).value,
                fee: row.getCell(7).value,
                netAmount: netAmount,
                balance: balances[currency],
                note: row.getCell(11).value
            })
        }
    })

    return entries
}

exports.getTrades = function(ledgerEntries) {

    let trades = []
    let currentTrade;

    for (var i = 0; i < ledgerEntries.length; i++) {

        /*
         * We assume that a Sell always appear right before the corresponding
         * Buy and that the fee is always paid in the bought currency.
         */

        if (ledgerEntries[i].type == 'Sell') {
            currentTrade = {
                time: ledgerEntries[i].time,
                buy: undefined,
                sell: {
                    currency: ledgerEntries[i].currency,
                    amount: ledgerEntries[i].grossAmount,
                    fee: 0,
                    misc: ledgerEntries[i].note
                }
            }
        }
        else if (ledgerEntries[i].type == 'Buy') {

            currentTrade.buy = {
                currency: ledgerEntries[i].currency,
                amount: ledgerEntries[i].netAmount,
                fee: ledgerEntries[i].fee,
                misc: ledgerEntries[i].note
            }

            trades.push(currentTrade)
            currentTrade = null
        }
    }

    return trades
}

exports.getDeposits = function(ledgerEntries) {
    return ledgerEntries.filter(entry => entry.type == 'Deposit')
}

exports.getWithdrawals = function(ledgerEntries) {
    return ledgerEntries.filter(entry => entry.type == 'Withdrawal')
}

exports.getRewards = function(ledgerEntries) {
    // exclude smart yield earnings
    return ledgerEntries.filter(entry => entry.type == 'Earnings' && entry.note == '')
}

exports.getEarnings = function(ledgerEntries) {
    // only return smart yield earnings
    return ledgerEntries.filter(entry => entry.type == 'Earnings' && entry.note == 'Yield earnings')
}
