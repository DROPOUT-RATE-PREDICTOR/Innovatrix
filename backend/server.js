import express from "express";
import cors from "cors";
import Users from "./api/login.route.js";
import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;

import dotenv from "dotenv";
dotenv.config({ path: "./secrets.env" });

const mongo_username = process.env["MONGO_USERNAME"];
const mongo_password = process.env["MONGO_PASSWORD"];
const url = `mongodb+srv://${mongo_username}:${mongo_password}@innovatrix.uoxzm1k.mongodb.net/`;

const app = express();
const client = new MongoClient(url);

// ✅ Always use middlewares before routes
app.use(cors());
app.use(express.json());

// ✅ Your custom route
app.post("/api/users/find", async (req, res) => {
  try {
    const { name, dob, phone_no } = req.body;

    await client.connect();
    const db = client.db("Users");
    const users = db.collection("Users");

    const user = await users.findOne({ name, dob, phone_no });

    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use("/api/v1/Users", Users);
app.use((req, res) => res.status(404).json({ error: "not-found" }));

export default app;
