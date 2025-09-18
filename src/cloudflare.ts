import {S3Client } from "@aws-sdk/client-s3";
import fs from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from 'dotenv'; 

dotenv.config();  

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



//remote file path in r2 => output/{id}/app.jsx 



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


export {uploadtoR2};

