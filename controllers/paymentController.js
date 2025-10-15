import paymentService from "../services/paymentService.js";
import userService from "../services/userService.js";
import orderService from "../services/orderService.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID; // wallet ของระบบ

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
    const session = await Order.startSession();
    session.startTransaction();

    try {
      const { shippingAddress, useDefaultAddress } = req.body;
      let id;

      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "ไม่มี token ใน cookie" });
      }

      // decode JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        id = decoded.userId;
      } catch (err) {
        console.error("JWT decode error:", err);
        res.status(403).json({ message: "Token ไม่ถูกต้อง" });
      }

      // 1) ตรวจสอบ user
      const user = await userService.getUserById(id);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "User not found" });
      }

      // 2) ตรวจสอบ cart
      const cart = await Cart.findOne({ userId: id }).populate(
        "items.productId"
      );
      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cart is empty" });
      }

      // 3) ตรวจสอบ stock และคำนวณยอดรวม
      let totalAmount = 0;
      for (const item of cart.items) {
        const product = item.productId;
        if (!product || product.quantity < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `Not enough stock for ${
              product?.name || "unknown product"
            }`,
          });
        }
        totalAmount += product.price * item.quantity;

        // ลด stock ทันที
        product.quantity -= item.quantity;
        await product.save({ session });
      }

      // 4) ตรวจสอบยอดเงิน
      if (user.balance < totalAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // 5) หักเงินจาก user และโอนไป system
      await paymentService.checkout(user, totalAmount);
      const systemUser = await userService.getUserById(SYSTEM_USER_ID);
      if (systemUser) await paymentService.addBalance(systemUser, totalAmount);

      // 6) ✅ สร้าง order เอง (ไม่เรียก orderService)

      // ✅ ถ้าผู้ใช้ไม่กรอก address หรือส่งเป็น "" → ใช้ address จาก database
      let finalAddress =
        shippingAddress && shippingAddress.trim() !== ""
          ? shippingAddress.trim()
          : user.address;

      // ถ้าไม่มีทั้ง address จาก input และใน database เลย → error
      if (!finalAddress || finalAddress.trim() === "") {
        return res
          .status(400)
          .json({ message: "Shipping address is required" });
      }

      if (!finalAddress && useDefaultAddress) {
        finalAddress = user.address; // ดึงจาก user ใน database
      }

      if (!finalAddress) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Shipping address is required" });
      }

      const newOrder = new Order({
        userId: id,
        shippingAddress: finalAddress,
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          name: item.productId.name,
          quantity: item.quantity,
          price: item.productId.price,
        })),
        totalAmount,
        status: "pending",
        paymentStatus: "paid",
        createdAt: new Date(),
      });
      await newOrder.save({ session });

      // 7) เคลียร์ตะกร้า
      await Cart.deleteOne({ userId: id });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: "Checkout complete. Order created and paid successfully.",
        order: newOrder,
        balance: user.balance,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Error in checkout:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default paymentController;
