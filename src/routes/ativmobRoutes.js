import express from "express";
import AtivmobController from "../controllers/ativmobController.js";

const router = express.Router();

router
  .post("/webhook/ativmob/notification", AtivmobController.receiveNotification)
export default router;