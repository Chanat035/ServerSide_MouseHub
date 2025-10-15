import authMiddleware from "../middleware/authMiddleware.js";

const useWebRoute = (router) => {
  // หน้าแรก
  router.get("/", (req, res) => {
    res.render("index", { title: "หน้าแรก MouseHub", user: res.locals.user });
  });

  // หน้า admin
  router.get("/admin", authMiddleware("admin", true), (req, res) => {
    res.render("admin", { title: "แผงควบคุมผู้ดูแลระบบ", user: res.locals.user });
  });

  // หน้า settings / account
  router.get("/settings", authMiddleware(undefined, true), (req, res) => {
    const show = req.query.show || "change";
    res.render("account", { user: res.locals.user, show });
  });
};

export default useWebRoute;
