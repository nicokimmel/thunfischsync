const Logger = class {
	constructor() {
		this.logFile = "sync.log"
	}
	
	log(message, ip) {
		var timestamp = new Date().toLocaleTimeString("de-DE")
		var client = ip ? ` [${ip}] ` : " "
		console.log(`* ${timestamp}${client}${message}`)
		// TODO: Write to log file
	}
}