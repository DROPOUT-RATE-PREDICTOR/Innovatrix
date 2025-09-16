import Login from "../dao/LoginDAO.js";
export default class RequestCtrl {
  static apiCreateAccount = async (req, res, next) => {
    try {
      const { name, dob, phone_no } = req.body || {};
      if (!name || !dob || !phone_no) {
        res.status(400).json({ error: "name, dob, and phone_no are required" });
        return;
      }

      const userResponse = await Login.addUser(name, dob, phone_no);
      if (userResponse?.error) {
        res.status(500).json({ error: userResponse.error?.message || "internal-error" });
        return;
      }
      res.status(userResponse?.alreadyExists ? 200 : 201).json({
        status: "success",
        userId: userResponse?.insertedId,
        alreadyExists: Boolean(userResponse?.alreadyExists)
      });
    } catch(err) {
      res.status(500).json({error: err.message});
    }
  }

  static async apiSignIn(req,res,next) {
    try{
      const phone_no = req.body?.phone_no || req.params?.phone_no;
      if (!phone_no) {
        res.status(400).json({ error: "phone_no is required" });
        return;
      }
      const user = await Login.getUserByPhone(phone_no);
      if(!user || user?.error) {
        res.status(404).json({status: "not-found"});
        return;
      }
      res.json({ status: "ok", user });
    } catch(err) {
      console.error(`api : ${err}`);
      res.status(500).json({error: err?.message || String(err)}); 
    }
  }
}