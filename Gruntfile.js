module.exports = function(grunt) {	
	grunt.initConfig({
		copy: {
			main: {
				files: [
					{cwd: "src/public", expand: true, src: ["*"], dest: "dist/public"},
					{cwd: "src/public/css", expand: true, src: ["**"], dest: "dist/public/css"},
					{cwd: "src/public/img", expand: true, src: ["**"], dest: "dist/public/img"},
				]
			}
		},
		uglify: {
			server: {
				files: {
					"dist/sync.js": [
						"src/logger.js",
						"src/rooms.js",
						"src/youtube.js",
						"src/lyrics.js",
						"src/console.js",
						"src/sync.js"
					]
				}
			},
			client: {
				files: {
					"dist/public/js/room.min.js": [
						"src/public/js/utils.js",
						"src/public/js/app.js",
						"src/public/js/search.js",
						"src/public/js/queue.js",
						"src/public/js/tags.js",
						"src/public/js/lyrics.js",
						"src/public/js/connection.js",
						"src/public/js/commands.js",
						"src/public/js/player.js"
					],
					"dist/public/js/tv.min.js": [
						"src/public/js/app.js",
						"src/public/js/connection.js",
						"src/public/js/player.js"
					],
					"dist/public/js/front.min.js": [
						"src/public/js/lib/descrambler.min.js",
						"src/public/js/app.js",
						"src/public/js/connection.js",
						"src/public/js/discover.js"
					]
				}
			}
		},
	})
	grunt.loadNpmTasks("grunt-contrib-copy")
	grunt.loadNpmTasks("grunt-contrib-uglify")
	grunt.registerTask("default", ["copy", "uglify"])
}