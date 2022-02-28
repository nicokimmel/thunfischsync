require("dotenv").config()
const express = require("express")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))

const logger = new Logger()
const roomList = new RoomList()
const youtube = new YouTube()
const lyrics = new Lyrics(io)
const cli = new Console(io, roomList)


//  STARTUP  //
function startup() {
	roomList.create("DEBUG123", true)
	logger.log("Loading sticky rooms...")
	roomList.load()
}


//  ROUTES  //
app.get("/robots.txt", function(req, res) {
    res.type("text/plain")
    res.send("User-agent: *\nDisallow: /")
})

app.get("/", function(req, res) {
	res.render(__dirname + "/public/front.ejs")
})

app.get("/:roomId", function(req, res) {
	var roomId = req.params.roomId
	if(roomList.exists(roomId)) {
		res.render(__dirname + "/public/room.ejs", {roomId: roomId})
	} else if(roomList.exists(roomId.toUpperCase())) {
		res.redirect(`/${roomId.toUpperCase()}`)
	} else {
		res.redirect("/")
	}
})

app.get("/:roomId/tv", function(req, res) {
	var roomId = req.params.roomId.toUpperCase()
	if(roomList.exists(roomId)) {
		res.render(__dirname + "/public/tv.ejs", {roomId: roomId})
	} else if(roomList.exists(roomId.toUpperCase())) {
		res.redirect(`/${roomId.toUpperCase()}/tv`)
	} else {
		res.redirect("/")
	}
})

app.get("/:roomId/api", function(req, res) {
	var ip = req.headers["x-real-ip"] || req.socket.remoteAddress
	var roomId = req.params.roomId
	if(roomList.exists(roomId)) {
		var roomInfo = roomList.get(roomId).info()
		res.status(200).json(roomInfo)
		logger.log(`Requested information of room #${roomId}.`, ip)
	} else if(roomList.exists(roomId.toUpperCase())) {
		res.redirect(`/${roomId.toUpperCase()}/api`)
	} else {
		res.status(404).send("This room does not exist!")
		logger.log(`Requested information of unknown room #${roomId}.`, ip)
	}
})


