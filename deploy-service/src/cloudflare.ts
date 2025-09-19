import dotenv from "dotenv";
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
// import fs from "node:fs/promises";
import {pipeline} from "stream";
import { promisify } from "util";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const REGION = "auto"; 
const R2_ENDPOINT = process.env.R2_URL;
const ACCESS_KEY_ID = process.env.R2_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET;
const BUCKET = process.env.BUCKET;   


const s3Client = new S3Client({
  region: REGION,
  endpoint: R2_ENDPOINT!,
  credentials: {
    accessKeyId: ACCESS_KEY_ID!,
    secretAccessKey: SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, 
});

const streamPipeline = promisify(pipeline);


export async function pullFiles(prefix: string) {
  try {
    const cmd = new ListObjectsV2Command({
      Bucket: BUCKET!,
      Prefix: prefix,
    });

    const data = await s3Client.send(cmd);


    if (!data.Contents || data.Contents.length === 0) {
      console.log("No files found for prefix:", prefix);
      return;
    }

    await Promise.all(
      data.Contents.map(async ({ Key }) => {
        if (!Key) return;
        const finalOutputPath = path.join(__dirname, Key);
        const dirName = path.dirname(finalOutputPath);

        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        const getCmd = new GetObjectCommand({
          Bucket: BUCKET!,
          Key,
        });

        const result = await s3Client.send(getCmd);
        if (!result.Body) throw new Error(`No body found for key ${Key}`);
        const outputFile = fs.createWriteStream(finalOutputPath);
        await streamPipeline(result.Body as NodeJS.ReadableStream, outputFile);

        console.log(`Downloaded: ${Key}`);
      })
    );
  } catch (err) {
    console.error("Error while downloading files:", err);
    throw err;
  }
}



async function uploadtoR2(localFilePath: string, remoteFilePath: string){
    const fileStream = fs.createReadStream(localFilePath);
    try{
    const uploader = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET!,
        Key: remoteFilePath,
        Body: fileStream,
      },
    });

    uploader.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress.loaded} / ${progress.total} bytes`);
    });

    await uploader.done();
    console.log(`File uploaded: ${remoteFilePath}`);

    }catch(err){
        console.log("error occured while putting data into object store: ", err);
        throw err;
    }
}


function getFilePaths(currpath: string) {
    let res: string[] = [];

    const allContent = fs.readdirSync(currpath);

    allContent.forEach(entity => {
      const fullpath = path.join(currpath, entity);
      if(fs.statSync(fullpath).isDirectory()){
        // @ts-ignore
        res = res.concat(getFilePaths(fullpath));
      }else{
        res.push(fullpath);
      }
    });
    return res;
  
}


 function finalUpload(id: string){

}