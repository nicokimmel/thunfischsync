var commandTimeout = null
var commandSequence = []
$(document).on("keydown", function(event) {
	var tag = event.target.tagName.toLowerCase()
	if(event.which >= 65 && event.which <= 90 && tag !== "input" && tag !== "textarea") {
		window.clearTimeout(commandTimeout)
		commandTimeout = null
		commandSequence.push(event.key)
		if(!commandTimeout) {
			commandTimeout = window.setTimeout(() => {
				if(commandSequence.length > 5) {
					var commandString = commandSequence.join("")
					var command = commandString.match(/ts[a-z]{3,6}/)
					
					commandSequence = []
					
					if(command) {
						socket.emit("command", command[0])
					}
				}
			}, 800)
		}
	}
})