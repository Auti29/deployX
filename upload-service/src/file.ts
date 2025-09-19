import fs from "fs";
import path from "path";

function getFilePaths(currpath: string): string[] {
    let res: string[] = [];

    const allContent = fs.readdirSync(currpath);

    allContent.forEach(entity => {
      const fullpath = path.join(currpath, entity);
      if(fs.statSync(fullpath).isDirectory()){
        res = res.concat(getFilePaths(fullpath));
      }else{
        const normalized = fullpath.replace(/\\/g, "/");
        res.push(normalized);
      }
    });
    console.log(res);
    return res;
}


export {getFilePaths}