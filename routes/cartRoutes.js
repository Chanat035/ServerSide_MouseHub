import cartController from "../controllers/cartController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const useCartRoute = async (router) => {
  /**
   * @swagger
   * tags:
   *   name: Cart
   *   description: Cart management endpoints
   */

  /**
   * @swagger
   * /api/cart:
   *   get:
   *     summary: Get items in the user's cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of items in the cart
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   productId:
   *                     type: string
   *                   name:
   *                     type: string
   *                   price:
   *                     type: number
   *                   quantity:
   *                     type: number
   *                   imgUrl:
   *                     type: string
   */
  router.get('/cart', authMiddleware(), cartController.getCart);

  /**
   * @swagger
   * /api/addToCart:
   *   post:
   *     summary: Add a product to the cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [productId, quantity]
   *             properties:
   *               productId:
   *                 type: string
   *                 example: 650f1a2b3c4d5e6f7a8b9c0d
   *               quantity:
   *                 type: number
   *                 example: 2
   *     responses:
   *       200:
   *         description: Product added to cart
   */
  router.post('/addToCart', authMiddleware(), cartController.addToCart);

/**
 * @swagger
 * /api/updateCart:
 *   patch:
 *     summary: Update product quantity in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Bad request (invalid product ID, invalid quantity)
 *       404:
 *         description: Product not found
 */
  router.patch('/updateCart', authMiddleware(), cartController.updateCart);

  /**
   * @swagger
   * /api/removeFromCart:
   *   delete:
   *     summary: Remove product from the cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [productId]
   *             properties:
   *               productId:
   *                 type: string
   *                 example: 650f1a2b3c4d5e6f7a8b9c0d
   *     responses:
   *       200:
   *         description: Product removed from cart
   */
  router.delete('/removeFromCart', authMiddleware(), cartController.removeFromCart);
};

export default useCartRoute;
