/** @param {NS} ns */
export async function main(ns) {
	var p = 0
	var tracker = []
	ns.disableLog('getServerMoneyAvailable')
	while (true) {
		var r = 0
		for (const s of ns.stock.getSymbols()) {
			var euro = 0
			var maxmoney = ns.getServerMoneyAvailable("home") - 100000
			var forcast = ns.stock.getForecast(s)
			//ns.tprint(s + ns.nFormat(forcast, '0.000'))
			if (forcast > .5) {
				var k = 1;
			}
			else if (forcast < .5) {
				var k = -1
			}
			else {
				var k = 0
			}
			var t = r * 2
			var pos = ns.stock.getPosition(s)
			var shares = pos[0]
			var maxshares = ns.stock.getMaxShares(s)
			var maxmoney = ns.getServerMoneyAvailable("home") * .8
			if (k == 1 && ((tracker.at(r + 1) == -1 || tracker.at(r + 1)) == 0)) {
				if (shares < maxshares - 1) {
					var sharesneeded = maxshares - shares
					var askprice = ns.stock.getAskPrice(s)
					if ((sharesneeded * askprice) < maxmoney) {
						var euro = ns.stock.buy(s, sharesneeded)
					}
					else {
						var euro = ns.stock.buy(s, maxmoney / askprice)
					}
					var after = ns.stock.getPosition(s)
					var sharesafter = after[0]
					var purchased = sharesafter - shares
					var sterling = euro * purchased
					if (purchased > 0) {
						ns.tprint("Shares bought for ", ns.nFormat(sterling, '($0.00 a)'))
					}
					var pos = ns.stock.getPosition(s)
					var shares = pos[0]
				}
			}
			if (k == -1) {
				var pricepaid = pos[1]
				var currentprice = ns.stock.getBidPrice(s)
				if (shares > 0) {
					var capital = (pricepaid * shares)
					var percentgain = 1 - ((currentprice / pricepaid))
					var dump = ns.stock.sell(s, shares)
					var aprofit = dump * shares
					var profitdollar = ns.nFormat(aprofit - capital, '($0.00 a)')
					var percent = ns.nFormat(percentgain, '0.000%')
					ns.tprint("Shares sold for ", profitdollar, "     ", percent)
				}
			}
			if (forcast > .5) {
				var p = 1
			}
			else if (forcast < .5) {
				var p = -1
			}
			else {
				var p = 0
			}
			tracker.splice(t, 2)
			tracker.push(s, p)
			r++
		}
		await ns.sleep(1000)
	}
}
