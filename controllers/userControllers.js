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
  confirmPassword: z.string(),
});

const userLoginSchema = z.object({
  name: z.string(),
  password: z.string(),
});

const changePasswordSchema = z.object({
  name: z.string(),
  oldPassword: z.string(),
  newPassword: z
    .string()
    .min(6, "New password must have at least 6 characters"),
  confirmPassword: z.string(),
});

const deleteUserSchema = z.object({
  name: z.string(),
  password: z.string(),
  confirmMessage: z.string(),
});

const updateUserSchema = z.object({
  name: z.string(),
  password: z.string(),
  updates: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().min(10, "Phone must have at least 10 digits").optional(),
    address: z
      .string()
      .min(5, "Address must have at least 5 characters")
      .optional(),
  }),
});

const userController = {
  getAllUsers: async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  },

  profile: async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        username: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        balance: user.balance,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  register: async (req, res) => {
    try {
      const { name, email, phone, address, password, confirmPassword } =
        req.body;

      if (password !== confirmPassword) {
        return res.status(400).render("index", {
          title: "หน้าแรก MouseHub",
          registerError: "Password not match",
        });
      }

      const existingUser = await userService.getUserByUsername(name);
      if (existingUser) {
        return res.status(400).render("index", {
          title: "หน้าแรก MouseHub",
          registerError: "Username is already registered",
        });
      }

      const existingEmail = await userService.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).render("index", {
          title: "หน้าแรก MouseHub",
          registerError: "Email is already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await userService.register(name, email, phone, address, hashedPassword);

      return res.status(201).redirect("/", {
        message: "User registered successfully!",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).render("index", {
        title: "หน้าแรก MouseHub",
        registerError: "Internal server error",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { name, password } = req.body;

      const user = await userService.getUserByUsername(name);
      if (!user) {
        return res
          .status(401)
          .render("index", { loginError: "Username or password incorrect" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .render("index", { loginError: "Username or password incorrect" });
      }

      if (user.isDeleted !== null) {
        return res.status(403).json({
          message: "This account has been deleted",
        });
      }

      const jwt_secret = process.env.JWT_SECRET;
      const payload = {
        username: user.name,
        userId: user.id,
        role: user.role,
        balance: user.balance,
      };
      const token = jwt.sign(payload, jwt_secret, { expiresIn: "7d" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect("/");
    } catch (error) {
      return res
        .status(500)
        .render("index", { loginError: "Internal server error" });
    }
  },

  logout: (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).redirect("/");
    } catch (error) {
      return res
        .status(500)
        .render("index", { registerError: "Internal server error" });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { name, oldPassword, newPassword, confirmPassword } = req.body;

      const user = await userService.getUserByUsername(name);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Old password is incorrect",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "New password and confirm password do not match",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const changedPassword = await userService.changePassword(
        user,
        hashedPassword
      );
      return res.status(200).json({
        message: "Password changed successfully.",
        user: changedPassword.password,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, password, updates } = req.body;

      // ตรวจสอบ token และ username ให้ตรงกัน
      if (!req.user || req.user.username !== name) {
        return res.status(403).json({
          message: "You are not authorized to update this profile",
        });
      }

      const user = await userService.getUserByUsername(name);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }

      const updatedUser = await userService.updateUserProfile(user, updates);

      return res.status(200).json({
        message: "Profile updated successfully",
        updatedProfile: {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { name, password, confirmMessage } = req.body;

      const user = await userService.getUserByUsername(name);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!req.user || req.user.username !== name) {
        return res.status(403).json({
          message: "You are not authorized to delete this account",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "password is incorrect",
        });
      }

      if (confirmMessage !== "Confirm") {
        return res.status(400).json({
          message: "Please type 'Confirm' to delete your account",
        });
      }

      const deleteUser = await userService.deleteUser(user);

      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        message: "User deleted successfully",
        deletedUser: deleteUser.isdeleted,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  restoreUser: async (req, res) => {
    try {
      const { id } = req.body;

      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!user.isDeleted) {
        return res.status(400).json({
          message: "User is not deleted",
        });
      }

      const restoreUser = await userService.restoreUser(user);
      return res.status(200).json({
        message: "User restored successfully",
        restoreUser: restoreUser.isdeleted,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export {
  userLoginSchema,
  userRegistrationSchema,
  changePasswordSchema,
  deleteUserSchema,
  updateUserSchema,
};
export default userController;
