import orderController from "../controllers/orderController.js";
import orderService from "../services/orderService.js";

jest.mock("../services/orderService.js");

describe("orderController", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "user1" }, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // ✅ getOrdersByUserId
  test("should return 200 with order list for mouse products", async () => {
    const mockOrders = [
      {
        id: "order1",
        items: [{ name: "Logitech G Pro Wireless Mouse", quantity: 1 }],
      },
    ];
    orderService.getOrdersByUserId.mockResolvedValue(mockOrders);

    await orderController.getOrdersByUserId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockOrders);
  });

  // ❌ error in getOrdersByUserId
  test("should return 500 when service throws error", async () => {
    orderService.getOrdersByUserId.mockRejectedValue(new Error("DB crash"));

    await orderController.getOrdersByUserId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
      error: "DB crash",
    });
  });

  // ✅ getAllOrders
  test("should return 200 for all mouse orders", async () => {
    const mockOrders = [
      { id: "o1", items: ["Razer Basilisk V3"], totalAmount: 2500 },
      { id: "o2", items: ["Glorious Model O Wireless"], totalAmount: 2900 },
    ];
    orderService.getAllOrders.mockResolvedValue(mockOrders);

    await orderController.getAllOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockOrders);
  });

  // ✅ updateOrderStatus
  test("should update order status successfully", async () => {
    req.body = { orderId: "o1", status: "delivered", paymentStatus: "paid" };
    const updatedOrder = { id: "o1", status: "delivered" };
    orderService.updateOrderStatus.mockResolvedValue(updatedOrder);

    await orderController.updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedOrder);
  });

  // ❌ fail to update
  test("should return 400 on update failure", async () => {
    orderService.updateOrderStatus.mockRejectedValue(new Error("Invalid ID"));

    await orderController.updateOrderStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to update order status",
      error: "Invalid ID",
    });
  });
});
