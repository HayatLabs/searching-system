import express from 'express';
import cors from 'cors';



const app = express();

app.use(cors());
app.use(express.json());



app.get("/ping", (_req, res) => {
    res.json({
        status: "ok",
        service: "web-discovery-engine is running successfully",
    });
});



export default app;
