import userController from "../controllers/userControllers.js";
import userService from "../services/userService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// mock dependencies
jest.mock("../services/userService.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("userController.register", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "t3st",
        email: "t3st@example.com",
        phone: "0987654321",
        address: "somewhere",
        password: "test1234",
        confirmPassword: "test1234",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  //register success
  test("should return 201 and success message when registration successful", async () => {
    userService.getUserByUsername.mockResolvedValue(null);
    userService.getUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    userService.register.mockResolvedValue({ id: 1, name: "t3st" });

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully!",
      user: { id: 1, name: "t3st" },
    });
  });

  //password != confirmPassword
  test("should return 400 if passwords do not match", async () => {
    req.body.confirmPassword = "notmatch";

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password not match",
    });
  });

  //username already exists
  test("should return 400 if username already registered", async () => {
    userService.getUserByUsername.mockResolvedValue({ id: 99, name: "t3st" });

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username is already registered",
    });
  });

  //email already exists
  test("should return 400 if email already registered", async () => {
    userService.getUserByUsername.mockResolvedValue(null);
    userService.getUserByEmail.mockResolvedValue({
      id: 55,
      email: "t3st@example.com",
    });

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email is already registered",
    });
  });

  //internal server error (simulate throw)
  test("should return 500 on unexpected error", async () => {
    userService.getUserByUsername.mockRejectedValue(new Error("DB failed"));

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      error: "DB failed",
    });
  });
});

describe("userController.login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "t3st",
        password: "test1234",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("should return 200 and token when login successful", async () => {
    const user = {
      id: 1,
      name: "t3st",
      password: "hashedPassword",
      role: "user",
      isDeleted: null,
    };

    userService.getUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-jwt-token");

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User logged in successfully!",
      token: "fake-jwt-token",
    });
  });

  //Wrong password
  test("should return 401 if passwords do not match", async () => {
    const user = {
      id: 1,
      name: "t3st",
      password: "hashedPassword",
      isDeleted: null,
    };

    userService.getUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);
    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username or password incorrect",
    });
  });

  //user not found
  test("should return 401 if there is no user", async () => {
    userService.getUserByUsername.mockResolvedValue(null);

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username or password incorrect",
    });
  });

  //user is deleted
  test("should return 403 if user is deleted", async () => {
    const user = {
      id: 1,
      name: "t3st",
      password: "hashedPassword",
      isDeleted: "2024-01-01T00:00:00Z",
    };

    userService.getUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "This account has been deleted",
    });
  });

  //internal server error (simulate throw)
  test("should return 500 on unexpected error", async () => {
    userService.getUserByUsername.mockRejectedValue(new Error("DB failed"));

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      error: "DB failed",
    });
  });

  describe("userController.changePassword", () => {
    let req, res;

    beforeEach(() => {
      req = {
        body: {
          name: "t3st",
          oldPassword: "oldpass",
          newPassword: "newpass123",
          confirmPassword: "newpass123",
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      jest.clearAllMocks();
    });

    // Success case
    test("should return 200 when password changed successfully", async () => {
      const user = { id: 1, name: "t3st", password: "hashedOld" };

      userService.getUserByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashedNew");
      userService.changePassword.mockResolvedValue({
        ...user,
        password: "hashedNew",
      });

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password changed successfully.",
        user: "hashedNew",
      });
    });

    // User not found
    test("should return 404 if user not found", async () => {
      userService.getUserByUsername.mockResolvedValue(null);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    // Old password incorrect
    test("should return 400 if old password is incorrect", async () => {
      userService.getUserByUsername.mockResolvedValue({
        password: "hashedOld",
      });
      bcrypt.compare.mockResolvedValue(false);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Old password is incorrect",
      });
    });

    // New and confirm password not match
    test("should return 400 if new password and confirm password do not match", async () => {
      req.body.confirmPassword = "different";
      userService.getUserByUsername.mockResolvedValue({
        password: "hashedOld",
      });
      bcrypt.compare.mockResolvedValue(true);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "New password and confirm password do not match",
      });
    });

    // Internal server error
    test("should return 500 on unexpected error", async () => {
      userService.getUserByUsername.mockRejectedValue(new Error("DB failed"));

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: "DB failed",
      });
    });
  });

  describe("userController.deleteUser", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "t3st",
        password: "test123",
        confirmMessage: "Confirm",
      },
      user: { username: "t3st" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // Success
  test("should return 200 when user deleted successfully", async () => {
    const user = { id: 1, name: "t3st", password: "hashedPassword" };

    userService.getUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    userService.deleteUser.mockResolvedValue({ ...user, isdeleted: true });

    await userController.deleteUser(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User deleted successfully",
      deletedUser: true,
    });
  });

  // User not found
  test("should return 404 if user not found", async () => {
    userService.getUserByUsername.mockResolvedValue(null);

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // Unauthorized
  test("should return 403 if another user tries to delete account", async () => {
    req.user.username = "someoneElse";
    userService.getUserByUsername.mockResolvedValue({ name: "t3st" });

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized to delete this account",
    });
  });

  // Wrong Password
  test("should return 400 if password is incorrect", async () => {
    userService.getUserByUsername.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "password is incorrect" });
  });

  // Confirm message wrong
  test("should return 400 if confirm message is wrong", async () => {
    req.body.confirmMessage = "Wrong";
    userService.getUserByUsername.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(true);

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please type 'Confirm' to delete your account",
    });
  });

  // Internal server error
  test("should return 500 on unexpected error", async () => {
    userService.getUserByUsername.mockRejectedValue(new Error("DB failed"));

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      error: "DB failed",
    });
  });
});
});
