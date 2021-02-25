const exceljs = require('exceljs')

const workbook = new exceljs.Workbook()

function getUserId(workbook) {
    return workbook.worksheets[0].getRow(1).getCell(2).value
}

function getStartDate(workbook) {
    return workbook.worksheets[0].getRow(2).getCell(2).value
}

function getEndDate(workbook) {
    return workbook.worksheets[0].getRow(3).getCell(2).value
}

function getLocalCurrency(workbook) {
    return workbook.worksheets[0].getRow(4).getCell(2).value
}

function getTimeZone(workbook) {
    return workbook.worksheets[0].getRow(5).getCell(2).value
}

function getLedgerEntries(workbook) {

    var entries = []
    workbook.worksheets[0].eachRow((row, rowNumber) => {
        if (rowNumber > 8) { // TODO
            entries.push({
                time: row.getCell(2).value,
                type: row.getCell(3).value,
                currency: row.getCell(4).value,
                grossAmount: row.getCell(5).value,
                fee: row.getCell(7).value,
                netAmount: row.getCell(9).value,
                note: row.getCell(11).value
            })
        }
    })

    return entries
}

function getTrades(entries) {

    var trades = []
    var currentTrade = undefined

    for (var i = 0; i < entries.length; i++) {

        /**
         * TODO The notion of asset pair (base and quote currencies) doesn't
         * exist in SB's account statement, therefore we use commonly
         * traded pairs.
         *
         * We also assume that a Sell always appear right before the
         * corresponding Buy and that the fee is always paid in the
         * bought currency.
         */

        if (entries[i].type == 'Sell') {
            currentTrade = {
                time: entries[i].time,
                sellCurrency: entries[i].currency,
                cost: entries[i].grossAmount,
                note: entries[i].note
            }
        }
        else if (entries[i].type == 'Buy') {
            currentTrade.buyCurrency = entries[i].currency
            currentTrade.grossAmount = entries[i].grossAmount
            currentTrade.netAmount = entries[i].netAmount
            currentTrade.fee = entries[i].fee
            currentTrade.note += '. ' + entries[i].note

            trades.push(currentTrade)
            currentTrade = undefined
        }
    }

    return trades
}

workbook.xlsx.readFile('account-statement.xlsx')
    .then(r => getLedgerEntries(r))
    .then(entries => console.log(getTrades(entries)))