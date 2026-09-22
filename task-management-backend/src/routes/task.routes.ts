import { Router } from "express";
import {
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../controllers/task/task.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createTask);
router.get("/", authenticate, getMyTasks);
router.put("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;
