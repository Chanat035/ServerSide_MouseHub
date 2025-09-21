import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const cartService = {
  getCartByUserId: async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart.items;
  },
  addToCart: async (userId, productId, quantity) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [
          {
            productId,
            name: product.name,
            price: product.price,
            quantity,
            imgUrl: product.imgUrl,
          },
        ],
      });
    } else {
      const idx = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (idx > -1) {
        cart.items[idx].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name: product.name,
          price: product.price,
          quantity,
          imgUrl: product.imgUrl,
        });
      }
      await cart.save();
    }
    return cart.items;
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
    return cart.items;
  },

  removeFromCart: async (userId, productId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Cart not found");
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    return cart;
  }
};

export default cartService;
