import authMiddleware from "../middleware/authMiddleware.js";
import productService from "../services/productService.js";
import orderService from "../services/orderService.js";

const useWebRoute = (router) => {
  // หน้าแรก
  router.get("/", (req, res) => {
    res.render("index", { title: "หน้าแรก MouseHub", user: res.locals.user });
  });

  // หน้า products (public)
  router.get("/products", (req, res) => {
    res.render("products", { title: "สินค้า MouseHub", user: res.locals.user });
  });

  // หน้า admin
  router.get("/admin", authMiddleware("admin", true), (req, res) => {
    res.render("admin", { title: "แผงควบคุมผู้ดูแลระบบ", user: res.locals.user });
  });

  // หน้า settings / account (ต้อง login)
  router.get("/settings", authMiddleware(undefined, true), (req, res) => {
    const show = req.query.show || "change";
    res.render("account", { user: res.locals.user, show });
  });

  // route ไปหน้า productDetail
  router.get('/productDetail', async (req, res) => {
    const { name } = req.query;
    const products = await productService.getProductByName(name);

    if (!products || products.length === 0) return res.redirect('/products');

    const product = products[0]; // เลือกตัวแรก
    res.render('productDetail', {
      product,
      productId: product._id
    });
  });

  router.get("/search", async (req, res) => {
    try {
      const { name } = req.query;
      if (!name || name.trim() === "") return res.json({ products: [] });

      const products = await productService.getProductByName(name);
      res.json({ products });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/order", authMiddleware(undefined, true), async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await orderService.getOrdersByUserId(userId);
      res.render("orders", { orders, user: res.locals.user, title: "My Orders" });
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  });

};


export default useWebRoute;
