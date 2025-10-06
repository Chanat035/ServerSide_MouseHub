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

  createOrder: async (userId, shippingAddress) => {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const finalShippingAddress = shippingAddress || user.address;
    if (!finalShippingAddress) {
      throw new Error("Shipping address is required");
    }

    // ดึง product ทั้งหมดพร้อมกัน
    const productIds = cart.items.map((item) => item.productId._id);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = productMap.get(item.productId._id.toString());
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.quantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      // ลด stock
      product.quantity -= item.quantity;
    }

    // save ทุก product ทีเดียว (batch)
    await Promise.all(products.map((p) => p.save()));

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress: finalShippingAddress,
      status: "pending",
      paymentStatus: "unpaid",
    });

    await order.save();

    // เคลียร์ cart หลังจากสั่งซื้อ
    cart.items = [];
    await cart.save();

    return order;
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
