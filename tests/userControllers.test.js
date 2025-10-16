import userController from "../controllers/userControllers.js";
import userService from "../services/userService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      render: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // register success
  test("should register successfully and redirect", async () => {
    userService.getUserByUsername.mockResolvedValue(null);
    userService.getUserByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    userService.register.mockResolvedValue({ id: 1, name: "t3st" });

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.redirect).toHaveBeenCalledWith("/", {
      message: "User registered successfully!",
    });
  });

  test("should render error if passwords do not match", async () => {
    req.body.confirmPassword = "different";

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      registerError: "Password not match",
    }));
  });

  test("should render error if username already exists", async () => {
    userService.getUserByUsername.mockResolvedValue({ id: 99 });

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      registerError: "Username is already registered",
    }));
  });

  test("should render error if email already exists", async () => {
    userService.getUserByUsername.mockResolvedValue(null);
    userService.getUserByEmail.mockResolvedValue({ id: 11 });

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      registerError: "Email is already registered",
    }));
  });

  test("should render internal server error", async () => {
    userService.getUserByUsername.mockRejectedValue(new Error("DB failed"));

    await userController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      registerError: "Internal server error",
    }));
  });
});

describe("userController.login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { name: "t3st", password: "test1234" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      render: jest.fn(),
      redirect: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("should redirect after successful login", async () => {
    const user = {
      id: 1,
      name: "t3st",
      password: "hashedPassword",
      isDeleted: null,
      role: "user",
      balance: 100,
    };

    userService.getUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-jwt-token");

    await userController.login(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/");
    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "fake-jwt-token",
      expect.any(Object)
    );
  });

  test("should render error if wrong password", async () => {
    const user = { password: "hashedPassword", isDeleted: null };
    userService.getUserByUsername.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      loginError: "Username or password incorrect",
    }));
  });

  test("should render error if user not found", async () => {
    userService.getUserByUsername.mockResolvedValue(null);

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      loginError: "Username or password incorrect",
    }));
  });

  test("should return json if user is deleted", async () => {
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

  test("should render 500 on unexpected error", async () => {
    userService.getUserByUsername.mockRejectedValue(new Error("DB failed"));

    await userController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("index", expect.objectContaining({
      loginError: "Internal server error",
    }));
  });
});
