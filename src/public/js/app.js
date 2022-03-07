var displayMode = "browser"
if(navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
	displayMode = "standalone"
}

if("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/service-worker.js")
}

var storageAvailable = false
if("localStorage" in window) {
	storageAvailable = true
}

var lock = null
if("wakeLock" in navigator) {
	lock = navigator.wakeLock.request("screen")
}

function cacheRoom(roomId) {
	if(storageAvailable) {
		if(!window.localStorage.rooms) {
			window.localStorage.rooms = JSON.stringify([])
		}
		var roomList = JSON.parse(window.localStorage.rooms)
		if(!roomList.includes(roomId)) {
			roomList.push(roomId)
			window.localStorage.rooms = JSON.stringify(roomList)
		}
	}
}

function cacheVolume(volume) {
	if(storageAvailable) {
		window.localStorage.volume = volume
	}
}

function getCachedVolume() {
	if(storageAvailable && window.localStorage.volume) {
		return window.localStorage.volume
	}
	return 50
}