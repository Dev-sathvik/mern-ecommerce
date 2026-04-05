import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.json([{ name: "Phone", price: 20000 }]);
});

// Start server
app.listen(5000, () => {
  console.log("Server is started in port 5000");
});
console.log(process.env.MONGO_URI);