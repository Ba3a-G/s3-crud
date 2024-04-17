const express = require('express');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv').config();

const app = express();
const r2client = new S3Client({
    region: "auto",
    endpoint: process.env.CF_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.CF_R2_KEY,
        secretAccessKey: process.env.CF_R2_SECRET
    }

});


let counter;

let putObject = async (counter) => {
    const putObjectCommand = new PutObjectCommand({
        Bucket: "test",
        Key: "counter.json",
        Body: JSON.stringify(counter),
        ContentType: "application/json"
    });
    await r2client.send(putObjectCommand);
}

app.get('/', (req, res) => {
    res.json(counter);
})

app.get('/increment', async (req, res) => {
    counter.count++;
    await putObject(counter);
    res.json(counter);
})

app.get('/decrement', async (req, res) => {
    counter.count--;
    await putObject(counter);
    res.json(counter);
})

const startServer = async () => {
    if (!counter) {
        console.log('Downloading data');
        const resp = await fetch("https://pub-de342c3c013848fa9ea34d4a65f56c86.r2.dev/counter.json");
        counter = await resp.json();

    }
    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}

startServer();