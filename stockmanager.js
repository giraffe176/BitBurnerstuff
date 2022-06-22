/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		for (const s of ns.stock.getSymbols()) {
			var forcast = ns.stock.getForecast(s)
			if (forcast >= .6) {
				var k = 1;
				var p = 1
			}
			else if (forcast <= .4) {
				var k = -1
				var p = -1
			}
			else (.4 < forcast < .6) {
				var k = 0
				var p = 0
			}
			var pos = ns.stock.getPosition(s)
			var shares = pos[0]
			var maxshares = ns.stock.getMaxShares(s)
			var maxmoney = ns.getServerMoneyAvailable("home") - 100000
			if (k == 1 && p == -1) {
				if (shares < maxshares - 1) {

					var sharesneeded = maxshares - shares
					var bidprice = ns.stock.getBidPrice(s)
					if (sharesneeded * bidprice < maxmoney) {
						ns.stock.buy(s, sharesneeded)

					}
					else (ns.stock.buy(s, maxmoney / bidprice))
				}
			}
			if (k == -1) {
				var pricepaid = pos[1]
				var currentprice = ns.stock.getAskPrice(s)

				if (shares > 0) {
					var profit = (currentprice * shares) - (pricepaid * shares)
					var profitdollar = ns.nFormat(profit,'($0.00 a)')
					
					var percentgain = (((currentprice / pricepaid)-1)*100)
					var percent = ns.nformat(percentgain,'0.000%')
					ns.tprint("Shares sold for ", profitdollar, "     ", percent)
					ns.stock.sell(s, shares)

				}


			}
		}
		await ns.sleep(1000)
	}
}
