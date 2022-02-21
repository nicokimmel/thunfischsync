socket.on("lyrics", function(title, lyrics) {
	if(lyrics) {
		$("#lyricsTitle").html(title)
		$("#lyricsText").html(lyrics.replace(/\n/g, "<br />"))
	} else {
		$("#lyricsTitle").html("Keine Lyrics gefunden.")
		$("#lyricsText").html("")
	}
})

function requestLyrics() {
	socket.emit("lyrics")
}

$("#lyrics").toggle()
$("#lyricsButton, #lyricsHide").click(function(event) {
	$("#lyrics").toggle()
	var color = $("#lyrics").is(":visible") ? "var(--colorBlue)" : "var(--colorGray)"
	$("#lyricsButton").css("background-color", color)
})

$("#lyrics").draggable({
	cursor: "grab",
	handle: "#lyricsBar",
}).resizable()