import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const useOrderRoute = async (router) => {
  /**
   * @swagger
   * tags:
   *   name: Order
   *   description: Order management endpoints
   */

  /**
   * @swagger
   * /api/order:
   *   post:
   *     summary: Create a new order
   *     tags: [Order]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [shippingAddress]
   *             properties:
   *               shippingAddress:
   *                 type: string
   *                 example: "99 ถนนจรัญสนิทวงศ์ เขตบางพลัด กรุงเทพฯ"
   *     responses:
   *       201:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Order"
   *       400:
   *         description: Invalid input
   */
    router.post("/order", authMiddleware(), orderController.createOrder);
  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: Get orders by user ID (authenticated user)
   *     tags: [Order]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: รายการคำสั่งซื้อของผู้ใช้
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Order"
   *       500:
   *         description: Server error
   */
    router.get("/orders", authMiddleware(), orderController.getOrdersByUserId);

  /**
   * @swagger
   * /api/allOrders:
   *   get:
   *     summary: Get all orders (admin only)
   *     tags: [Order]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: รายการคำสั่งซื้อทั้งหมด
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Order"
   *       403:
   *         description: Forbidden (not admin)
   */
    router.get("/allOrders", authMiddleware("admin"), orderController.getAllOrders);
  /**
   * @swagger
   * /api/updateOrderStatus:
   *   patch:
   *     summary: Update order status (admin only)
   *     tags: [Order]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [orderId, status, paymentStatus]
   *             properties:
   *               orderId:
   *                 type: string
   *                 example: 66fcf09bb5e92d50d3b726c2
   *               status:
   *                 type: string
   *                 example: "delivered"
   *               paymentStatus:
   *                 type: string
   *                 example: "paid"
   *     responses:
   *       200:
   *         description: Order status updated successfully
   *       400:
   *         description: Invalid request
   */
    router.patch("/updateOrderStatus", authMiddleware("admin"), orderController.updateOrderStatus);
};

export default useOrderRoute;