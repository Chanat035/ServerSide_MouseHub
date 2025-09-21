import jwt from "jsonwebtoken";
import userService from "../services/userService.js";

const authMiddleware = (requiredRole = undefined) => {
  return async (req, res, next) => {
    try {
      const jwt_secret = process.env.JWT_SECRET;

      let token;
      if (req.headers['authorization']) {
        const tokenArray = req.headers['authorization'].split(' ');
        token = tokenArray[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decodedToken = jwt.verify(token, jwt_secret);
      const user = await userService.getUserById(decodedToken.userId);

      if (user) {
        if (requiredRole && user.role !== requiredRole) {
          return res.status(403).json({ message: "Forbidden" });
        }
        req.user = { id: decodedToken._id || decodedToken.userId };
        next();
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

export default authMiddleware;