//  SOCKETS  //
io.on("connection", function(client) {
	var ip = client.handshake.headers["x-real-ip"] || client.request.connection.remoteAddress
	var room = null
	
	client.on("join", function(roomId) {
		if(typeof roomId !== "string") { return }
		room = roomList.get(roomId)
		if(!room) { return }
		client.join(room.id)
		client.emit("join", room)
		room.viewers = io.sockets.adapter.rooms.get(room.id).size
		io.in(room.id).emit("viewers", room.viewers)
		logger.log(`Joined room #${room.id}`, ip)
	})
	
	client.on("disconnecting", function() {
		if(!room) { return }
		room.viewers = room.viewers - 1
		io.in(room.id).emit("viewers", room.viewers)
		logger.log(`Left room #${room.id}`, ip)
	})
	
	client.on("play", function(clientId) {
		if(!room) { return }
		if(typeof clientId !== "string") { return }
		room.playing = true
		io.in(room.id).emit("play", clientId)
		logger.log(`Unpaused video in room #${room.id}`, ip)
	})
		
	client.on("pause", function(clientId) {
		if(!room) { return }
		if(typeof clientId !== "string") { return }
		room.playing = false
		io.in(room.id).emit("pause", clientId)
		logger.log(`Paused video in room #${room.id}`, ip)
	})
	
	client.on("seek", function(clientId, time) {
		if(!room) { return }
		if(typeof clientId !== "string") { return }
		if(typeof time !== "number") { return }
		time = Math.floor(time)
		room.time = time
		io.in(room.id).emit("seek", clientId, time)
		logger.log(`Seeked video in room #${room.id} to ${time}`, ip)
	})
	
	client.on("speed", function(clientId, speed) {
		if(!room) { return }
		if(typeof clientId !== "string") { return }
		if(typeof speed !== "number") { return }
		room.speed = speed
		io.in(room.id).emit("speed", clientId, speed)
		logger.log(`Changed speed in room #${room.id} to ${speed}`, ip)
	})
	
	client.on("loop", function() {
		if(!room) { return }
		room.loop = !room.loop
		io.in(room.id).emit("loop", room.loop)
		logger.log(`${room.loop ? "Enabled" : "Disabled"} loop in room #${room.id}`, ip)
	})
	
	client.on("lyrics", function() {
		if(!room) { return }
		lyrics.send(room, client)
		logger.log(`Requested lyrics in room #${room.id}`, ip)
	})
	
	client.on("search", function(searchterm) {
		if(!room) { return }
		if(!searchterm || searchterm == "" || typeof searchterm !== "string") { return }
		var result = youtube.parse(searchterm)
		if(result.type === "s") {
			youtube.getVideosBySearch(result.value, 20, function(videoList) {
				client.emit("search", videoList)
			})
		} else if(result.type === "v") {
			youtube.getVideoById(result.value, function(videoList) {
				client.emit("search", videoList)
			})
		} else if(result.type === "p") {
			youtube.getPlaylist(result.value, 6, function(videoList) {
				client.emit("search", videoList)
			})
		}
		logger.log(`Searched for "${searchterm}" in room #${room.id}`, ip)
	})
	
	client.on("video", function(videoList, queuepos) {
		if(!room) { return }
		if(!Array.isArray(videoList)) { return }
		if(typeof queuepos !== "number" && typeof queuepos !== "undefined") { return }
		if(queuepos >= 0) {
			room.remove(queuepos)
			io.in(room.id).emit("queue", room.queue)
		}
		room.time = 0
		room.playing = true
		room.video = videoList[0]
		io.in(room.id).emit("video", room)
		lyrics.send(room)
		logger.log(`Played video "${room.video.id}" in room #${room.id}`, ip)
	})
	
	client.on("queue-add", function(videoList) {
		if(!room) { return }
		if(!Array.isArray(videoList)) { return }
		room.add(videoList)
		io.in(room.id).emit("queue", room.queue)
		logger.log(`Added video(s) to queue in room #${room.id}`, ip)
	})
	
	client.on("queue-remove", function(index) {
		if(!room) { return }
		if(typeof index !== "number") { return }
		room.remove(index)
		io.in(room.id).emit("queue", room.queue)
		logger.log(`Removed video #${index} from queue in room #${room.id}`, ip)
	})
	
	client.on("queue-move", function(from, to) {
		if(!room) { return }
		if(typeof from !== "number") { return }
		if(typeof to !== "number") { return }
		room.move(from, to)
		io.in(room.id).emit("queue", room.queue)
		logger.log(`Moved video from #${from} to #${to} in room #${room.id}`, ip)
	})
	
	client.on("command", function(commandString) {
		if(!room) { return }
		if(typeof commandString !== "string") { return }
		
		var commandMatch = commandString.match(/ts[a-z]{3,6}/)
		if(!commandMatch) { return }
		
		var commandList = {
			tsmopup: () => {
				cli.exec("clear", [room.id])
			},
			tsblend: () => {
				cli.exec("shuffle", [room.id])
			},
			tsvogue: () => {
				youtube.getTrendingVideos(20, (videoList) => {
					room.add(videoList)
					io.in(room.id).emit("queue", room.queue)
				})
			},
			tsdragon: () => {
				youtube.getRecentVideosBySearch("Drachenlord", 35, (videoList) => {
					for(var i = 0; i < videoList.length; i++) {
						var video = videoList[i]
						if(video.duration >= 3600 || video.duration < 0 || video.channel.id === "UCm3_j4RLEzgMovQTRPx47MQ") {
							continue //Keine Klicks dem Oger!
						}
						room.add([video])
					}
					io.in(room.id).emit("queue", room.queue)
				})
			},
			tsgiveup: () => {
				youtube.getVideoById("dQw4w9WgXcQ", (videoList) => {
					room.time = 0
					room.playing = true
					room.video = videoList[0]
					io.in(room.id).emit("video", room)
					lyrics.send(room)
				})
			},
			tsmogus: () => {
				youtube.getVideoById("5DlROhT8NgU", (videoList) => {
					room.time = 0
					room.playing = true
					room.video = videoList[0]
					room.video.tags = ["SUS", "🐧 Mong?", "aMoNg Us", "mOnG", "Moooooong", "sUsPiCiOuS", "🐧🐧🐧",
						"Spiel ich lieber TTT..", "Almighty", "Gamerroom", "LMAO"]
					io.in(room.id).emit("video", room)
				})
			},
		}
		
		var command = commandList[commandMatch[0]]
		if(typeof command === "function") {
			command()
			logger.log(`Issued command "${commandMatch[0]}" in room #${room.id}`, ip)
		}
	})
	
	client.on("room-create", function() {
		var room = roomList.create(null, false)
		client.emit("room-create", room.id)
		logger.log(`Created room #${room.id}`, ip)
	})
	
	client.on("room-check", function(roomId) {
		if(typeof roomId !== "string") { return }
		var returnId = roomList.exists(roomId) ? roomId : undefined
		client.emit("room-check", returnId)
	})
	
	client.on("room-discover", function(discoverList) {
		if(!Array.isArray(discoverList)) { return }
		var checkedList = []
		for(var i = 0; i < discoverList.length; i++) {
			var roomId = discoverList[i]
			if(typeof roomId !== "string") { continue }
			if(roomList.exists(roomId)) {
				checkedList.push(roomId)
			}
		}
		client.emit("room-discover", checkedList)
	})
})


//  LOOP  //
setInterval(function() {
	roomList.forEach((room) => {
		if(room.viewers == 0) {
			if(room.idle >= 300) {
				if(!room.sticky) {
					roomList.remove(room.id)
					logger.log(`Deleted room #${room.id} due to inactivity.`)
				} else {
					room.playing = false
					logger.log(`Paused video in room #${room.id} due to inactivity.`)
				}
			} else {
				room.idle = room.idle + 1
			}
		} else {
			room.idle = 0
		}
		
		if(!room.playing) {
			return
		}
		
		if(room.video.duration < 0) {
			return
		}
		
		room.time = room.time + parseFloat(room.speed)
		if(room.time >= room.video.duration) {
			room.next()
			lyrics.send(room)
			io.in(room.id).emit("video", room)
			io.in(room.id).emit("queue", room.queue)
			logger.log(`Video in room #${room.id} ended. Next!`)
		}
		
		io.in(room.id).emit("tick", room.playing, room.time, room.speed)
	})
}, 1000)

startup()
server.listen(3000)
logger.log("Listening on *:3000")
cli.prompt()