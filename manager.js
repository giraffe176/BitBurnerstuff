/** @param {NS} ns */
export async function main(ns) {
	var target = ns.args[0]
	ns.disableLog("getServerMaxRam")
	ns.disableLog("getServerUsedRam")
	ns.disableLog("run")
	ns.disableLog("sleep")
	ns.disableLog("getServerMaxMoney")
	ns.disableLog("getServerMinSecurityLevel")
	ns.disableLog("getServerSecurityLevel")
	ns.disableLog("getServerMoneyAvailable")
	var securityThresh = ns.getServerMinSecurityLevel(target) + 3;
	//max server money
	var moneyThresh = ns.getServerMaxMoney(target) * .99;
	function moneyavailable(target) {
		var amoney = ns.getServerMoneyAvailable(target)
		if (amoney == 0) { amoney = 1 }
		return amoney;
	}
	//get ram costs of different scripts
	var wRAM = ns.getScriptRam("weaken.script");
	var gRAM = ns.getScriptRam("grow.script")
	var hRAM = ns.getScriptRam("hack.script")
	//random argument to make scripts unique
	var t = 1
	var u = 13
	//random variables 
	var a = 7
	var b = 17
	//get hostname of current machine
	var hostname = ns.getHostname()
	function freeRAM(hostname) {
		return ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);
	}
	function gtime(target) {
		return ns.getGrowTime(target)
	}
	function wtime(target) {
		return ns.getWeakenTime(target);
	}
	function htime(target) {
		return ns.getHackTime(target);
	}
	//manager
	while (true) {
		//This many growth threads are required to double our money
		var gcycle = Math.floor(ns.growthAnalyze(target, 2))
		//RAM impact of required growth AND weaken  threads
		var gRAMneeded = (gRAM * gcycle)
		//security increase for all growth threads required
		var gcyclesec = gcycle * .004
		//number of weaken threads to undo grow increase
		var wgcycle = Math.ceil(gcyclesec / .05)
		//RAM impact of needed weaken threads
		var wRAMneeded = wRAM * wgcycle
		//weaken server to desired level
		if (ns.getServerSecurityLevel(target) > securityThresh) {

			var cursecurity = ns.getServerSecurityLevel(target)
			//number of threads to weaken security to min
			var wcycle = (cursecurity - securityThresh) / .05
			//number of threads supported for weaken thread
			var wgtsupport = freeRAM(hostname) / wRAM
			//number of weaken threads needed 
			var wgtneeded = wRAM * wcycle
			//do we have more ram than is needed?
			if (wgtsupport > wgtneeded) {
				//if yes, use exact number of threads to weaken
				var wthreads = Math.floor(wcycle)
			}
			//if no, cap to the max 
			else { var wthreads = Math.floor(wgtsupport) }
			//execute command on server
			if (wthreads <= 1) { var wthreads = 1 }
			ns.print("Weaken Phase    "+wthreads + "wThreads     ")
			ns.run("weaken.script", wthreads, target);
			//wait for weaken script to finish
			await ns.sleep(target + 1000);
			//check to make sure weaken script isn't ns.running
			var wrun = ns.isRunning("weaken.script", hostname, wthreads, target)
			//if it is, wait for it...
			if (wrun == true) { await ns.sleep(750) }
			await ns.sleep(500)
			ns.print("Complete")
			var t = 1
			var u = 13
		}
		//grow  
		else if (moneyavailable(target) < moneyThresh) {

			//if the amount of money on the server is less than half of our goal
			if (moneyavailable(target) <= .5 * moneyThresh) {
				//find out how much growth is needed
				var totalgrowth = moneyThresh / moneyavailable(target)
				if (totalgrowth <= 1) { totalgrowth = 1.0001 }
				//SPAM this many growth cycles
				var gcycle = Math.ceil(ns.growthAnalyze(target, totalgrowth))
			}
			// total ram needed for weaken threads 
			var wgRAMneeded = wRAM * wgcycle
			//Script size times the number of cycles
			var gRAMneeded = (gRAM * gcycle) + (wRAMneeded)

			//actual free ram
			var afr = freeRAM(hostname) - wgRAMneeded
			//do we need more ram than we have available?
			if (gRAMneeded > afr) {
				//yes
				var gthreads = Math.floor((afr / gRAM))
			}
			//no
			else {
				var gthreads = Math.floor(gcycle);
			}
			if (gthreads <= 1) { var gthreads = 1 }
			if (wgcycle <= 1) { var wgcycle = 1 }
			
			ns.run("grow.script", gthreads, target, a);
			if (wgRAMneeded + gRAMneeded < freeRAM(hostname)) { ns.run("weaken.script", wgcycle, target, b) }
			if (wgRAMneeded + gRAMneeded > freeRAM(hostname)) {
				var wgcycle = Math.floor((freeRAM(hostname) / wRAM))
				
				ns.run("weaken.script", wgcycle, target, b)
			}

			ns.print("Grow Phase     "+wgcycle + "wThreads     " + gthreads + "gThreads")
			//ns.run grow script using the number of threads specified in gthreads
			await ns.sleep(wtime(target) + 1000);
			a++
			b++
			var wrun = ns.isRunning("weaken.script", hostname, wgcycle, target)
			while (wrun == true) { await ns.sleep(750) }
			await ns.sleep(500)
			ns.print("Complete")
			var t = 1
			var u = 13
		}
		//hack
		else {
			//how many threads are required to hack half the server's money?
			var hcycle = Math.ceil(.50 / ns.hackAnalyze(target))
			//security increase of all these threads
			var hcyclesec = hcycle * .002
			//RAM impact of hack
			var hRAM = hRAM * hcycle
			//how many weaken cycles are required to undo the hack
			var whcycle = Math.floor(hcyclesec / .05)
			//RAM impact of this
			var whRAM = wRAM * whcycle
			//RAM LEFT OVER for hacking =
			var freeRAMh = freeRAM(hostname) - whRAM;
			if (((hRAM + whRAM) > (freeRAMh / hRAM))) {
				var hthreads = Math.floor(freeRAMh / hRAM)
			}
			else { var hthreads = hcycle }
			//Total RAM impact
			var totalramimpact = hthreads * hRAM + whRAM
			//Left over RAM
			var loRAM = target - totalramimpact
			//Do we have more than 256 GB available? (CAN BE CHANGED)
			if (loRAM > 256) {
				var gcycle = Math.floor(ns.growthAnalyze(target, 2))
				//RAM impact of needed weaken threads
				var wRAMneeded = wRAM * wgcycle
				//total ram needed for grow threads
				var hgcycleRAMneeded = gRAM * gcycle + wRAMneeded
				//find out the number of actual grow only threads we can support
				var supportedhgthreads = Math.floor(loRAM / gRAM)
				//Required number of weaken threads for the number of grow threads we can support
				var requiredwghthreads = Math.ceil(supportedhgthreads / .05)
				//RAM impact of these theoretical weaken threads
				var ramw = requiredwghthreads * wRAM
				//free RAM for grow
				var freeRAMg = loRAM - ramw
				//max supported number of grow threads
				var actualgrow = Math.floor(freeRAMg / gRAM)

				//if the required amount of ram is more than we have, use this number of threads
				if (hgcycleRAMneeded > loRAM) {
					//yes
					var hgthreads = actualgrow
				}
				//no
				else {
					var hgthreads = gcycle;
				}
				//how much did the security go up from that growth?
				var hgcyclesec = hgthreads * .004
				var anumweaken = Math.ceil(hgcyclesec / .05)
				//start both weaken scripts
				//Order is going to be Hack,Weaken,Grow,Weaken
				if (anumweaken <= 1) { var anumweaken = 1 }
				if (whcycle <= 1) { var whcycle = 1 }
				if (hgthreads <= 1) { var hgthreads = 1 }
				if (hthreads <= 1) { var hthreads = 1 }

				//Weaken = 4x Grow =3.2X Hack=1X
				//remove that second so that grow and hack end when the first weaken script does
				//wait a second to give the system a breather
				//remove a little bit of time so that hack comes first
				var arnum = anumweaken + whcycle
				ns.print("Hack Phase"+arnum + "wThreads     " + hcycle + "hThreads"+ hgthreads + "gThreads")
				ns.run("weaken.script", whcycle, target, t, "hac")
				await ns.sleep(500)
				ns.run("weaken.script", anumweaken, target, u, "gro");
				var wgtime = wtime(target) - gtime(target)
				await ns.sleep(wgtime - 250);
				ns.run("grow.script", hgthreads, target, t)
				var hgtime = gtime(target) - htime(target)
				await ns.sleep(hgtime - 500)
				ns.run("hack.script", hcycle, target, u);
				await ns.sleep(htime(target) + 500)
				if (ns.isRunning("weaken.script", ns.getHostname(), target, u) || ns.isRunning("weaken.script", ns.getHostname(), target, t) || ns.scriptRunning("grow.script", ns.getHostname(), target, t) || ns.scriptRunning("hack.script", ns.getHostname(), target, u) == true) { await ns.sleep(1000) }
				t++;
				u++;
				ns.print("Complete")
			}
			else {
				//get grow time
				var t = 1
				var u = 13

				if (whcycle <= 1) { var whcycle = 1 }
				if (hthreads <= 1) { var hthreads = 1 }
				ns.print("Hack Phase, no grow     "+whcycle + "wThreads     " + hthreads + "hThreads")
				ns.run("weaken.script", whcycle, target, u);
				//await ns.sleep for the difference between weaken and hack time
				//then hack
				ns.run("hack.script", hthreads, target, u);
				u++

				await ns.sleep(wtime(target) + 400)

			}
		}
	}
}
