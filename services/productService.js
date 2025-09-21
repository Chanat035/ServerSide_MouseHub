import Product from "../models/Product.js";

const productService = {
  getAllProducts: async () => {
    return await Product.find();
  },

  createProduct: async (
    name,
    price,
    quantity,
    brand,
    category,
    description,
    imgUrl
  ) => {
    return await Product.create({
      name,
      price,
      quantity,
      brand,
      category,
      description,
      imgUrl,
    });
  },

  getProductById: async (id) => {
    return await Product.findById(id);
  },

  getProductByName: async (partialName) => {
    if (!partialName || partialName.trim() === "") return [];

    return await Product.find({
      name: { $regex: partialName, $options: "i" },
      isDeleted: null,
    });
  },

  updateProduct: async (product, newDetail) => {
    product.name = newDetail.name ?? product.name;
    product.price = newDetail.price ?? product.price;
    product.brand = newDetail.brand ?? product.brand;
    product.quantity = newDetail.quantity ?? product.quantity;
    product.category = newDetail.category ?? product.category;
    product.description = newDetail.description ?? product.description;
    product.imgUrl = newDetail.imgUrl ?? product.imgUrl;
    return await product.save();
  },

  deleteProduct: async (product) => {
    product.isDeleted = new Date();
    return await product.save();
  },

  restoreProduct: async (product) => {
    product.isDeleted = null;
    return await product.save();
  },
};

export default productService;
