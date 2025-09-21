import cartService from "../services/cartService.js";
import productService from "../services/productService.js";

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCartByUserId(userId);
      return res.status(200).json(cart);
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
      const userId = req.user.id;

      if (!productId || !quantity) {
        return res
          .status(400)
          .json({ message: "Product ID and quantity required" });
      }

      const cart = await cartService.addToCart(userId, productId, quantity);
      return res.status(200).json({
        message: "Added to cart successfully",
        cart,
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
      const { id } = req.query;
      const { quantity } = req.body;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (quantity <= 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be at least 1" });
      }
      
      if (!id || !quantity) {
        return res
          .status(400)
          .json({ message: "Product ID and quantity required" });
      }
      if (!Number.isInteger(quantity)) {
        return res
          .status(400)
          .json({ message: "Quantity must be an integer" });
      }
      if (quantity > product.quantity) {
        return res
          .status(400)
          .json({ message: "Quantity is greater than available stock" });
      }
      const cart = await cartService.updateCart(userId, id, quantity);
      return res.status(200).json(cart);
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
      return res.status(200).json({message: "Removed from cart successfully", cart});
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};
export default cartController;
