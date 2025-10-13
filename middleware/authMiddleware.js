import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

const authMiddleware = (requiredRole = undefined, attachOnly = false) => {
  return async (req, res, next) => {
    try {
      const jwt_secret = process.env.JWT_SECRET;

      // ✅ อ่าน token จาก Header หรือ Cookie
      let token;
      if (req.headers['authorization']) {
        const tokenArray = req.headers['authorization'].split(' ');
        token = tokenArray[1];
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      // ✅ ถ้าไม่มี token
      if (!token) {
        if (attachOnly) {
          res.locals.user = null;
          return next(); // <--- สำคัญมาก
        } else {
          // ถ้าเป็น API ก็ส่งกลับ JSON
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      // ✅ ตรวจสอบ token
      const decoded = jwt.verify(token, jwt_secret);
      const user = await userService.getUserById(decoded.userId);

      // ถ้า user ไม่มีในระบบ
      if (!user) {
        if (attachOnly) {
          res.locals.user = null;
          return next();
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      // ✅ แนบข้อมูลผู้ใช้ให้ EJS และ API
      req.user = { id: user._id, username: user.username, role: user.role };
      res.locals.user = req.user;

      // ✅ ตรวจ role (เฉพาะตอนที่ระบุ requiredRole)
      if (requiredRole && user.role !== requiredRole) {
        if (attachOnly) {
          return res.status(403).render("403"); // หน้า Forbidden
        }
        return res.status(403).json({ message: "Forbidden" });
      }

      next(); // ✅ ผ่าน
    } catch (err) {
      if (attachOnly) {
        res.locals.user = null;
        return next();
      }
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

export default authMiddleware;
