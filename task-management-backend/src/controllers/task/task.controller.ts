import { Response } from "express";
import prisma from "../../utils/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

/*
===========================
CREATE TASK
===========================
*/
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: req.userId!,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*
===========================
GET MY TASKS
===========================
*/
export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*
===========================
UPDATE TASK
===========================
*/
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        completed,
      },
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/*
===========================
DELETE TASK
===========================
*/
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
