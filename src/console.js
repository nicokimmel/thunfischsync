const Console = class {
	constructor() {
		this.readline = require("readline")
		this.dialog = this.readline.createInterface(process.stdin, process.stdout)
		this.commands = this.buildCommands()
		this.fixDialog(this.dialog)
		this.setDialog()
	}
	
	exec(command, options) {
		this.commands[command](options)
	}
	
	buildCommands() {
		return {
			help: () => {
				logger.log("\n help\n list\n shuffle roomname\n clear roomname\n create [roomname]\n delete roomname")
			},
			list: () => {
				var roomTable = {}
				roomList.forEach((room) => {
					roomTable[room.id] = {
						sticky: room.sticky,
						idle: room.idle,
						viewers: room.viewers,
						queue: room.queue.length,
						video: room.video.id,
						playing: room.playing,
						time: room.time,
						speed: room.speed,
						loop: room.loop,
					}
				})
				console.table(roomTable)
			},
			shuffle: (options) => {
				if(options.length > 0) {
					var room = roomList.get(options[0])
					room.shuffle()
					io.in(options[0]).emit("queue", room.queue)
					logger.log("Shuffled queue of room #" + options[0] + ".")
				}
			},
			clear: (options) => {
				if(options.length > 0) {
					var room = roomList.get(options[0])
					room.clear()
					io.in(options[0]).emit("queue", room.queue)
					logger.log(`Cleared queue of room #${room.id}.`)
				}
			},
			create: (options) => {
				var sticky = false
				if(options.length > 1) {
					sticky = options[1] === "true"
				}
				var room = roomList.create(options[0], sticky)
				logger.log(`Created room #${room.id}.`)
			},
			remove: (options) => {
				if(options.length > 0) {
					io.in(options[0]).disconnectSockets()
					roomList.remove(options[0])
				}
				logger.log(`Removed room #${options[0]}.`)
			},
			save: () => {
				roomList.save()
				logger.log(`Saved sticky rooms to disk.`)
			},
			rm: () => this.commands.delete(),
			ls: () => this.commands.list(),
		}
	}
	
	prompt() {
		this.dialog.prompt()
	}
	
	setDialog() {
		this.dialog.setPrompt("SYNC> ")
		this.dialog.on("line", (line) => {
			if(line.match(/^[a-zA-Z]+(\s#([A-Z0-9]{8})(\s[a-zA-Z]+)*)?$/)) {
				var cmd = line.split(" ")[0]
				var options = line.split(" ")
				//remove cmd in front
				options.shift()
				if(options.length > 0) {
					//remove # from roomName
					options[0] = options[0].substring(1)
				}
				if(this.commands[cmd]) {
					this.commands[cmd](options)
				}
			}
			this.dialog.prompt()
		})
		this.dialog.on("close", () => {
			process.exit(0)
		})
	}
	
	fixDialog(dialog) {
		var oldStdout = process.stdout
		var newStdout = Object.create(oldStdout)
		newStdout.write = function() {
			dialog.output.write("\x1b[2K\r")
			var result = oldStdout.write.apply(this, Array.prototype.slice.call(arguments))
			dialog._refreshLine()
			return result
		}
		process.__defineGetter__("stdout", function() { return newStdout })
	}
}