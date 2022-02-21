const roomId = $("#roomId").val()
const socket = io.connect("localhost:3000")

var sessionId = null
var isLivestream = false

socket.on("join", function(room) {
	sessionId = socket.id
	isLivestream = (room.video.duration > 0) ? false : true
	
	player.loadVideoById(room.video.id, room.time)
	player.playVideo()
	window.setTimeout(() => {
		room.playing ? player.playVideo() : player.pauseVideo()
	}, 500)
	player.setPlaybackRate(parseFloat(room.speed))
	
	cacheRoom(room.id)
	loadQueue(room.queue)
	loadTags(room.video.tags)
	setLoop(room.loop)
	requestLyrics()
	
	console.log(`Connected to room #${room.id} as [${sessionId}]`)
})

socket.on("tick", function(playing, time, speed) {
	if(checkingEvents) {
		return
	}
	
	var timegap = Math.abs(player.getCurrentTime() - time)
	if(timegap > parseFloat(speed) + 1) {
		player.seekTo(time)
	}
	
	if(playing && player.getPlayerState() === YT.PlayerState.PAUSED) {
		player.playVideo()
	} else if(!playing && player.getPlayerState() === YT.PlayerState.PLAYING) {
		player.pauseVideo()
	}
})

var ignoreFlag = true
socket.on("play", function(clientId) {
	if(clientId !== sessionId) {
		ignoreFlag = true
		player.playVideo()
	}
})

socket.on("pause", function(clientId) {
	if(clientId !== sessionId) {
		ignoreFlag = true
		player.pauseVideo()
	}
})

socket.on("seek", function(clientId, time) {
	if(clientId !== sessionId) {
		player.seekTo(time)
	}
})

socket.on("speed", function(clientId, speed) {
	if(clientId !== sessionId) {
		if(isLivestream) {
			player.setPlaybackRate(1)
			return
		}
		player.setPlaybackRate(parseFloat(speed))
	}
})

socket.on("video", function(room) {
	player.loadVideoById(room.video.id, 0)
	room.playing ? player.playVideo() : player.pauseVideo()
	isLivestream = (room.video.duration > 0) ? false : true
	tagList = room.video.tags
	buildTagList()
})

socket.on("loop", function(enabled) {
	setLoop(enabled)
})

socket.on("viewers", function(amount) {
	$("#viewerCount").text(amount)
})