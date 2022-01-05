var target = args[0]
var securityThresh = getServerMinSecurityLevel(target) + 5;
//max server money
var moneyThresh = getServerMaxMoney(target);

//initial security level


//get ram costs of different scripts
var wRAM = getScriptRam("weaken.script");
var gRAM = getScriptRam("grow.script")
var hRAM = getScriptRam("hack.script")

//get hostname of current machine
var hostname = getHostname()


//manager

while (true) {
	//weaken server to desired level
	if (getServerSecurityLevel(target) > securityThresh) {
		var cursecurity = getServerSecurityLevel(target)
		//number of threads to weaken security to min
		var wcycle = (cursecurity - securityThresh) / .05
		//free ram for weaken thread
		var freeRAMw = getServerMaxRam(hostname) - getServerUsedRam(hostname);
		//number of threads supported for weaken thread
		var wgtsupport = freeRAMw / wRAM
		//number of weaken threads needed 
		var wgtneeded = wRAM * wcycle
		//do we have more ram than is needed?
		if (wgtsupport > wgtneeded) {
			//if yes, use exact number of threads to weaken
			var wthreads = Math.ceil(wcycle)
		}
		//if no, cap to the max 
		else { var wthreads = Math.floor(wgtsupport) }
		toast(wthreads + " Weaken threads")
		//get time to weaken
		var wtime = getWeakenTime(target)
		//execute command on server
		run("weaken.script", wthreads, target);
		//wait for weaken script to finish
		sleep(wtime + 1000);
		//check to make sure weaken script isn't running
		var wrun = isRunning("weaken.script", hostname, wthreads, target)
		//if it is, wait for it...
		if (wrun == true) { sleep(750) }
		sleep(500)

	}
	//grow  
	else if (getServerMoneyAvailable(target) < moneyThresh) {
		//get new weaken time

		//if the amount of money on the server is less than half of our goal
		if (getServerMoneyAvailable(target) <= .5 * moneyThresh) {
			//find out how much growth is needed
			var totalgrowth = moneyThresh / getServerMoneyAvailable(target)
			//SPAM this many growth cycles
			var gcycle = Math.ceil(growthAnalyze(target, totalgrowth))
		}
		else {
			//run as many growth cycles that are needed.
			var gcycle = Math.ceil(growthAnalyze(target, 2))
		}
		//security increase for all cycles required
		var gcyclesec = gcycle * .004
		//number of weaken threads to undo grow increase
		var wgcycle = Math.ceil(gcyclesec / .05)



		//how much free ram do we have
		var freeRAMg = getServerMaxRam(hostname) - getServerUsedRam(hostname);
		//how much free ram do we need?
		// total ram needed for weaken threads 
		var wgRAMneeded = wRAM * wgcycle
		//Script size times the number of cycles
		var gRAMneeded = (gRAM * gcycle) + (wgRAMneeded)
		//RAM impact of weaken cycles

		//actual free ram
		var afr = freeRAMg - wgRAMneeded

		//do we need more ram than we have available?
		if (gRAMneeded > afr) {
			//yes
			var gthreads = Math.floor((afr / gRAM))
			toast("IF")
		}
		//no
		else {
			var gthreads = Math.ceil(gcycle);
			toast("Else")
		}
		//get grow time
		var gtime = getGrowTime(target)
		//get weaken time
		var wtime = getWeakenTime(target)
		//random variables 
		var a = 7
		var b = 17
		//as negative time is not a thing if grow takes longer than weaken, start grow first
		if (gtime + 1000 >= wtime) {
			var wminusgt = gtime - wtime - 1000
			//run grow script using the number of threads specified in gthreads
			run("grow.script", gthreads, target, a);
			sleep(wminusgt)
			run("weaken.script", wgcycle, target, b);
			sleep(wtime + 1000);

			a++
			b++
		}
		else {
			//difference between weaken time and grow time ends 1000ms before weaken does allowing the script to have the same security level
			var wminusgt = wtime - gtime - 1000
			run("weaken.script", wgcycle, target, a);
			//sleep for the difference between weaken and growtime
			sleep(wminusgt)
			run("grow.script", gthreads, target), b;
			sleep(gtime + 1000);
			a++
			b++
		}



		var wrun = isRunning("weaken.script", hostname, wgcycle, target)
		var grun = isRunning("grow.script", hostname, gthreads, target)
		if (wrun == true) { sleep(750) }
		if (grun == true) { sleep(750) }
		sleep(500)
	}
	//hack
	else {



		var hcycle = Math.ceil(.50 / hackAnalyze(target))
		var whcyclesec = hcycle * .002
		var whcycle = Math.ceil(whcyclesec / .05)
		var whRAM = wRAM * whcycle
		var freeRAMh = getServerMaxRam(hostname) - getServerUsedRam(hostname) - (whRAM);
		if ((hRAM * hcycle) > (freeRAMh / hRAM)) {
			var hthreads = Math.floor(freeRAMh / hRAM)
		}
		else { var hthreads = Math.ceil(hcycle) }
		toast(hthreads + "Hack Threads ")



		// do we have enough free ram to grow AND weaken the server at the same time as our hack and weakens?

		var freeRAMgwh = getServerMaxRam(hostname) - getServerUsedRam(hostname) - whRAM - (hthreads * hRAM)
		//random argument to make scripts unique
		var t = 1
		var u = 13

		//Do we have more than 256 GB available? (CAN BE CHANGED)
		if (freeRAMgwh > 256) {

			//get new weaken time
			var wtime = getWeakenTime(target)
			//get grow time
			var gtime = getGrowTime(target)
			//get hack time
			var htime = getHackTime(target)
			//CALCULATING COSTS OF GROWING MONEY WHILE HACKING
			//number of grow cycles required to make back the money we're hacking
			var hgcycle = Math.ceil(growthAnalyze(target, 2))
			//amount of security increase for the number of needed grow thread
			var hgcyclesec = hgcycle * .004
			//number of weaken threads to undo grow increase
			var hwgcycle = Math.ceil(hgcyclesec / .05)
			// total ram needed for weaken threads 
			var hwgRAMneeded = wRAM * hwgcycle
			//total ram needed for grow threads
			var hgcycleRAMneeded = gRAM * hgcycle + hwgRAMneeded
			//find out the number of actual grow threads we can support
			var supportedhgthreads = Math.floor((freeRAMgwh - hwgRAMneeded) / gRAM)
			//Required number of weaken threads for the number of grow threads we can support
			var requiredwghthreads = Math.floor(supportedhgthreads / .05)
			//if the amount of RAM needed to undo is more than we have
			if (hwgRAMneeded > freeRAMgwh) {
				//yes
				var hgthreads = Math.floor((freeRAMgwh / gRAM))
				toast("IF")
			}
			//no
			else {
				var hgthreads = Math.ceil(hgcycle);
				toast("Else")
			}

			//difference between weaken time and grow time
			var wminusgtime = wtime - gtime
			//difference between sum of HACK and GROW and weaken
			var wait = (htime + gtime) - wtime
			//difference between weaken and hack
			var wminushtime = wtime - htime
			//difference between grow and hack
			var gminush = gtime - htime

			//start both weaken scripts
			//Order is going to be Hack,Weaken,Grow,Weaken
			run("weaken.script", hwgcycle, target, t)
			//wait a second to give the system a breather
			sleep(1250)
			run("weaken.script", whcycle, target, u);
			//Weaken = 4x Grow =3.2X Hack=1X
			//remove that second so that grow and hack end when the first weaken script does
			sleep(wminusgtime - 1050);
			run("grow.script", hgthreads, target, t)
			//remove a little bit of time so that hack comes first
			sleep(gminush-500)
			run("hack.script", hthreads, target, u);
			
			t++;
			u++;
			toast("Success")
			sleep(htime+5000)
		}
		else {

			//get grow time
			var gtime = getGrowTime(target)
			//get hack time
			var htime = getHackTime(target)
			//get new weaken time
			var wtime = getWeakenTime(target)

			var wminught = wtime - htime - 1000

			//difference between weaken time and hack time ends 1000ms before weaken does allowing the script to have the same security level
			var wminusht = wtime - htime - 350
			run("weaken.script", whcycle, target, u);
			//sleep for the difference between weaken and hack time
			sleep(wminusht)
			//then hack
			run("hack.script", hthreads, target, u);
			++u
			toast("failure")
			sleep(htime+5000)

		}
	}
}
