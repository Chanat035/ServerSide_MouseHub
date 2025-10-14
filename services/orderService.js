import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
const orderService = {
  getOrdersByUserId: async (userId) => {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  },

  getAllOrders: async () => {
    return await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  },

  updateOrderStatus: async (orderId, status, paymentStatus) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (status) {
      order.status = status;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return order;
  },
};

export default orderService;
