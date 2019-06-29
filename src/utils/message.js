const generateMsg=(name,text)=>{
    return{
        name,
        text,
        createdAt:new Date().getTime(),
    }
}
const generateLocationMsg=(name,url)=>{
    return{
        name,
        url,
        createdAt:new Date().getTime(),
    }
}

module.exports={
    generateMsg,
    generateLocationMsg
}