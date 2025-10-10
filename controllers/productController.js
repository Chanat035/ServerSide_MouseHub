import productService from "../services/productService.js";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  brand: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  imgUrl: z.string().optional(),
});

const productController = {
  getAllProducts: async (req, res) => {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  },

  detail: async (req, res) => {
    try {
      const { id } = req.query;

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(200).json({
        productName: product.name,
        price: product.price,
        brand: product.brand,
        quantity: product.quantity,
        brand: product.brand,
        category: product.category,
        description: product.description,
        imgUrl: product.imgUrl,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  searchProducts: async (req, res) => {
    try {
      const { name } = req.query;

      const product = await productService.getProductByName(name);

      const formattedProducts = product.map((product) => ({
        productName: product.name,
        price: product.price,
        brand: product.brand,
        quantity: product.quantity,
        category: product.category,
        description: product.description,
        imgUrl: product.imgUrl,
      }));

      if (!product || product.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      return res.status(200).json({ products: formattedProducts });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  filther: async (req, res) => {
    try {
      const { category } = req.query;
      const products = await productService.getProductByType(category);

      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      const formattedProducts = products.map((product) => ({
        productName: product.name,
        price: product.price,
        brand: product.brand,
        quantity: product.quantity,
        category: product.category,
        description: product.description,
        imgUrl: product.imgUrl,
      }));

      return res.status(200).json({ products: formattedProducts });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, price, brand, quantity, category, description, imgUrl } =
        req.body;

      const product = await productService.createProduct(
        name,
        price,
        quantity,
        brand,
        category,
        description,
        imgUrl
      );
      return res
        .status(201)
        .json({ message: "Product created successfully!", product });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const {
        id,
        name,
        price,
        brand,
        quantity,
        category,
        description,
        imgUrl,
      } = req.body;

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const updatedProduct = await productService.updateProduct(product, {
        name,
        price,
        brand,
        quantity,
        category,
        description,
        imgUrl,
      });

      return res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id, confirmMessage } = req.body;

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          message: "product not found",
        });
      }

      if (confirmMessage !== "Confirm") {
        return res.status(400).json({
          message: "Please type 'Confirm' to delete your account",
        });
      }

      const deleteProduct = await productService.deleteProduct(product);
      return res.status(200).json({
        message: "Product deleted successfully",
        deletedProduct: deleteProduct.isdeleted,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  restoreProduct: async (req, res) => {
    try {
      const { id } = req.body;

      const product = await productService.getProductByIdIncludeDeleted(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (!product.isDeleted) {
        return res.status(400).json({
          message: "Product is not deleted",
        });
      }

      const restoreProduct = await productService.restoreProduct(product);
      return res.status(200).json({
        message: "Product restored successfully",
        restoreProduct: restoreProduct.isdeleted,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

export default productController;
export { createProductSchema };
