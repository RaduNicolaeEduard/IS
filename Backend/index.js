const express = require('express')
const { NlpManager } = require("node-nlp");
const bodyParser = require('body-parser')
const { exec } = require("child_process");
const fs = require('fs');
const path = require('path')
const redis = require('redis')
const app = express()
app.use(bodyParser.json())
const port = 3000
var jsonParser = bodyParser.json()
const manager = new NlpManager({ languages: ["en"] });
const redisClient = redis.createClient({
    url: 'redis://localhost:3001'
})
redisClient.connect()
redisClient.flushAll()
init()
manager.load();

redisClient.set("name", "Flavio")

app.get('/', (req, res) => {
    try {
        if (req.query.message == undefined) {
            throw 'not good!';
        }
        AI_TURBO_ENHANCED_CHAT_BOT_ULTRA(req.query.message).then((response) => {
            if (response == undefined) {
                res.send({ "response": "That didn't make sense for me!", "message": req.query.message, "status": "WARN" })
                return
            }
            res.send({ "response": response, "message": req.query.message, "status": "OK" })
        })
    } catch (error) {
        res.send({ "response": "Something went sideways!", "message": req.query.message, "status": "ERROR" })
    }
})
app.get('/trainmodel', (req, res) => {
    exec("npm run train", (error, stdout) => {
        if (error) {
            console.log(`error: ${error.message}`);
            res.send({ "response": error.message, "message": req.query.message, "status": "ERROR" })
            return;
        }
        res.send({ "response": stdout, "message": req.query.message, "status": "OK" })
        console.log(`stdout: ${stdout}`);
    });
})
app.get('/reloadmng', (req, res) => {
    manager.load()
    res.send({ "status": "OK" })
})
app.get('/testredis', async (req, res) => {
    const value = await redisClient.get("name")
    res.send(value)
})

app.get('/reinit', async (req, res) => {
    init()
    res.send({ "status": "OK" })
})

app.get('/intents', async (req, res) => {
    intents = await redisClient.sMembers('intents')
    res.send({ "intents": intents, "status": "OK" })
})

app.post('/intents', jsonParser, async (req, res) => {
    await redisClient.del('intents')
    await redisClient.sAdd('intents', req.body)
    // await redisClient.sAdd('intents', req.query.intent)
    res.send({ "status": "OK" })
})

app.delete('/intents', async (req, res) => {
    intents = req.query.intents;
    await redisClient.del('intents')
    await redisClient.sAdd('intents', intents)
    res.send({ "status": "OK" })
})

app.get('/intent', async (req, res) => {
    let answers = await redisClient.sMembers(`${req.query.intent}_questions`)
    let questions = await redisClient.sMembers(`${req.query.intent}_answers`)
    res.send({ "intent": { "questions": questions, "answers": answers }, "status": "OK" })
})
app.post('/intent', jsonParser, async (req, res) => {
    intent = req.query.intent
    data = req.body
    await redisClient.del(`${intent}_questions`)
    await redisClient.del(`${intent}_answers`)
    redisClient.sAdd(`${intent}_questions`, data.questions)
    redisClient.sAdd(`${intent}_answers`, data.answers)
    res.send({ "status": "OK" })
})
app.post('/save', jsonParser, async (req, res) => {
    await wiriteToFiles()
    res.send({ "status": "OK" })
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
