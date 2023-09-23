import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

import { Deepgram } from '@deepgram/sdk';
import dotenv from 'dotenv'
import { resolve } from 'path';

const app = express();
app.use(express.json());
app.use(cors());

multer({ dest: 'uploads/' });

dotenv.config();

app.post('/transcript', async (req, res) => {
    try {
        const sleep: Promise<number> = new Promise((resolve) => setTimeout(resolve, 2500))

        const file = fs.createWriteStream('./uploads/audio.mp3');
        req.pipe(file);

        await sleep;

        const deepgramKey: string | undefined = process.env.DEEPGRAM_TOKEN;

        if (deepgramKey == undefined) {
            const resp = {
                "statusCode": 500,
                "ErrorMessage": "Error in server, please see the code"
            }

            return res.status(500).json(resp);
        }

        const deepgram = new Deepgram(deepgramKey);

        const audio = fs.readFileSync('./uploads/audio.mp3');

        console.log(audio);

        const source = {
            buffer: audio,
            mimetype: 'audio/mp3'
        }

        deepgram.transcription.preRecorded(source, {
            language: 'pt-br',
            model: 'enhanced',
            smart_format: true
        }).then((transcription) => {
            const phrase: string | undefined = transcription.results?.channels.pop()?.alternatives.pop()?.transcript;

            console.log('Frase - ', phrase);

            return res.status(200).json(phrase);
        }).catch((err) => {
            res.status(500).json(err)
            console.log(err);
        });

    } catch (error) {
        return res.status(500).json(error)
    }
});

app.listen(5000, () => console.log("listen on port 5000"));
