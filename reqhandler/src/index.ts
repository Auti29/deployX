import express from "express";
import {s3Client} from "./cloudflare.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { pipeline, Readable } from "stream";
import {promisify} from "util";
import dotenv from "dotenv";
dotenv.config();
const BUCKET = process.env.BUCKET;
const streamPipeline = promisify(pipeline);


const app = express();
app.use(express.json());

app.use(async (req, res) => {
    try{

    const host = req.hostname;
    const filepath = req.path;
    console.log(host);
    console.log(filepath);

    const id = host.split(".")[0];

    const Key = `dist/${id}/dist${filepath}`;

    console.log(Key);

    const getCmd =  new GetObjectCommand({
          Bucket: BUCKET!,
          Key,
    });

    const result = await s3Client.send(getCmd);

    if (!result.Body) {
        throw new Error(`No body found for key ${Key}`);
    }

    const stream = Readable.from(result.Body as AsyncIterable<Uint8Array>);

    const type = filepath.endsWith('html') ? "text/html" : filepath.endsWith('css') ? 'text/css' : "application/javascript";

    res.set("Content-Type", type);

    stream.pipe(res);




    }catch (e){
        console.log('error while getting dist files from r2 during req handler service: ', e);
        return res.status(500).json({
            message: "server error"
        });
    }
  
});


app.listen(3002, () => {
    console.log("req handler is running on 3002")
});
