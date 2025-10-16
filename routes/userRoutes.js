import userController, {
  userLoginSchema,
  userRegistrationSchema,
  changePasswordSchema,
  deleteUserSchema,
  updateUserSchema,
} from "../controllers/userControllers.js";
import validateData from "../middleware/validationMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useUserRoute = async (router) => {
  /**
   * @swagger
   * tags:
   *   name: Users
   *   description: User management endpoints
   */

  /**
   * @swagger
   * /api/user:
   *   get:
   *     summary: Get all users (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: A list of all users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   */
  router.get("/user", authMiddleware("admin"), userController.getAllUsers);

  /**
   * @swagger
   * /api/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, email, phone, address, password, confirmPassword]
   *             properties:
   *               name:
   *                 type: string
   *                 example: johndoe
   *               email:
   *                 type: string
   *                 example: john@example.com
   *               phone:
   *                 type: string
   *                 example: "0812345678"
   *               address:
   *                 type: string
   *                 example: "123 Bangkok, Thailand"
   *               password:
   *                 type: string
   *                 example: P@ssw0rd!
   *               confirmPassword:
   *                 type: string
   *                 example: P@ssw0rd!
   *     responses:
   *       201:
   *         description: User registered successfully
   */
  router.post(
    "/register",
    validateData(userRegistrationSchema),
    userController.register
  );

  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: Login
   *     description: Authenticate a user or admin and return a JWT token.
   *       If the account is marked as deleted (`isDeleted` not null), login will be rejected.
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 description: Username of the user
   *               password:
   *                 type: string
   *                 description: Password of the user
   *           examples:
   *             userLogin:
   *               summary: Login as User
   *               value:
   *                 name: johndoe
   *                 password: P@ssw0rd!
   *             adminLogin:
   *               summary: Login as Admin
   *               value:
   *                 name: NongP
   *                 password: ppp243
   *     responses:
   *       200:
   *         description: JWT token returned upon successful login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: JWT token for authentication
   *       401:
   *         description: Unauthorized, invalid username or password
   *       403:
   *         description: Account is deleted and cannot log in
   */

  router.post("/login", validateData(userLoginSchema), userController.login);

  /**
   * @swagger
   * /api/logout:
   *   post:
   *     summary: Logout
   *     description: Invalidate the current session by clearing the JWT token (client should remove stored token or cookie).
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: User logged out successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: User logged out successfully!
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Unauthorized
   */

  router.post("/logout", authMiddleware(), userController.logout);

  /**
   * @swagger
   * /api/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 68cd7e2cb03c39fc44bd3803
   *     responses:
   *       200:
   *         description: Profile details of the logged-in user
   */
  router.get("/profile", authMiddleware(), userController.profile);

  /**
   * @swagger
   * /api/changePassword:
   *   patch:
   *     summary: Change password
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, oldPassword, newPassword, confirmPassword]
   *             properties:
   *               name:
   *                 type: string
   *                 example: johndoe
   *               oldPassword:
   *                 type: string
   *                 example: P@ssw0rd!
   *               newPassword:
   *                 type: string
   *                 example: NewP@ss123
   *               confirmPassword:
   *                 type: string
   *                 example: NewP@ss123
   *     responses:
   *       200:
   *         description: Password changed successfully
   */
  router.patch(
    "/changePassword",
    validateData(changePasswordSchema),
    userController.changePassword
  );

  /**
   * @swagger
   * /api/updateUser:
   *   patch:
   *     summary: Update user profile
   *     description: Update the logged-in user's profile (except balance). Requires current password for verification.
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, password, updates]
   *             properties:
   *               name:
   *                 type: string
   *                 example: johndoe
   *               password:
   *                 type: string
   *                 example: P@ssw0rd!
   *               updates:
   *                 type: object
   *                 properties:
   *                   email:
   *                     type: string
   *                     example: john.new@example.com
   *                   phone:
   *                     type: string
   *                     example: "0811111111"
   *                   address:
   *                     type: string
   *                     example: "456 Chiang Mai, Thailand"
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       400:
   *         description: Invalid input or incorrect password
   *       403:
   *         description: Unauthorized (username mismatch)
   *       404:
   *         description: User not found
   */
  router.patch(
    "/updateUser",
    validateData(updateUserSchema),
    authMiddleware(),
    userController.updateUser
  );

  /**
   * @swagger
   * /api/user:
   *   delete:
   *     summary: Delete user (self-delete only)
   *     description:
   *       Permanently mark the authenticated user as deleted.
   *       Username in JWT token must match the provided username in the request body.
   *       Once deleted, the user will be automatically logged out (token cleared).
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, password, confirmMessage]
   *             properties:
   *               name:
   *                 type: string
   *                 example: johndoe
   *               password:
   *                 type: string
   *                 example: P@ssw0rd!
   *               confirmMessage:
   *                 type: string
   *                 example: Confirm
   *     responses:
   *       200:
   *         description: User deleted successfully and logged out
   *       400:
   *         description: Password or confirmation message incorrect
   *       403:
   *         description: Username in token does not match the provided username
   *       404:
   *         description: User not found
   */
  router.delete(
    "/user",
    validateData(deleteUserSchema),
    authMiddleware(),
    userController.deleteUser
  );

  /**
   * @swagger
   * /api/restoreUser:
   *   patch:
   *     summary: Restore a deleted user (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 68cd7e2cb03c39fc44bd3803
   *     responses:
   *       200:
   *         description: User restored successfully
   */
  router.patch(
    "/restoreUser",
    authMiddleware("admin"),
    userController.restoreUser
  );
};

export default useUserRoute;
