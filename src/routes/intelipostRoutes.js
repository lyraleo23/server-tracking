import express from "express";
import IntelipostController from "../controllers/intelipostController.js";

const router = express.Router();

router
  .post("/webhook/intelipost/notification", IntelipostController.receiveNotification)
export default router;   