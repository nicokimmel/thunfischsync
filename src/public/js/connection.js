const roomId = $("#roomId").val()
const socket = io.connect("localhost:3000")

var sessionId = null
var isLivestream = false

socket.on("join", function(room) {
	sessionId = socket.id
	isLivestream = (room.video.duration > 0) ? false : true
	
	player.loadVideoById(room.video.id, room.time)
	
	window.setTimeout(() => {
		room.playing ? player.playVideo() : player.pauseVideo()
	}, 500)
	
	player.setPlaybackRate(parseFloat(room.speed))
	
	setupControls(room.playing, room.video.duration)
	
	cacheRoom(room.id)
	loadQueue(room.queue)
	loadTags(room.video.tags)
	setLoop(room.loop)
	requestLyrics()
	
	console.log(`Connected to room #${room.id} as [${sessionId}]`)
})

socket.on("tick", function(playing, time, speed) {
	playing ? player.playVideo() : player.pauseVideo()
	
	if(seeking) { return }
	
	var timegap = Math.abs(player.currentTime - time)
	if(timegap > parseFloat(speed) + 1) {
		player.seekTo(time)
	}
	
	updateProgress(time)
	updateTime(time)
})

socket.on("play", function() {
	player.playVideo()
	$("#playPause").html(`<i class="fa-solid fa-pause"></i>`)
})

socket.on("pause", function() {
	player.pauseVideo()
	$("#playPause").html(`<i class="fa-solid fa-play"></i>`)
})

socket.on("seek", function(time) {
	if(seeking) { return }
	player.seekTo(time)
})

socket.on("speed", function(speed) {
	
})

socket.on("video", function(room) {
	player.loadVideoById(room.video.id, 0, "default")
	window.setTimeout(() => {
		room.playing ? player.playVideo() : player.pauseVideo()
	}, 500)
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