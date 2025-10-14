import paymentController from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const usePaymentRoute = async (router) => {
  /**
   * @swagger
   * tags:
   *   name: Payment
   *   description: Payment management endpoints
   */

  /**
   * @swagger
   * /api/addBalance:
   *   patch:
   *     summary: Add balance to a user account (admin only)
   *     tags: [Payment]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id, amount]
   *             properties:
   *               id:
   *                 type: string
   *                 example: "66fcf09bb5e92d50d3b726a1"
   *               amount:
   *                 type: number
   *                 example: 500
   *     responses:
   *       200:
   *         description: Balance updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Balance updated successfully"
   *                 balance:
   *                   type: number
   *                   example: 1500
   *       400:
   *         description: Invalid amount
   *       404:
   *         description: User not found
   */
  router.patch(
    "/addBalance",
    authMiddleware("admin"),
    paymentController.addBalance
  );

  /**
   * @swagger
   * /api/checkout:
   *   post:
   *     summary: Checkout and create a paid order
   *     tags: [Payment]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id, shippingAddress]
   *             properties:
   *               id:
   *                 type: string
   *                 example: "66fcf09bb5e92d50d3b726a1"
   *               shippingAddress:
   *                 type: string
   *                 example: "55 ซอยสุขุมวิท 77 เขตสวนหลวง กรุงเทพฯ"
   *     responses:
   *       200:
   *         description: Payment successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Payment successful, order created"
   *                 order:
   *                   $ref: "#/components/schemas/Order"
   *                 balance:
   *                   type: number
   *                   example: 180
   *       400:
   *         description: Insufficient balance or invalid cart
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.post("/checkout", authMiddleware(), paymentController.checkout);
};

export default usePaymentRoute;