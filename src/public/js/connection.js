const roomId = $("#roomId").val()
const socket = io.connect("localhost:3000")

var sessionId = null

socket.on("disconnect", function() {
	console.log("Disconnected from server.")
	$("main, #topControls").empty()
	$("main").css("display", "block");
	$("main").html('<h1 style="text-align: center">Verbindung verloren.</h1>')
	setTimeout(() => { window.location.replace("/") }, 1500)
})

socket.on("leave", function() {
	console.log("Kicked from room.")
	$("main, #topControls").empty()
	$("main").css("display", "block");
	$("main").html('<h1 style="text-align: center">Raum geschlossen.</h1>')
	setTimeout(() => { window.location.replace("/") }, 1500)
})

socket.on("join", function(room) {
	sessionId = socket.id
	
	player.loadVideoById(room.video.id, room.time)
	
	window.setTimeout(() => {
		room.playing ? player.playVideo() : player.pauseVideo()
	}, 500)
	
	updatePlaybackRate(room.speed)
	
	refreshOverlay(room)
	
	cacheRoom(room.id)
	loadQueue(room.queue)
	loadTags(room.video.tags)
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
	updatePlaybackRate(speed)
})

socket.on("video", function(room) {
	player.loadVideoById(room.video.id, 0, "default")
	window.setTimeout(() => {
		room.playing ? player.playVideo() : player.pauseVideo()
	}, 500)
	tagList = room.video.tags
	buildTagList()
	refreshOverlay(room)
})

socket.on("loop", function(enabled) {
	$("#loopToggle").prop("checked", enabled)
})

socket.on("viewers", function(amount) {
	$("#viewerCount").text(amount)
})