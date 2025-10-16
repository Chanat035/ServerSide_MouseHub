import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const cartService = {
  getCartByUserId: async (userId) => {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    return cart;
  },

  addToCart: async (userId, productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      const idx = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (idx > -1) {
        cart.items[idx].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
    }

    // populate ตอน return
    return cart.populate("items.productId");
  },

  updateCart: async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) throw new Error("Item not found in cart");

    item.quantity = quantity;
    await cart.save();

    return cart.populate("items.productId");
  },

  removeFromCart: async (userId, productId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    await cart.save();

    return cart.populate("items.productId");
  },
};

export default cartService;
