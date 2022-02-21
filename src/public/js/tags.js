var tagList = []

function loadTags(tags) {
	tagList = tags
	buildTagList()
}

function buildTagList() {
	var html = ""
	for(var i = 0; i < tagList.length; i++) {
		var tag = tagList[i]
		html += `<div class="tagItem">${tag}</div>`
	}
	$("#tagList").html(html)
}