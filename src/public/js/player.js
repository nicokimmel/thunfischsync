var player = null
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
			"onReady": () => {
				sync.playerReady = true
				player.mute()
				socket.emit("join", roomId)
			}
		},
	})
}

function refreshOverlay(room) {
	$("#progress").attr({
		"max" : room.video.duration,
		"min" : 0
	})
	$("#playPause").html(`<i class="fa-solid fa-${room.playing ? "pause" : "play"}"></i>`)
	$("#title").html(`<a href="https://www.youtube.com/watch?v=${room.video.id}" target=”_blank”><i class="fa-solid fa-link"></i> ${room.video.title}</a>`)
	$("#loopToggle").prop("checked", room.loop)
	updateTime(room.video.duration)
	window.setTimeout(() => {
		setSubtitles()
	}, 1000)
}

//  TOOLTIPS  //
$("#tooltip").hide()
function showTooltip(element, text, mouseX) {
	$("#tooltip").html(text)
	$("#tooltip").show()
	
	var position = $(element).offset()
	var x = mouseX || position.left + $(element).outerWidth() / 2
	$("#tooltip").offset({
		top: position.top - $("#tooltip").outerHeight() - 10,
		left: x - ($("#tooltip").outerWidth() / 2)
	})
	
	$(element).one("mouseleave", function() {
		$("#tooltip").hide()
	})
}

//  OPTIONS  //
$("#optionsWindow").hide()
$("#options").click(function() {
	$("#optionsWindow").toggle()
})

$("#loopToggle").click(function(event) {
	socket.emit("loop")
})

var subtitles = false
function setSubtitles() {
	if(subtitles) {
		player.loadModule("captions")
		player.setOption("captions", "track", {"languageCode": "de"})
		player.loadModule("cc")
		player.setOption("cc", "track", {"languageCode": "de"})
	} else {
		player.unloadModule("captions")
		player.unloadModule("cc")
	}
}
$("#subtitleToggle").click(function(event) {
	subtitles = !subtitles
	setSubtitles()
})

function updatePlaybackRate(speed) {
	player.setPlaybackRate(speed)
	var val = (speed - $("#speedSelection").attr("min")) / ($("#speedSelection").attr("max") - $("#speedSelection").attr("min"))
	$("#speedSelection").css("background-image", `-webkit-gradient(linear, left top, right top, color-stop(${val}, var(--sliderColor)), color-stop(${val}, var(--sliderBackground)))`)
	$("#speedSelection").val(speed)
}
$("#speedSelection").on("input", function(event) {
	updatePlaybackRate($("#speedSelection").val())
})
$("#speedSelection").on("change", function(event) {
	var speed = parseFloat($("#speedSelection").val())
	socket.emit("speed", speed)
})
$("#speedSelection").on("mousemove", function(event) {
	showTooltip(this, `${$("#speedSelection").val()}x`)
})

//  OVERLAY  //
var autoHide = null

$("#overlay").hide()
$("#video").on("mousemove", function() {
	$("#overlay").fadeIn(250)
	$("#video").css("cursor", "default")
	window.clearTimeout(autoHide)
	autoHide = window.setTimeout(() => {
		window.clearTimeout(autoHide)
		autoHide = null
		$("#optionsWindow").fadeOut(250)
		$("#overlay").fadeOut(250)
		$("#video").css("cursor", "none")
	}, 3000)
})

$("#video").on("touchstart", function() {
	if(autoHide && $(this).is(":visible")) {
		window.clearTimeout(autoHide)
		autoHide = null
		$("#optionsWindow").fadeOut(250)
		$("#overlay").fadeOut(250)
		return
	}
	
	$("#overlay").fadeIn(250)
	autoHide = window.setTimeout(() => {
		window.clearTimeout(autoHide)
		autoHide = null
		$("#optionsWindow").fadeOut(250)
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
	if(document.fullscreenElement) {
		document.exitFullscreen()
	} else {
		var element = $("#video").get(0)
		element.requestFullscreen()
	}
})
$("#video").bind("fullscreenchange", function(event) {
	var border = document.fullscreenElement ? "none" : "1px solid var(--colorBlue)"
	$(this).css("border", border)
})

//  PLAYPAUSE  //
$("#playPause").click(function(event) {
	var state = player.getPlayerState() == YT.PlayerState.PLAYING ? "pause" : "play"
	socket.emit(state)
})
$("#playPause").mouseenter(function(event) {
	var text = player.getPlayerState() == YT.PlayerState.PLAYING ? "Pause" : "Play"
	showTooltip(this, text)
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
$("#progress").on("mousemove", function(event) {
	var value = ((event.offsetX) / $(event.target).width()) * parseInt(event.target.getAttribute("max"), 10)
	var timestamp =  new Date(parseInt(value) * 1000).toISOString().substring(11, 19)
	showTooltip(this, timestamp, event.pageX)
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