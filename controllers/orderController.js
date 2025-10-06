import orderService from "../services/orderService.js";

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { shippingAddress } = req.body;

      const order = await orderService.createOrder(userId, shippingAddress);
      return res.status(201).json(order);
    } catch (error) {
      return res.status(400).json({
        message: "Failed to create order",
        error: error.message,
      });
    }
  },

  getOrdersByUserId: async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await orderService.getOrdersByUserId(userId);
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await orderService.getAllOrders();
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { orderId, status, paymentStatus } = req.body;

      const updatedOrder = await orderService.updateOrderStatus(
        orderId,
        status,
        paymentStatus
      );
      return res.status(200).json(updatedOrder);
    } catch (error) {
      return res.status(400).json({
        message: "Failed to update order status",
        error: error.message,
      });
    }
  },
};

export default orderController;
