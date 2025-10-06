import paymentService from "../services/paymentService.js";
import userService from "../services/userService.js";
import orderService from "../services/orderService.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const SYSTEM_USER_ID = "68bc0e6eee5cd4e500edd24b"; // wallet ของระบบ

const paymentController = {
  addBalance: async (req, res) => {
    try {
      const { id, amount } = req.body;

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount format" });
      }

      const updatedBalance = await paymentService.addBalance(user, amount);
      return res.status(200).json({
        message: "Balance updated successfully",
        balance: updatedBalance.balance,
      });
    } catch (error) {
      console.error("Error in addBalance:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  checkout: async (req, res) => {
    const session = await Order.startSession(); // ใช้ transaction กัน rollback
    session.startTransaction();

    try {
      const { id, shippingAddress } = req.body;

      // 1) validate user
      const user = await userService.getUserById(id);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "User not found" });
      }

      // 2) ดึง cart มา validate
      const cart = await Cart.findOne({ userId: id }).populate(
        "items.productId"
      );
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cart is empty" });
      }

      // 3) คำนวณยอดรวม
      let totalAmount = 0;
      for (const item of cart.items) {
        const product = await Product.findById(item.productId._id);
        if (!product || product.quantity < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(400)
            .json({ message: `Not enough stock for ${item.productId.name}` });
        }
        totalAmount += product.price * item.quantity;
      }

      // 4) เช็ค balance ก่อน
      if (user.balance < totalAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // 5) หักเงิน user + เติมเข้า system user
      await paymentService.checkout(user, totalAmount);
      const systemUser = await userService.getUserById(SYSTEM_USER_ID);
      if (systemUser) {
        await paymentService.addBalance(systemUser, totalAmount);
      }

      // 6) สร้าง order จริง (ตรงนี้ค่อย commit order)
      const order = await orderService.createOrder(id, shippingAddress);

      // 7) update order เป็น paid
      order.paymentStatus = "paid";
      await order.save();

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Payment successful, order created",
        order,
        balance: user.balance,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error in payment:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default paymentController;
