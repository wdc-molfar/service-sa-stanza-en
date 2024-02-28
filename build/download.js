const path = require("path")
const axios = require('axios'); 
const url = require('url')
const fs = require('fs')
const _ = require("lodash")

const download = ( url, destination) => 

	axios.get(url, {responseType: "stream"} )  
	.then(response => new Promise( (resolve, reject) => {

		// let filePath = path.resolve( __dirname, path2dest, path.parse(url.parse(url).pathname).base)
		console.log(`Download ${url} into ${destination}`)
		let outputStream = fs.createWriteStream(destination)
		
		response.data.pipe(outputStream);
		
		outputStream.on("close", () => {
			resolve()
		})
		
		outputStream.on("error", error => {
			reject(error)
		})
	}))

module.exports = download

// ( fileUrl, path2dest, destFilename  ) => {
// 	fileUrl = (_.isArray(fileUrl)) ? fileUrl : [fileUrl]

// 	return Promise.all( fileUrl.map( f => downloadPart(f,path2dest)))
// 				.then( parts => splitter.mergeFiles(parts, path.resolve( __dirname, path2dest, destFilename)))
// 				.then( () => path.resolve( __dirname, path2dest, destFilename)) 
// }


 