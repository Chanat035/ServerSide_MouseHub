import userService from "../services/userService.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userRegistrationSchema = z.object({
    name: z.string().min(3, "Username must have at least 3 characters"),
    email: z.email("Invalid email address"),
    phone: z.string().min(10, "Phone number must have at least 10 characters"),
    address: z.string().min(5, "Address must have at least 5 characters"),
    password: z.string().min(6, "Password must have at least 6 characters"),
    confirmPassword: z.string()
  });

const userLoginSchema = z.object({
  name: z.string(),
  password: z.string(),
});

const userController = {
  getAllUsers: async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  },

  create: async (req, res) => {
    try {
      const { name, email, phone, address, password, confirmPassword } =
        req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({
          message: "Password not match",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await userService.create(
        name,
        email,
        phone,
        address,
        hashedPassword
      );
      return res
        .status(201)
        .json({ message: "User registered successfully!", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { name, password } = req.body;

      const user = await userService.getUserByUsername(name);
      if (!user) {
        return res.status(401).json({
          message: "Username or password incorrect",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Username or password incorrect",
        });
      }

      const jwt_secret = process.env.JWT_SECRET;
      const payload = { username: user.name, userId: user.id };
      const token = jwt.sign(payload, jwt_secret, { expiresIn: "7d" });
      return res
        .status(200)
        .json({ message: "User logged in successfully!", token });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
};

export { userLoginSchema, userRegistrationSchema };
export default userController;
