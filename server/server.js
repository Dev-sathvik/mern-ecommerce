import express from "express"; 
import cors from "cors";     

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.json([{ name: "Phone", price: 20000 }]);
})

app.listen(5000, ()=>{
    console.log("Server is started in port 5000")
})
