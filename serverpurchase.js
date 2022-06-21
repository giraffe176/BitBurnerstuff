/** @param {NS} ns */
import { globalserverlist } from 'servers.js'
export async function main(ns) {
	var desiredname = ns.args[0];
	//var desiredram = args[1]
	var servermoney = ns.getServerMoneyAvailable("home");
	var max = (servermoney / (1375000) - 0);
	var powtwo = Math.floor(Math.log(max) / Math.log(2));
	ns.toast(powtwo);

	var serverRAM = Math.pow(2, powtwo) - 0
	ns.toast(serverRAM);
	var sel = ns.getPurchasedServers();
	var serll = sel.length;
	if (serverRAM > 1048576) { var serverRAM = 1048576 }
	if (serll > 0) {
		if (serverRAM <= (ns.getServerMaxRam(sel[0]) - 0)) {
			ns.toast("No upgrades can be afforded");
			var rusure = await ns.prompt("No upgrades can be afforded, are you sure you want to buy " + serverRAM + "GB servers?")
			if (rusure == false) {
				exit()
			}
		}
	}

	var i = 0;
	var confirm = await ns.prompt("Buy/Replace Servers with" + serverRAM + "GB");

	if (confirm = true) {


		for (const s of ns.getPurchasedServers()) {

			ns.killall(s)
			ns.deleteServer(s)

		}

		var q = 0
		while (q <= 24) {
			ns.purchaseServer(desiredname + "-" + q, serverRAM)
			++q;
		}




		for (const s of ns.getPurchasedServers()) {
			await ns.scp("CEO.js", s);
			await ns.scp("weaken.script", s);
			await ns.scp("growstock.js", s);
			await ns.scp("hack.script", s);
			for (const attack of globalserverlist) {

				ns.exec("CEO.js", s, 1, attack);
			}
		}

	}
	else { exit() }


}
