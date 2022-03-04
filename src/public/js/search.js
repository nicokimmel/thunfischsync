var searchList = []
var lastSearch = ""

function search(searchTerm) {
	if(searchTerm === "" || searchTerm === lastSearch) {
		return
	}
	searchList = []
	lastSearch = searchTerm
	$("#searchList").html("<p id=\"searchLabel\">Lädt...</p>")
	socket.emit("search", searchTerm)
}

$("#searchField").on("keypress", function(event) {
	if(event.which === 13) {
		search($(this).val())
	}
})

$("#searchfield").on("input", function() {
	if($(this).val() === "") {
		$("#results").html("")
		searchList = []
		lastSearch = ""
	}
})

$("#searchButton").click(function() {
	search($("#searchField").val())
})

$("#searchField").bind("paste", function(event) {
	var pasted = event.originalEvent.clipboardData.getData("text")
	search(pasted)
})

socket.on("search", function(videoList) {
	searchList = videoList || []
	buildSearchList()
})

function buildSearchList() {
	if(searchList.length === 0) {
		$("#searchList").html("<p id=\"searchLabel\">Keine Ergebnisse</p>")
		return
	}
	var html = ""
	if(searchList.length > 1) {
		html += "<div id=\"searchAddAllButton\">Alle hinzufügen</div>"
	}
	for(var i = 0; i < searchList.length; i++) {
		var video = searchList[i]
		var duration = new Date(parseInt(video.duration) * 1000).toISOString().substring(11, 19)
		var title = truncateOnWord(video.title, 50)
		var channelName = truncateOnWord(video.channel.name, 20)
		if(video.duration < 0) {
			duration = "Live"
		}
		html += `<div class="searchItem">
					<input class="searchItemIndex" type="hidden" value="${i}">
					<img class="searchItemThumbnail" src="${video.thumbnail}">
					<div class="searchItemDuration">
						${duration}
					</div>
					<div class="searchItemDescription">
						<div class="searchItemTitle">${title}</div>
						<div class="searchItemChannel">${channelName}</div>
					</div>
					<i class="searchItemPlay fa-solid fa-play" aria-hidden="true"></i>
					<i class="searchItemQueue fa-solid fa-plus" aria-hidden="true"></i>
				</div>`
	}
	$("#searchList").html(html)
	
	$("#searchAddAllButton").click(function() {
		$(this).off()
		$(this).remove()
		socket.emit("queue-add", searchList)
	})
	$(".searchItemPlay").click(function() {
		var index = $(this).siblings(".searchItemIndex").val()
		var video = searchList[index]
		socket.emit("video", [video])
	})
	$(".searchItemQueue").click(function() {
		var index = $(this).siblings(".searchItemIndex").val()
		var video = searchList[index]
		socket.emit("queue-add", [video])
	})
}