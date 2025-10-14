import cartController from "../controllers/cartController.js";
import cartService from "../services/cartService.js";
import productService from "../services/productService.js";

jest.mock("../services/cartService.js");
jest.mock("../services/productService.js");

describe("cartController", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: "user1" }, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // ✅ getCart
  test("should return 200 and cart items (mouse products)", async () => {
    const mockCart = {
      items: [{ name: "Logitech MX Master 3S", quantity: 1 }],
    };
    cartService.getCartByUserId.mockResolvedValue(mockCart);

    await cartController.getCart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCart.items);
  });

  // ✅ addToCart success
  test("should add mouse to cart successfully", async () => {
    req.body = { productId: "mouse1", quantity: 2 };
    const updatedCart = {
      items: [{ name: "Razer DeathAdder V3", quantity: 2 }],
    };
    cartService.addToCart.mockResolvedValue(updatedCart);

    await cartController.addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Added to cart successfully",
      items: updatedCart.items,
    });
  });

  // ❌ addToCart missing fields
  test("should return 400 if productId or quantity missing", async () => {
    req.body = { productId: null, quantity: null };

    await cartController.addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product ID and quantity required",
    });
  });

  // ❌ updateCart invalid quantity
  test("should return 400 if quantity is 0", async () => {
    req.body = { productId: "mouse2", quantity: 0 };
    productService.getProductById.mockResolvedValue({ name: "Mouse" });

    await cartController.updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Quantity must be at least 1",
    });
  });

  // ✅ updateCart success
  test("should update cart when mouse quantity valid", async () => {
    req.body = { productId: "mouse3", quantity: 1 };
    const mockProduct = { id: "mouse3", name: "SteelSeries Prime Mini", quantity: 5 };
    const mockCart = {
      items: [{ name: "SteelSeries Prime Mini", quantity: 1 }],
    };
    productService.getProductById.mockResolvedValue(mockProduct);
    cartService.updateCart.mockResolvedValue(mockCart);

    await cartController.updateCart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockCart.items);
  });

  // ✅ removeFromCart
  test("should remove mouse from cart successfully", async () => {
    req.body = { productId: "mouseX" };
    const mockCart = {
      items: [{ name: "Glorious Model D", quantity: 1 }],
    };
    cartService.removeFromCart.mockResolvedValue(mockCart);

    await cartController.removeFromCart(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Removed from cart successfully",
      items: mockCart.items,
    });
  });
});
