function search(searchTerm) {
	if(searchTerm === "" || searchTerm === sync.search.last) {
		return
	}
	sync.search.list = []
	sync.search.last = searchTerm
	$("#searchList").html("<p id=\"searchLabel\">Lädt...</p>")
	socket.emit("search", searchTerm)
}

$("#searchField").on("keypress", function(event) {
	if(event.which === 13) {
		search($(this).val())
	}
})

$("#searchField").on("input", function() {
	if($(this).val() === "") {
		$("#searchList").html("")
		sync.search = {
			list: [],
			last: ""
		}
	}
})

$("#searchButton").click(function() {
	search($("#searchField").val())
})

$("#searchReset").click(function() {
	$("#searchList").html("")
	sync.search.last = ""
})

$("#searchField").bind("paste", function(event) {
	var pasted = event.originalEvent.clipboardData.getData("text")
	search(pasted)
})

socket.on("search", function(videoList) {
	sync.search.list = videoList || []
	buildSearchList()
})

function buildSearchList() {
	if(sync.search.list.length === 0) {
		$("#searchList").html("<p id=\"searchLabel\">Keine Ergebnisse</p>")
		return
	}
	var html = ""
	if(sync.search.list.length > 1) {
		html += "<div id=\"searchAddAllButton\">Alle hinzufügen</div>"
	}
	for(var i = 0; i < sync.search.list.length; i++) {
		var video = sync.search.list[i]
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
		socket.emit("queue-add", sync.search.list)
	})
	$(".searchItemPlay").click(function() {
		var index = $(this).siblings(".searchItemIndex").val()
		var video = sync.search.list[index]
		socket.emit("video", [video])
	})
	$(".searchItemQueue").click(function() {
		var index = $(this).siblings(".searchItemIndex").val()
		var video = sync.search.list[index]
		socket.emit("queue-add", [video])
	})
}