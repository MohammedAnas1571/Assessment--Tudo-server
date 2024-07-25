import express, { Router } from "express";
import { addTask, deleteTask, editTask, getTask, getTasks, googleAuth, signIn, signUp } from "../controller/userController";

const router: Router = express.Router();

router.post("/sign-in", signIn);
router.post("/sign-up",signUp)
router.post("/goolgeAuth",googleAuth)
router.post("/tasks",addTask)
router.get("/tasks",getTasks)
router.get("/task/:taskId",getTask)
router.put("/task/:taskId",editTask)
router.delete("/task/:taskId",deleteTask)


export default router