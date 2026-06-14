// Validates chirp, if not throws error


export async function validateChirp(chirp: string): Promise<string>{

    if(chirp.length > 140){
        throw new Error("Chirp is too long!");
    }

    const lowerBody = chirp.toLowerCase();
    const regArr = chirp.split(" ");
    const lowerArr = lowerBody.split(" ");
    const profaneArr = ["kerfuffle", "sharbert", "fornax"];
    let isProfane = false;
    for(let word of profaneArr){
        if(lowerArr.includes(word)){
            isProfane = true;
            break;
        }
    }
    if(isProfane){
        let retArr = [];
        for(let i = 0; i < regArr.length; i++){
            if(profaneArr.includes(lowerArr[i])){
                retArr.push("****");
            } else {
                retArr.push(regArr[i]);
            }
        }
        const cleanChirp: string = retArr.join(" ");
        return cleanChirp;
    }
    return chirp;
}
