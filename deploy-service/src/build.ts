import {exec, spawn} from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export default function buildProject(id: string){
    return new Promise(res => {
        const child = exec(`cd ${path.join(__dirname, `/output/${id}`)} && npm install && npm run build`);

        child.stdout?.on("data", (data) => {
            console.log('stdout', data);
        });

        child.stderr?.on("data", (err) => {
            console.log('stderr', err);
        });

        child.on("close", () => {
            res("");
        });

    });
}