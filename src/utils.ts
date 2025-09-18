

const token_len = 7;

function generate (){
    const str = "abcdefghijklmnopqrstuvwxyz1234567890"
    
    let res = "";

    for(let i = 0;i<token_len;i++){
        let randNo = Math.floor(Math.random() * str.length);
        res += str[randNo];
    }


    return res;

}


export {generate};