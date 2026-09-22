import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma";

/*
===========================
REGISTER USER
===========================
*/
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/*
===========================
LOGIN USER
===========================
*/
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
