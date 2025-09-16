import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let Users;
export default class Login {
  static injectDB = async (conn) => {
    if(Users) {
      return;
    }
    try{
      const dbName = process.env["DB_NAME"] || "Innovatrix";
      Users = await conn.db(dbName).collection("Users");
    } catch(err) {
      console.error(`unable to establish collection handles in userDAO: ${err}`);
    }  
  }
  
  static addUser = async(name, dob, phone_no) => {
    try{
      const existing = await Users.findOne({ phone_no: phone_no });
      if (existing) {
        return { acknowledged: true, insertedId: existing._id, alreadyExists: true };
      }
      const user = {
        name: name,
        dob: dob,
        phone_no: phone_no
      };
      return await Users.insertOne(user);
    } catch(err) {
      console.error(`unable to create user: ${err}`);
      return {error: err};
    }
  }

  static getUserByPhone = async(phone_no) => {
    try{
      const user = await Users.findOne({ phone_no: phone_no });
      return user;
    } catch(err) {
      console.error(`No user found: ${err}`);
      return {error: err};
    }
  }
}
