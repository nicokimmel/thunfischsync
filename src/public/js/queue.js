var queueList = []

socket.on("queue", function(videoList) {
	queueList = videoList || []
	buildQueueList()
})

function loadQueue(queue) {
	queueList = queue
	buildQueueList()
	$("#loopButton").css("background-color", "red")
}

function buildQueueList() {
	var html = ""
	for(var i = 0; i < queueList.length; i++) {
		var video = queueList[i]
		var duration = new Date(parseInt(video.duration) * 1000).toISOString().substring(11, 19)
		var title = truncateOnWord(video.title, 50)
		var channelName = truncateOnWord(video.channel.name, 20)
		if(video.duration < 0) {
			duration = "Live"
		}
		html += `<div class="queueItem">
					<input class="queueItemIndex" type="hidden" value="${i}">
					<img class="queueItemThumbnail" src="${video.thumbnail}">
					<div class="queueItemDuration">
						${duration}
					</div>
					<div class="queueItemDescription">
						<div class="queueItemTitle">${title}</div>
						<div class="queueItemChannel">${channelName}</div>
					</div>
					<i class="queueItemPlay fa-solid fa-play" aria-hidden="true"></i>
					<i class="queueItemUp fa-solid fa-arrow-up" aria-hidden="true"></i>
					<i class="queueItemDown fa-solid fa-arrow-down" aria-hidden="true"></i>
					<i class="queueItemDelete fa-solid fa-trash" aria-hidden="true"></i>
				</div>`
	}
	$("#queueList").html(html)
	
	var oldIndex = 0
	$("#queueList").sortable({
		appendTo: document.body,
		tolerance: "pointer",
		handle: ".queueItemThumbnail",
		scroll: true,
		cursor: "grab",
		start: function(event, ui) {
			ui.item.bind("click.prevent", (event) => { event.preventDefault() })
			oldIndex = ui.item.index()
		},
		update: function(event, ui) {
			window.setTimeout(() => { ui.item.unbind("click.prevent") }, 300)
			var newIndex = ui.item.index()
			socket.emit("queue-move", oldIndex, newIndex)
		}
	})
	
	$(".queueItemPlay").click(function(event) {
		var index = parseInt($(this).siblings(".queueItemIndex").val())
		var video = queueList[index]
		socket.emit("video", [video], index)
	})
	$(".queueItemUp").click(function(event) {
		var index = parseInt($(this).siblings(".queueItemIndex").val())
		socket.emit("queue-move", index, -1)
	})
	$(".queueItemDown").click(function(event) {
		var index = parseInt($(this).siblings(".queueItemIndex").val())
		socket.emit("queue-move", index, queueList.length+1)
	})
	$(".queueItemDelete").click(function(event) {
		var index = parseInt($(this).siblings(".queueItemIndex").val())
		socket.emit("queue-remove", index)
	})
}

