socket.on("room-create", function(roomId) {
	$("#roomCreateLabel").html("#" + roomId)
	$("#roomCreateLabel").css("visibility", "visible")
	$("#roomCreateLabel").scramble(1000, 2, "numandalph", true)
	
	window.setTimeout(function() {
		window.location.href = "/" + roomId
	}, 2500)
})

$("#roomCreateButton").click(function(event) {
	$("#roomCreateButton").off()
	socket.emit("room-create")
})

socket.on("room-check", function(roomId) {
	if(roomId) {
		$("#roomSearchId").css("background-color", "#99FF99")
		window.setTimeout(function() {
			window.location.href = "/" + roomId
		}, 1000)
	} else {
		$("#roomSearchId").css("background-color", "#FF7070")
		window.setTimeout(function() {
			$("#roomSearchId").val("")
			$("#roomSearchId").css("background-color", "#FFFFFF")
		}, 800)
	}
})

$("#roomSearchId").on("input", function() {
	var input = $(this).val().toUpperCase()
	if(input.length == 8) {
		socket.emit("room-check", input)
	}
	$(this).css("background-color", "#FFFFFF")
})

if(storageAvailable) {
	var roomList = JSON.parse(window.localStorage.lastRooms)
	window.localStorage.lastRooms = JSON.stringify([])
	socket.emit("room-discover", roomList)
}

socket.on("room-discover", function(roomList) {
	window.localStorage.lastRooms = JSON.stringify(roomList)
	if(roomList.length == 0) { return }
	$("#lastRooms").css("visibility", "visible")
	var html = ""
	for(var i = roomList.length - 1; i >= 0; i--) {
		var roomId = roomList[i]
		html += `<li><a href="/${roomId}">#${roomId}</a><i class="removeRoom fa fa-times"></i></li>`
	}
	$("#lastRoomsList").html(html)
	$(".removeRoom").click(function(event) {
		var roomId = $(this).siblings("a").text().substring(1)
		var roomList = JSON.parse(window.localStorage.lastRooms)
		var index = roomList.indexOf(roomId)
		roomList.splice(index, 1)
		window.localStorage.lastRooms = JSON.stringify(roomList)
		window.location.reload()
	})
})