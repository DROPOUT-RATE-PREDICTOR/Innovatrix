import Login from "../dao/LoginDAO.js";

export default class RequestCtrl {
  static apiCreateAccount = async (req, res, next) => {
    try {
      const { name, dob, phone_no } = req.body || {};
      if (!name || !dob || !phone_no) {
        return res.status(400).json({ error: "name, dob, and phone_no are required" });
      }

      const userResponse = await Login.addUser(name, dob, phone_no);

      if (userResponse?.error) {
        return res.status(500).json({ error: userResponse.error?.message || "internal-error" });
      }

      res.status(userResponse?.alreadyExists ? 200 : 201).json({
        status: "success",
        userId: userResponse?.insertedId,
        alreadyExists: Boolean(userResponse?.alreadyExists)
      });

    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async apiSignIn(req, res, next) {
    try {
      const { name, dob, phone_no } = req.body || {};

      if (!name || !dob || !phone_no) {
        return res.status(400).json({ error: "name, dob, and phone_no are required" });
      }

      const user = await Login.getUserByDetails(name, dob, phone_no);

      if (!user || user?.error) {
        return res.status(404).json({ status: "not-found" });
      }

      res.json({ status: "ok", user });

    } catch(err) {
      console.error("apiSignIn error:", err);
      res.status(500).json({ error: err?.message || String(err) });
    }
  }
}
