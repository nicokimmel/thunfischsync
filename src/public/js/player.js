var player = null
var playerReady = false
function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		playerVars: {
			controls: "1",
			color: "white",
			disablekb: "1",
			rel: "0",
			origin: "https://sync.thunfisch.lol",
		},
		events: {
			"onReady": onPlayerReady,
			"onStateChange": onPlayerStateChange,
			"onPlaybackRateChange" : onPlaybackRateChange,
		},
	})
}

function onPlayerReady(event) {
	playerReady = true
	player.mute()
	socket.emit("join", roomId)
}

var previousTime = 0
window.setInterval(() => {
	if(!playerReady) {
		return
	}
	var currentTime = player.getCurrentTime()
	var seekedTime = Math.abs(currentTime - previousTime)
	if(player.getPlayerState() == YT.PlayerState.PAUSED && seekedTime > 2) {
		onSeek(0, currentTime)
	}
	previousTime = currentTime
}, 1000)

var checkingEvents = false
var stateSequence = []
function handleEvents(playerState) {
	if(ignoreFlag) {
		ignoreFlag = false
		return
	}
	checkingEvents = true
	stateSequence.push(playerState)
	window.setTimeout(() => {
		var result = stateSequence.join("")
		if(result.match(/2(3)+1/)) {
			onSeek(0, player.getCurrentTime())
		} else if(result === "2") {
			onPause()
		} else if(result === "1") {
			onPlay()
		}
		checkingEvents = false
		stateSequence = []
	}, 1200)
}

function onPlayerStateChange(event) {
	playerState = event.data
	if(checkingEvents) {
		stateSequence.push(playerState)
	}
	switch(event.data) {
		case YT.PlayerState.PLAYING:
			handleEvents(playerState)
			break
		case YT.PlayerState.ENDED:
			
			break
		case YT.PlayerState.PAUSED:
			handleEvents(playerState)
			break
		case YT.PlayerState.BUFFERING:
			handleEvents(playerState)
			break
		default:
			break
	}
}

function onPlaybackRateChange(event) {
	socket.emit("speed", sessionId, event.data)
}

function onSeek(previousTime, currentTime) {
	socket.emit("seek", sessionId, currentTime)
}

function onPause() {
	socket.emit("pause", sessionId)
}

function onPlay() {
	socket.emit("play", sessionId)
}

$("#unmute").click(function(event) {
	$(this).remove()
	player.unMute()
})

$("#loopButton").click(function(event) {
	socket.emit("loop")
})
function setLoop(looping) {
	var color = looping ? "var(--colorBlue)" : "var(--colorGray)"
	$("#loopButton").css("background-color", color)
}

/* if(window.matchMedia("only screen and (max-width: 900px)").matches) {
	$("#logoText").html("SYNC")
} */