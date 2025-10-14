import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

const authMiddleware = (requiredRole = undefined, attachOnly = false) => {
  return async (req, res, next) => {
    try {
      const jwt_secret = process.env.JWT_SECRET;
      let token;

      if (req.headers['authorization']) {
        token = req.headers['authorization'].split(' ')[1];
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        res.locals.user = null; // attach ให้ EJS
        if (attachOnly) return next();
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, jwt_secret);
      const user = await userService.getUserById(decoded.userId);

      if (!user) {
        res.locals.user = null;
        if (attachOnly) return next();
        return res.status(401).json({ message: "Unauthorized" });
      }

      // attach user ให้ทั้ง EJS และ API
      req.user = { id: user._id, username: user.name, role: user.role };
      res.locals.user = req.user;

      // ตรวจ role เฉพาะตอน requiredRole
      if (requiredRole && user.role !== requiredRole) {
        if (attachOnly) return res.status(403).render("403");
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      res.locals.user = null;
      if (attachOnly) return next();
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

export default authMiddleware;
