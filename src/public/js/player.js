var player = null
var playerReady = false
function onYouTubeIframeAPIReady() {
	player = new YT.Player("player", {
		playerVars: {
			controls: "0",
			disablekb: "1",
			modestbranding: "1",
			showinfo: "0",
			iv_load_policy: "3",
			rel: "0",
			origin: "https://sync.thunfisch.lol",
		},
		events: {
			"onReady": onPlayerReady,
			//"onStateChange": onPlayerStateChange,
			//"onPlaybackRateChange" : onPlaybackRateChange,
		},
	})
}

function onPlayerReady(event) {
	playerReady = true
	
	player.unloadModule("captions")
	player.unloadModule("cc")
	
	player.mute()
	socket.emit("join", roomId)
}

function setupOverlay(room) {
	$("#progress").attr({
		"max" : room.video.duration,
		"min" : 0
	})
	$("#playPause").html(`<i class="fa-solid fa-${room.playing ? "pause" : "play"}"></i>`)
	$("#title").html(`<a href="https://www.youtube.com/watch?v=${room.video.id}"><i class="fa-solid fa-link"></i> ${room.video.title}</a>`)
	updateTime(room.video.duration)
}

//  OVERLAY  //
$("#overlay").hide()
$("#video").hover(function() {
	$("#overlay").fadeIn(250)
}, function() {
	$("#overlay").fadeOut(250)
})

var autoHide = null
$("#video").on("touchstart", function() {
	if(autoHide && $(this).is(":visible")) {
		window.clearTimeout(autoHide)
		autoHide = null
		$("#overlay").fadeOut(250)
		return
	}
	
	$("#overlay").fadeIn(250)
	autoHide = window.setTimeout(() => {
		window.clearTimeout(autoHide)
		autoHide = null
		$("#overlay").fadeOut(250)
	}, 3000)
})

$("#overlay").on("touchstart", function(event) {
	event.stopImmediatePropagation()
	if(autoHide) {
		window.clearTimeout(autoHide)
		autoHide = window.setTimeout(() => {
			window.clearTimeout(autoHide)
			autoHide = null
			$("#overlay").fadeOut(250)
		}, 3000)
	}
})

//  FULLSCREEN  //
$("#fullscreen").click(function(event) {
	if (
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		document.msFullscreenElement
	) {
		if (document.exitFullscreen) {
			document.exitFullscreen()
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen()
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen()
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen()
		}
	} else {
		element = $('#video').get(0)
		if (element.requestFullscreen) {
			element.requestFullscreen()
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen()
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen()
		}
	}
})

//  PLAYPAUSE  //
$("#playPause").click(function(event) {
	var state = player.getPlayerState() == YT.PlayerState.PLAYING ? "pause" : "play"
	socket.emit(state)
})

//  TIME  //
function updateTime(time) {
	var timestamp = ""
	if(time < 0) {
		timestamp = "Live"
		updateProgress(time)
	} else {
		timestamp = time < 0 ? "Live" : new Date(parseInt(time) * 1000).toISOString().substring(11, 19)
	}
	$("#time").html(timestamp)
}

//  PROGRESS  //
var seeking = false
function updateProgress(time) {
	var val = (time - $("#progress").attr("min")) / ($("#progress").attr("max") - $("#progress").attr("min"))
	$("#progress").css("background-image", `-webkit-gradient(linear, left top, right top, color-stop(${val}, var(--sliderColor)), color-stop(${val}, var(--sliderBackground)))`)
	$("#progress").val(time)
}

$("#progress").on("input", function(event) {
	seeking = true
	updateProgress($("#progress").val())
	updateTime(parseInt($("#progress").val()))
})

$("#progress").on("change", function(event) {
	seeking = false
	socket.emit("seek", parseInt($("#progress").val()))
})

//  VOLUME  //
function updateVolume(volume) {
	player.setVolume(volume)
	$("#volume").val(volume)
	if(volume > 1) { player.unMute() }
	var val = (volume - $("#volume").attr("min")) / ($("#volume").attr("max") - $("#volume").attr("min"))
	$("#volume").css("background-image", `-webkit-gradient(linear, left top, right top, color-stop(${val}, var(--colorBlue)), color-stop(${val}, #C5C5C5))`)
	var icon = volume > 1 ? "high" : "off"
	$("#mute").html(`<i class="fa-solid fa-volume-${icon}"></i>`)
}

$("#mute").click(function(event) {
	if(player.isMuted()) {
		player.unMute()
	} else {
		player.mute()
	}
	var icon = player.isMuted() ? "high" : "xmark"
	$(this).html(`<i class="fa-solid fa-volume-${icon}"></i>`)
})

$("#volume").on("input", function(event) {
	updateVolume($(this).val())
})

$("#volume").on("change", function(event) {
	cacheVolume(parseInt($(this).val()))
})

$("#unmute").click(function(event) {
	$(this).remove()
	var volume = getCachedVolume()
	updateVolume(volume)
})

//  LOOP  //
$("#loopButton").click(function(event) {
	socket.emit("loop")
})

function setLoop(looping) {
	var color = looping ? "var(--colorBlue)" : "var(--colorGray)"
	$("#loopButton").css("background-color", color)
}