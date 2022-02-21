const Room = class {
	constructor(roomId, sticky) {
		this.id = roomId
		this.sticky = sticky | false
		this.idle = 0
		this.viewers = 0
		this.playing = true
		this.time = 2222
		this.speed = 1.0
		this.loop = false
		this.queue = []
		this.video = {
			id: "9Ej-0VRWmI8",
			title: "Coral Reef Aquarium",
			thumbnail: "https://img.youtube.com/vi/9Ej-0VRWmI8/mqdefault.jpg",
			duration: 36049,
			tags: ["Thunfisch Sync", "Modern", "Simple", "Watch", "Listen", "Relax", "Together", "🐟"],
		}
	}
	
	next() {
		this.time = 0
		if(this.loop) {
			this.playing = true
			return
		}
		var nextVideo = this.queue.shift()
		if(!nextVideo) {
			this.playing = false
			return
		}
		this.playing = true
		this.video = nextVideo
	}
	
	clear() {
		this.queue = []
	}
	
	add(videos) {
		this.queue.push(...videos)
	}
	
	remove(index) {
		if(this.queue[index]) {
			this.queue.splice(index, 1)
		}
	}
	
	move(from, to) {
		var temp = this.queue[from]
		this.queue.splice(from, 1)
		this.queue.splice(to, 0, temp)
	}
	
	shuffle() {
		var j, x, i
		for(i = this.queue.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1))
			x = this.queue[i]
			this.queue[i] = this.queue[j]
			this.queue[j] = x
		}
		return this.queue
	}
		
	info() {
		return {
			id: this.id,
			sticky: this.sticky,
			idle: this.idle,
			viewers: this.viewers,
			playing: this.playing,
			time: this.time,
			speed: this.speed,
			loop: this.loop,
			queue: this.queue,
			video: this.video
		}
	}
}

const RoomList = class {
	constructor() {
		this.fs = require("fs")
		this.roomFile = "rooms.json"
        this.list = {}
    }
	
	create(id, sticky) {
		if(!id) {
            id = this.random()
        }
		var room = new Room(id, sticky)
        this.list[id] = room
        return room
	}
		
	get(id) {
		return this.list[id]
    }
    
	exists(id) {
		if(this.list[id]) {
			return true
		}
		return false
	}
	
	remove(id) {
		delete this.list[id]
	}
	
	forEach(callback) {
		Object.keys(this.list).forEach((roomId) => {
			callback(this.list[roomId])
		})
	}
	
	load() {
		if(!this.fs.existsSync(this.roomFile)) {
			return
		}
		var buffer = this.fs.readFileSync(this.roomFile)
		if(buffer.length == 0) {
			return
		}
		
		var stickyRooms = JSON.parse(buffer)
		for(var i = 0; i < stickyRooms.length; i++) {
			var roomId = stickyRooms[i]
			if(!roomList.exists(roomId)) {
				this.create(roomId, true)
			}
		}
	}
	
	save() {
		var stickyRooms = []
		this.forEach((room) => {
			if(room.sticky) {
				stickyRooms.push(room.id)
			}
		})
		this.fs.writeFileSync(this.roomFile, JSON.stringify(stickyRooms))
	}
	
	random() {
		var randomId = ""
		var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		var charactersLength = characters.length
		for(var i = 0; i < 8; i++) {
			randomId += characters.charAt(Math.floor(Math.random() * charactersLength))
		}
		while(this.list[randomId]) {
			randomId = random()
        }
		return randomId
    }
}