import app from "./server.js";
import mongodb from "mongodb"
import LoginDAO from "./dao/LoginDAO.js";

import dotenv from "dotenv";
dotenv.config({ path: "./secrets.env" });

const MongoClient = mongodb.MongoClient;
const mongo_username = process.env["MONGO_USERNAME"];
const mongo_password = process.env["MONGO_PASSWORD"];
export const mongo_uri = `mongodb+srv://${mongo_username}:${mongo_password}@innovatrix.uoxzm1k.mongodb.net/`;

const port = 8000;
MongoClient.connect(mongo_uri, {
  maxPoolSize: 50,
  wtimeoutMS: 2000,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
}).then(async client => {
  await LoginDAO.injectDB(client); 
  app.listen(port, () => {
    console.log(`listening on port : ${port}`);
  });
});

