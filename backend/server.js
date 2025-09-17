import express from "express";
import cors from "cors";
import Users from "./api/login.route.js";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config({ path: "./secrets.env" });

const mongo_username = process.env["MONGO_USERNAME"];
const mongo_password = process.env["MONGO_PASSWORD"];
const url = `mongodb+srv://${mongo_username}:${mongo_password}@innovatrix.uoxzm1k.mongodb.net/`;

const app = express();
app.use(cors());
app.use(express.json());

let usersCollection;

MongoClient.connect(url)
  .then(client => {
    usersCollection = client.db("Users").collection("Users");
  })
  .catch(err => console.error("MongoDB connection failed:", err));

app.post("/api/users/find", async (req, res) => {
  try {
    const { name, dob, phone_no } = req.body;

    if (!name || !dob || !phone_no) {
      return res.status(400).json({ error: "name, dob, and phone_no are required" });
    }

    const user = await usersCollection.findOne({ name, dob, phone_no });

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

app.use("/api/v1/users", Users);

app.use((req, res) => res.status(404).json({ error: "not-found" }));

export default app;
