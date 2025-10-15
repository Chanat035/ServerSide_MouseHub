import cartService from "../services/cartService.js";
import productService from "../services/productService.js";
import jwt from "jsonwebtoken";

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCartByUserId(userId);
      return res.status(200).json(cart?.items || []);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  addToCart: async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      let userId;

      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "ไม่มี token ใน cookie" });
      }

      // decode JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.error("JWT decode error:", err);
        res.status(403).json({ message: "Token ไม่ถูกต้อง" });
      }

      if (!productId || !quantity) {
        return res
          .status(400)
          .json({ message: "Product ID and quantity required" });
      }

      const cart = await cartService.addToCart(userId, productId, quantity);
      return res.status(200).json({
        message: "Added to cart successfully",
        items: cart.items,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;
      const product = await productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }

      if (!productId || !quantity) {
        return res
          .status(400)
          .json({ message: "Product ID and quantity required" });
      }
      if (!Number.isInteger(quantity)) {
        return res.status(400).json({ message: "Quantity must be an integer" });
      }
      if (quantity > product.quantity) {
        return res
          .status(400)
          .json({ message: "Quantity is greater than available stock" });
      }
      const cart = await cartService.updateCart(userId, productId, quantity);
      return res.status(200).json(cart.items);
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      const cart = await cartService.removeFromCart(userId, productId);
      return res.status(200).json({
        message: "Removed from cart successfully",
        items: cart.items,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};
export default cartController;
