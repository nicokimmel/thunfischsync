const Lyrics = class {
	constructor(io) {
		this.finder = require("lyrics-finder")
		this.io = io
	}
	
	get(title, callback) {
		// Remove things like (Official Video)
		title = title.substring(0, title.indexOf("("))
		this.finder("", title).then((lyrics) => {
			callback(title, lyrics)
		})
	}
	
	send(room, client) {
		this.get(room.video.title, (title, lyrics) => {
			if(client) {
				client.emit("lyrics", title, lyrics)
			} else {
				this.io.in(room.id).emit("lyrics", title, lyrics)
			}
		})
	}
}