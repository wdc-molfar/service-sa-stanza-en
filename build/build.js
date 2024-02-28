const { extend } = require('lodash')
const fs = require('fs').promises
const fse = require('fs-extra')
const path = require('path')
const os = require('os')
const execa = require("execa")
const download = require("./download")

const run = async () => {

	let config =require(path.resolve(__dirname, "../package.json")).sentimentAnalysis
	console.log(`MOLFAR SENTIMENT ANALYZER SERVICE POSTINSTALL`)

	console.log(`Install ${config.lang} Sentiment Analyser`)



	// console.log(`Clone ${config.repo}`)
	// await ( async () =>{
	// 	try {
	// 		const {stdout} = execa("git", `clone ${config.repo}`.split(" "))
	// 		stdout.pipe(process.stdout)
	// 	} catch(error) {
	// 		console.log(error)
	// 	}
	// })()
	// console.log("Repo cloned")

	console.log(`Install Sentiment Analyzer dependencies...`)

	await ( async () =>{
		try {
			const {stdout} = execa("pip3", `install -r ${path.resolve("./requirements.txt")}`.split(" "))
			stdout.pipe(process.stdout)
		} catch(error) {
			console.log(error)
		}
	})()

	console.log(`Install Fasttext model for ${config.lang} language`)

	await ( async () => {
		try {
			await download(config.modelUrl, "./model.ftz")
		} catch(error) {
			console.log(error)
		}	
	})()

	console.log(`Molfar Sentiment Analyzer(${config.lang}) service successfully deployed`) 
}


run()

