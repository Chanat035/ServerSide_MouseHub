import productController from "../controllers/productController.js";
import productService from "../services/productService.js";

jest.mock("../services/productService.js");

describe("productController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // 🧩 getAllProducts
  describe("getAllProducts", () => {
    test("should return 200 and product list", async () => {
      const mockProducts = [{ id: 1, name: "item1" }];
      productService.getAllProducts.mockResolvedValue(mockProducts);

      await productController.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });
  });

  // 🧩 detail
  describe("detail", () => {
    test("should return 200 with product detail", async () => {
      req.query.id = 1;
      const product = {
        id: 1,
        name: "item1",
        price: 100,
        brand: "logitech",
        quantity: 5,
        category: "Mouse",
        description: "Mouse",
        imgUrl: "img.jpg",
      };
      productService.getProductById.mockResolvedValue(product);

      await productController.detail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        productName: "item1",
        price: 100,
        brand: "logitech",
      }));
    });

    test("should return 404 if not found", async () => {
      req.query.id = 1;
      productService.getProductById.mockResolvedValue(null);

      await productController.detail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    test("should return 500 on error", async () => {
      req.query.id = 1;
      productService.getProductById.mockRejectedValue(new Error("DB failed"));

      await productController.detail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: "DB failed",
      });
    });
  });

  // 🧩 searchProducts
  describe("searchProducts", () => {
    test("should return 200 and formatted products", async () => {
      req.query.name = "item";
      productService.getProductByName.mockResolvedValue([
        { name: "item1", price: 100, brand: "A", quantity: 5 },
      ]);

      await productController.searchProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        products: expect.arrayContaining([
          expect.objectContaining({ productName: "item1" }),
        ]),
      });
    });

    test("should return 404 if no product found", async () => {
      productService.getProductByName.mockResolvedValue([]);

      await productController.searchProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No products found" });
    });
  });

  // 🧩 filther (filter by category)
  describe("filther", () => {
    test("should return 200 and filtered products", async () => {
      req.query.category = "Mouse";
      productService.getProductByType.mockResolvedValue([
        { name: "item1", price: 200, brand: "logitech", quantity: 2 },
      ]);

      await productController.filther(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        products: expect.arrayContaining([
          expect.objectContaining({ productName: "item1" }),
        ]),
      });
    });

    test("should return 404 if no products found", async () => {
      productService.getProductByType.mockResolvedValue([]);

      await productController.filther(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No products found" });
    });
  });

  // 🧩 createProduct
  describe("createProduct", () => {
    test("should return 201 and product created", async () => {
      req.body = {
        name: "item1",
        price: 50,
        brand: "X",
        quantity: 2,
      };
      const newProduct = { id: 1, ...req.body };
      productService.createProduct.mockResolvedValue(newProduct);

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product created successfully!",
        product: newProduct,
      });
    });

    test("should return 500 on error", async () => {
      productService.createProduct.mockRejectedValue(new Error("DB failed"));

      await productController.createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
        error: "DB failed",
      });
    });
  });

  // 🧩 updateProduct
  describe("updateProduct", () => {
    test("should return 200 if updated successfully", async () => {
      req.body = { id: 1, name: "item1" };
      const product = { id: 1, name: "old" };
      const updated = { id: 1, name: "item1" };

      productService.getProductById.mockResolvedValue(product);
      productService.updateProduct.mockResolvedValue(updated);

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product updated successfully",
        product: updated,
      });
    });

    test("should return 404 if not found", async () => {
      productService.getProductById.mockResolvedValue(null);

      await productController.updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });
  });

  // 🧩 deleteProduct
  describe("deleteProduct", () => {
    test("should return 200 if deleted successfully", async () => {
      req.body = { id: 1, confirmMessage: "Confirm" };
      const product = { id: 1, name: "item" };
      productService.getProductById.mockResolvedValue(product);
      productService.deleteProduct.mockResolvedValue({ isdeleted: true });

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product deleted successfully",
        deletedProduct: true,
      });
    });

    test("should return 400 if confirm message invalid", async () => {
      req.body = { id: 1, confirmMessage: "Wrong" };
      productService.getProductById.mockResolvedValue({ id: 1 });

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please type 'Confirm' to delete your account",
      });
    });

    test("should return 404 if product not found", async () => {
      productService.getProductById.mockResolvedValue(null);

      await productController.deleteProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "product not found" });
    });
  });

  // 🧩 restoreProduct
  describe("restoreProduct", () => {
    test("should return 200 if restored successfully", async () => {
      req.body = { id: 1 };
      const product = { id: 1, isDeleted: true };
      productService.getProductByIdIncludeDeleted.mockResolvedValue(product);
      productService.restoreProduct.mockResolvedValue({ isdeleted: false });

      await productController.restoreProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product restored successfully",
        restoreProduct: false,
      });
    });

    test("should return 404 if not found", async () => {
      productService.getProductByIdIncludeDeleted.mockResolvedValue(null);

      await productController.restoreProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    test("should return 400 if product is not deleted", async () => {
      productService.getProductByIdIncludeDeleted.mockResolvedValue({
        isDeleted: false,
      });

      await productController.restoreProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Product is not deleted" });
    });
  });
});