import express from "express";
import RequestCtrl from "./login.controller.js";

const router = express.Router();
router.route("/").post(RequestCtrl.apiCreateAccount);
router.route("/signin").post(RequestCtrl.apiSignIn);
router.route("/:phone_no").get(RequestCtrl.apiSignIn);
  
export default router;
