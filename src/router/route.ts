import express, { Router } from "express";
import { addTask, deleteTask, editTask, getTask, getTasks, googleAuth, signIn, signOut, signUp, updateTaskStatus } from "../controller/userController";
import { verifyToken } from "../middleware/verifyToken";

const router: Router = express.Router();

router.post("/sign-in",signIn);
router.post("/sign-up",signUp)
router.post("/googleAuth",googleAuth)
router.get("/tasks",verifyToken,getTasks)
router.put('/tasks/:taskId',verifyToken,updateTaskStatus)
router.post("/tasks",verifyToken,addTask)
router.get("/task/:taskId",verifyToken,getTask)
router.put("/task/:taskId",verifyToken,editTask)
router.delete("/task/:taskId",verifyToken,deleteTask)
router.get("/logout",verifyToken,signOut)


export default router