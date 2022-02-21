const YouTube = class {
	constructor() {
		this.request = require("request")
		this.parser = require("js-video-url-parser")
		this.moment = require("moment")
		this.key = process.env.YOUTUBE_API_KEY
		this.url = "https://youtube.googleapis.com/youtube/v3"
	}
	
	parse(searchterm) {
		var result = this.parser.parse(searchterm)
		
		var type, value
		if(!result) {
			type = "s"
			value = searchterm
		} else if(result.id) {
			type = "v"
			value = result.id
		} else if(result.list) {
			type = "p"
			value = result.list
		}
		
		return {
			type: type,
			value: value,
		}
	}
	
	getVideoInfo(videoList, idList, callback) {
		idList = idList.slice(0, -1)
		this.request(this.url + "/videos?part=snippet%2CcontentDetails&maxResults=200&id=" + idList + "&key=" + this.key, { json: true }, (err, res, body) => {
			if(err) {
				return console.log(err)
			}
			for(var i in body.items) {
				var video = body.items[i]
				var duration = this.moment.duration(video.contentDetails.duration).asSeconds()
				duration = (duration == 0) ? -1 : duration
				videoList.push({
					id: video.id,
					title: video.snippet.title,
					channel: {
						id: video.snippet.channelId,
						name: video.snippet.channelTitle
					},
					thumbnail: video.snippet.thumbnails.medium.url,
					duration: duration,
					tags: video.snippet.tags,
				})
			}
			callback(videoList)
		})
	}
	
	getVideoById(videoid, callback) {
		var videoList = []
		var idList = videoid + ","
		this.getVideoInfo(videoList, idList, callback)
	}
	
	getPlaylist(playlistId, maxPages, callback) {
		this.getPlaylistVideoList(playlistId, maxPages, [], "", callback)
	}
	
	getPlaylistVideoList(playlistId, maxPages, videoList, pageToken, callback) {
		if(maxPages > 0 && pageToken !== "&pageToken=undefined") {
			this.request(this.url + "/playlistItems?part=contentDetails&maxResults=50&playlistId=" + playlistId + "&key=" + this.key + pageToken, {json: true}, (err, res, body) => {
				var nextPageToken = "&pageToken=" + body.nextPageToken
				var idList = ""
				for(var i in body.items) {
					var videoId = body.items[i].contentDetails.videoId		
					idList = idList + videoId + ","
				}
				this.getVideoInfo(videoList, idList, (videoList) => {
					maxPages = maxPages - 1
					this.getPlaylistVideoList(playlistId, maxPages, videoList, nextPageToken, callback)
				})
			})
		} else {
			callback(videoList)
		}
	}
	
	getVideosBySearch(searchterm, maxResults, callback) {
		var videoList = []
		this.request(this.url + "/search?part=id&type=video&q=" + searchterm + "&maxResults=" + maxResults + "&key=" + this.key, {json: true}, (err, res, body) => {
			if(err) {
				return console.log(err)
			}
			var idList = ""
			for(var i in body.items) {
				var videoId = body.items[i].id.videoId		
				idList = idList + videoId + ","
			}
			this.getVideoInfo(videoList, idList, callback)
		})
	}
	
	getTrendingVideos(maxResults, callback) {
		var videoList = []
		this.request(this.url + "/videos?part=id&chart=mostPopular&regionCode=DE&maxResults=" + maxResults + "&key=" + this.key, {json: true}, (err, res, body) => {
			if(err) {
				return console.log(err)
			}
			var idList = ""
			for(var i in body.items) {
				var videoId = body.items[i].id		
				idList = idList + videoId + ","
			}
			this.getVideoInfo(videoList, idList, callback)
		})
	}
	
	getRecentVideosBySearch(searchterm, maxResults, callback) {
		var videoList = []
		this.request(this.url + "/search?part=id&type=video&order=date&q=" + searchterm + "&maxResults=" + maxResults + "&key=" + this.key, {json: true}, (err, res, body) => {
			if(err) {
				return console.log(err)
			}
			var idList = ""
			for(var i in body.items) {
				var videoId = body.items[i].id.videoId		
				idList = idList + videoId + ","
			}
			this.getVideoInfo(videoList, idList, callback)
		})
	}
}