socket.on("lyrics", function(title, lyrics) {
	if(lyrics) {
		$("#lyricsTitle").html(title)
		$("#lyricsText").html(lyrics.replace(/\n/g, "<br />"))
		$("#lyrics").show()
	} else {
		$("#lyricsTitle").html("Keine Lyrics gefunden.")
		$("#lyricsText").html("")
		$("#lyrics").hide()
	}
})

function requestLyrics() {
	socket.emit("lyrics")
}

$("#lyricsWindow").toggle()
$("#lyrics, #lyricsHide").click(function(event) {
	$("#lyricsWindow").toggle()
})

$("#lyricsWindow").draggable({
	cursor: "grab",
	handle: "#lyricsBar",
}).resizable()