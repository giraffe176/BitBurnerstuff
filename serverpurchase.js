var desiredname = args[0];
var attack = args[1];
//var desiredram = args[1]
var servermoney = getServerMoneyAvailable("home");
var max = (servermoney / (1375000) - 0);
var powtwo = Math.floor(Math.log(max) / Math.log(2));
toast(powtwo);

var serverRAM = Math.pow(2, powtwo) - 0
toast(serverRAM);
var sel = getPurchasedServers();
var serll = sel.length;
var wtime = getWeakenTime(attack) / 26

if (serll > 0) {
	if (serverRAM <= (getServerMaxRam(sel[0]) - 0)) {
		toast("No upgrades can be afforded");
		var rusure = prompt("No upgrades can be afforded, are you sure you want to buy " + serverRAM + "GB servers?")
		if (rusure == false) {
			exit()
		}
	}
}

var i = 0;
var confirm = prompt("Buy/Replace Servers with" + serverRAM + "GB");

if (confirm = true) {


	sel.foreach(function (s) {

		killall(s)
		deleteServer(s)

	})

	var q = 0
	while (q <= 24) {

		var hostname = purchaseServer(desiredname + "-" + q, serverRAM);
		scp("manager.js", hostname);
		scp("weaken.script", hostname);
		scp("growstock.js", hostname);
		scp("hack.script", hostname);
		exec("CEO.js", hostname, 1, attack);
		++q;
		sleep(wtime);
	}

}
else { exit() }
