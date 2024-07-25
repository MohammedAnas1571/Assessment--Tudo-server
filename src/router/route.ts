import express, { Router } from "express";
import { googleAuth, signIn, signUp } from "../controller/userController";

const router: Router = express.Router();

router.post("/sign-in", signIn);
router.post("/signup",signUp)
router.post("/goolgeAuth",googleAuth)


export default router