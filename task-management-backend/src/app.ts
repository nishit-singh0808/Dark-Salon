import taskRoutes from "./routes/task.routes";
import authRoutes from "./routes/auth.routes";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  console.log("Root route hit");
  res.send("Task Management API Running 🚀");
});

export default app;
