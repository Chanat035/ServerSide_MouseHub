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
    return await Product.findOne({ _id: id, isDeleted: null });
  },

  getProductByIdIncludeDeleted: async (id) => {
    return await Product.findById(id); // ไม่กรอง isDeleted
  },

  getProductByName: async (partialName) => {
    if (!partialName || partialName.trim() === "") return [];

    // ฟังก์ชัน escape regex
    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    return await Product.find({
      name: { $regex: escapeRegex(partialName), $options: "i" },
      isDeleted: null,
    });
  },


  getProductByType: async (category) => {
    const allowedCategories = ["Mouse", "Mousepad", "Mousefeet"];

    // ถ้าไม่ได้ระบุ category → แสดงเฉพาะสินค้าที่อยู่ใน enum
    if (!category || category.trim() === "") {
      return await Product.find({
        category: { $in: allowedCategories },
        isDeleted: null,
      });
    }

    // ถ้า category ที่ส่งมาไม่อยู่ใน enum → คืนค่าว่าง
    if (!allowedCategories.includes(category)) {
      return [];
    }

    // แสดงเฉพาะสินค้าที่ category ตรงเป๊ะกับที่เลือก
    return await Product.find({
      category: category,
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
