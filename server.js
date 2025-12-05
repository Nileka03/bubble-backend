import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";

//create express app and http server
const app = express();
const server = http.createServer(app);

//middlewares
app.use(express.json({limit: "4mb"}));
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is running"));


//connect to database
await connectDB

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));