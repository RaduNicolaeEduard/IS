const express = require('express')
const { NlpManager } = require("node-nlp");
const bodyParser = require('body-parser')
const { exec } = require("child_process");
const fs = require('fs');
const path = require('path')
const redis = require('redis')
const app = express()
app.use(bodyParser.json())
const cors = require('cors');
const port = 3000
var jsonParser = bodyParser.json()
const manager = new NlpManager({ languages: ["en"] });
const fileUpload = require("express-fileupload")
const Tesseract = require("tesseract.js")
app.use(fileUpload())
app.use(cors())
const redisClient = redis.createClient({
    url: 'redis://redis:6379'
})
redisClient.connect()
redisClient.flushAll()
init()
manager.load();

redisClient.set("name", "Flavio")
app.post("/upload", async (req, res) => {
    console.log(req.files.busyboy)
    let sampleFile = await req.files.busyboy
    if (!sampleFile) return res.status(400).send("No files were uploaded.")
    try {
      const { data } = await Tesseract.recognize(sampleFile.data, "spa+eng", {
        logger: (m) => console.log(m),
      })
      let splitedText = data.text.split("\n")
      let count = 15;
      let newText = [] 
      splitedText.forEach(element => {
          if(count <= 0 ) return;
          newText.push(element);
      });
      AI_TURBO_ENHANCED_CHAT_BOT_ULTRA(newText.join("\n")).then((response) => {
        if (response == undefined) {
            res.json({ "response": "That didn't make sense for me!", "message": req.query.message, "status": "WARN" })
            return
        }
        res.json({ "response": response, "message": req.query.message, "status": "OK" })
      })
    } catch (error) {
      throw error
    }
  })
app.get('/', (req, res) => {
    try {
        if (req.query.message == undefined) {
            throw 'not good!';
        }
        AI_TURBO_ENHANCED_CHAT_BOT_ULTRA(req.query.message).then((response) => {
            if (response == undefined) {
                res.json({ "response": "That didn't make sense for me!", "message": req.query.message, "status": "WARN" })
                return
            }
            res.json({ "response": response, "message": req.query.message, "status": "OK" })
        })
    } catch (error) {
        res.json({ "response": "Something went sideways!", "message": req.query.message, "status": "ERROR" })
    }
})
app.get('/trainmodel', (req, res) => {
    exec("npm run train", (error, stdout) => {
        if (error) {

            console.log(`error: ${error.message}`);
            res.json({ "response": error.message, "message": req.query.message, "status": "ERROR" })
            return;
        }
        res.json({ "response": stdout, "message": req.query.message, "status": "OK" })
        console.log(`stdout: ${stdout}`);
    });
})
app.get('/reloadmng', (req, res) => {
    manager.load()
    res.json({ "status": "OK" })
})
app.get('/testredis', async (req, res) => {
    const value = await redisClient.get("name")
    res.json(value)
})

app.get('/reinit', async (req, res) => {
    init()
    res.json({ "status": "OK" })
})

app.get('/intents', async (req, res) => {
    intents = await redisClient.sMembers('intents')
    res.json({ "intents": intents, "status": "OK" })
})

app.post('/intents', jsonParser, async (req, res) => {
    await redisClient.del('intents')
    await redisClient.sAdd('intents', req.body.intents)
    // await redisClient.sAdd('intents', req.query.intent)
    res.json({ "status": "OK" })
})

app.delete('/intents', async (req, res) => {
    intents = req.query.intents;
    await redisClient.del('intents')
    await redisClient.sAdd('intents', intents)
    res.json({ "status": "OK" })
})

app.get('/intent', async (req, res) => {
    let questions = await redisClient.sMembers(`${req.query.intent}_questions`)
    let answers = await redisClient.sMembers(`${req.query.intent}_answers`)
    res.json({ "intent": { "questions": questions, "answers": answers },"intentkey":req.query.intent, "status": "OK" })
})
app.post('/intent', jsonParser, async (req, res) => {
    intent = req.query.intent
    data = req.body
    console.log(intent)
    console.log(data)
    await redisClient.del(`${intent}_questions`)
    await redisClient.del(`${intent}_answers`)
    redisClient.sAdd(`${intent}_questions`, data.questions)
    redisClient.sAdd(`${intent}_answers`, data.answers)
    res.json({ "status": "OK" })
})
app.get('/save', jsonParser, async (req, res) => {
    await wiriteToFiles()
    exec("npm run train", (error, stdout) => {
        if (error) {
            console.log(`error: ${error.message}`);
            res.json({ "response": error.message, "message": req.query.message, "status": "ERROR" })
            return;
        }
        manager.load()
        console.log(`stdout: ${stdout}`);
    });
    res.json({ "status": "OK" })
})
app.listen(port, () => {
    console.log(`AI_TURBO_ENHANCED_CHAT_BOT_ULTRA app listening on port ${port}`)
})

async function init() {
    const jsonsInDir = fs.readdirSync('./intents').filter(file => path.extname(file) === '.json');
    redisClient.sAdd('intents', jsonsInDir)
    jsonsInDir.forEach(file => {
        const fileData = fs.readFileSync(path.join('./intents', file));
        const json = JSON.parse(fileData.toString());
        redisClient.sAdd(`${file}_questions`, json.questions)
        redisClient.sAdd(`${file}_answers`, json.answers)
    });
    console.log(jsonsInDir)
}
async function wiriteToFiles() {
    intents = await redisClient.sMembers('intents')
    for (const intent of intents) {
        questions = await redisClient.sMembers(`${intent}_questions`)
        answers = await redisClient.sMembers(`${intent}_answers`)
        let obj = {"questions":questions,"answers":answers}
        let data = JSON.stringify(obj);
        fs.writeFileSync(path.join('./intents', intent), data);
      }
}
async function AI_TURBO_ENHANCED_CHAT_BOT_ULTRA(message) {
    const response = await manager.process("en", message);
    console.log(`Got message '${message}', responing with '${response.answer}'`);
    return response.answer
}
