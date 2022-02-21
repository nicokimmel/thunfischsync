var displayMode = "browser"
if(navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
	displayMode = "standalone"
}

var storageAvailable = false
if(typeof(Storage) !== "undefined") {
	storageAvailable = true
	if(!window.localStorage.lastRooms) {
		window.localStorage.lastRooms = JSON.stringify([])
	}
}

if("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service-worker.js")
}

function cacheRoom(roomId) {
	if(storageAvailable) {
		var roomList = JSON.parse(window.localStorage.lastRooms)
		if(!roomList.includes(roomId)) {
			roomList.push(roomId)
			window.localStorage.lastRooms = JSON.stringify(roomList)
		}
	}
}