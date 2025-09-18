import fs from "node:fs/promises";
import path from "node:path";


async function getFilePaths(currpath: string): Promise<string[]>{
    
    const readFilesDirs = await fs.readdir(currpath);


    const res = await Promise.all(
        readFilesDirs.map(async entity => {
           const fullpath = path.resolve(currpath, entity);
           const stat = await fs.stat(fullpath);
           
           if(stat.isDirectory()){
               return getFilePaths(fullpath);
           }
           else{
               return [fullpath];
           }
       })
    );

    return res.flat();
    
}

export {getFilePaths}