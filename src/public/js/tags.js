function loadTags(tags) {
	sync.tags.list = tags || []
	buildTagList()
}

function buildTagList() {
	var html = ""
	for(var i = 0; i < sync.tags.list.length; i++) {
		var tag = sync.tags.list[i]
		html += `<div class="tagItem">${tag}</div>`
	}
	$("#tagList").html(html)
}