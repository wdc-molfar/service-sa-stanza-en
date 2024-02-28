const { extend } = require("lodash")
const path = require("path")

const {
    ServiceWrapper,
    AmqpManager,
    Middlewares,
    promClient,
    createLogger,
    createMonitor,
    yaml2js
} = require("@molfar/service-chassis")


const SentimentAnalyzer = require("./src/javascript/bridge")
const serviceSetup = require(path.resolve(__dirname,"./package.json")).sentimentAnalysis


 const config = {
     mode: 'text',
     encoding: 'utf8',
     pythonOptions: ['-u'],
     pythonPath: (process.env.NODE_ENV && process.env.NODE_ENV == "production") ? 'python' : 'python.exe',
     pythonScript: path.resolve(__dirname,"./src/python/main.py"),
     args: path.resolve(__dirname,"./model.ftz")
 }

const analyser = new SentimentAnalyzer(config)

analyser.start()


let service = new ServiceWrapper({
    consumer: null,
    publisher: null,
    config: null,

    //-------------- Add heartbeat exported method

         async onHeartbeat(data, resolve){
            resolve({})
        },
 
    //--------------------------------------------



    async onConfigure(config, resolve) {
        this.config = config

        this.consumer = await AmqpManager.createConsumer(this.config.service.consume)
        await this.consumer.use([
            Middlewares.Json.parse,
            Middlewares.Schema.validator(this.config.service.consume.message),
            Middlewares.Error.Log,
            Middlewares.Error.BreakChain,

            async (err, msg, next) => {
                console.log("CONSUME", msg.content)
                next()
            },
            
            Middlewares.Filter( msg =>  {
                if( msg.content.metadata.nlp.language.locale != serviceSetup.lang) {
                    console.log(`IGNORE`, msg.content.langDetector.language.locale)
                    msg.ack()
                } else {
                    console.log(`ACCEPT`, msg.content.langDetector.language.locale)
                }
                return  msg.content.langDetector.language.locale == serviceSetup.lang
            }),

            async (err, msg, next) => {
                try {
                    let m = msg.content
                    
                    let res = await analyser.getSentiments({
                        text: m.scraper.message.text.replace(/\n+/g," ")
                    })
                    
                    m = extend({}, m, {
                            sentiments: res.data
                        }
                    )
                    this.publisher.send(m)
                    console.log("RECOGNIZE SENTIMENTS", res )
                    msg.ack()
                }    
                catch(e){
                    console.log("ERROR", e.toString())
                }    
            }

        ])

        this.publisher = await AmqpManager.createPublisher(this.config.service.produce)
        
        await this.publisher.use([
            Middlewares.Schema.validator(this.config.service.produce.message),
            Middlewares.Error.Log,
            Middlewares.Error.BreakChain,
            Middlewares.Json.stringify
        ])



        resolve({ status: "configured" })

    },

    onStart(data, resolve) {
        this.consumer.start()
        resolve({ status: "started" })
    },

    async onStop(data, resolve) {
        await this.consumer.close()
        await this.publisher.close()
        resolve({ status: "stoped" })
    }

})

service.start()