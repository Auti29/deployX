import express from 'express';
import cors from 'cors';
import { generate } from './utils.js';
import {simpleGit} from 'simple-git';
import path from "node:path";
import { getFilePaths } from './file.js';
import {uploadtoR2} from './cloudflare.js';
import {createClient } from "redis";
import { fileURLToPath } from 'node:url';

const publisher = createClient();
publisher.connect(); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
const git = simpleGit();

app.post('/deploy', async (req, res) => {
    const {repoUrl} = req.body;

    if(!repoUrl){
        return res.status(411).json({
            message: "no github url provided"
        });
    }

    //todo-check if the url is an actual github url before proceeding 

    const id  = generate();
    await git.clone(repoUrl, path.join(path.dirname("dist/index.js"), `output/${id}`));

    const files = await getFilePaths(path.join(__dirname, `output/${id}`));
    
    for(const file of files){
        const result = await uploadtoR2(file, `${file.slice(__dirname.length+1)}`);
    }

    //todo: add a check to ensure successful file uploads

    publisher.lPush("build-queue", id);

    res.json({
        id
    });

});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});