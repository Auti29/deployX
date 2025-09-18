import { createClient } from "redis";
import { pullFiles } from "./cloudflare.js";
const subscriber  = createClient();
subscriber.connect();

async function main(){
    while(1){
          const res = await subscriber.brPop("build-queue", 0);

          const id = res?.element;
          
          await pullFiles(`output/${id}`);
    }
}
main();