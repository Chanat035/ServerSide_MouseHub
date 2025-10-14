import paymentController from "../controllers/paymentController.js";
import paymentService from "../services/paymentService.js";
import userService from "../services/userService.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

jest.mock("../services/paymentService.js");
jest.mock("../services/userService.js");
jest.mock("../models/Order.js");
jest.mock("../models/Cart.js");

describe("paymentController", () => {
  let req, res, sessionMock;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();

    sessionMock = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    Order.startSession.mockResolvedValue(sessionMock);
  });

  // ✅ addBalance success
  test("should return 200 when adding balance successfully", async () => {
    req.body = { id: "user1", amount: 500 };
    const user = { id: "user1", name: "Mouse Collector" };

    userService.getUserById.mockResolvedValue(user);
    paymentService.addBalance.mockResolvedValue({ balance: 2000 });

    await paymentController.addBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Balance updated successfully",
      balance: 2000,
    });
  });

  // ❌ invalid amount
  test("should return 400 if amount invalid", async () => {
    req.body = { id: "user1", amount: -50 };
    userService.getUserById.mockResolvedValue({ id: "user1" });

    await paymentController.addBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid amount format",
    });
  });

  // ❌ user not found
  test("should return 404 if user not found", async () => {
    req.body = { id: "ghost", amount: 100 };
    userService.getUserById.mockResolvedValue(null);

    await paymentController.addBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  // 💥 internal error
  test("should return 500 on internal error", async () => {
    userService.getUserById.mockRejectedValue(new Error("DB failed"));

    await paymentController.addBalance(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      error: "DB failed",
    });
  });
});
