const ExcelJS = require('exceljs')

exports.parse =  function(filename) {
    return new ExcelJS.Workbook().xlsx.readFile(filename)
}

exports.getUserId = function(workbook) {
    return workbook.worksheets[0].getRow(1).getCell(2).value
}

exports.getStartDate = function(workbook) {
    return new Date(workbook.worksheets[0].getRow(2).getCell(2).value)
}

exports.getEndDate = function(workbook) {
    return new Date(workbook.worksheets[0].getRow(3).getCell(2).value)
}

exports.getLocalCurrency = function(workbook) {
    return workbook.worksheets[0].getRow(4).getCell(2).value
}

exports.getTimeZone = function(workbook) {
    return workbook.worksheets[0].getRow(5).getCell(2).value
}

exports.getLedgerEntries = function(workbook) {

    let ledgerEntries = []
    workbook.worksheets[0].eachRow((row, rowNumber) => {
        if (rowNumber > 9) {
            ledgerEntries.push({
                time: new Date(row.getCell(2).value + 'Z'),
                type: row.getCell(3).value,
                currency: row.getCell(4).value,
                grossAmount: row.getCell(5).value,
                fee: row.getCell(7).value,
                netAmount: row.getCell(9).value,
                note: row.getCell(11).value
            })
        }
    })

    return ledgerEntries
}

exports.getTrades = function(ledgerEntries) {

    let trades = []
    let currentTrade;

    for (var i = 0; i < ledgerEntries.length; i++) {

        /**
         * TODO The notion of asset pair (base and quote currencies) doesn't
         * exist in SB's account statement, therefore we use commonly
         * traded pairs.
         *
         * We also assume that a Sell always appear right before the
         * corresponding Buy and that the fee is always paid in the
         * bought currency.
         */

        if (ledgerEntries[i].type == 'Sell') {
            currentTrade = {
                time: ledgerEntries[i].time,
                buyCurrency : undefined,
                amount: undefined,
                fee: undefined,
                sellCurrency: ledgerEntries[i].currency,
                cost: ledgerEntries[i].grossAmount,
                note: ledgerEntries[i].note,
            }
        }
        else if (ledgerEntries[i].type == 'Buy') {
            currentTrade.buyCurrency = ledgerEntries[i].currency
            currentTrade.amount = ledgerEntries[i].netAmount
            currentTrade.fee = ledgerEntries[i].fee
            currentTrade.note += '. ' + ledgerEntries[i].note

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
    return ledgerEntries.filter(entry => entry.type == 'Earnings' && entry.note == '')
}

exports.getEarnings = function(ledgerEntries) {
    return ledgerEntries.filter(entry => entry.type == 'Earnings' && entry.note == 'Yield earnings')
}
