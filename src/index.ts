import app from './app.js';
const PORT = process.env.PORT || 5001;

app.listen(PORT , ()=>{
    console.log({
        runnign : "server is runnign" , 
        url : ` https://localhost:${PORT}`
    })
})
