import productController, { createProductSchema } from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validateData from "../middleware/validationMiddleware.js";

const useProductRoute = async (router) => {
  /**
   * @swagger
   * tags:
   *   name: Products
   *   description: Product management endpoints
   */

  /**
   * @swagger
   * /api/product:
   *   get:
   *     summary: Get all products (admin only)
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   */
  router.get('/product', authMiddleware("admin"), productController.getAllProducts);

  /**
   * @swagger
   * /api/create:
   *   post:
   *     summary: Create a new product (admin only)
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, price]
   *             properties:
   *               name:
   *                 type: string
   *                 example: Logitech G Pro Wireless
   *               price:
   *                 type: number
   *                 example: 3790
   *               quantity:
   *                 type: number
   *                 example: 100
   *               brand:
   *                 type: string
   *                 example: Logitech
   *               category:
   *                 type: string
   *                 example: Mouse
   *               description:
   *                 type: string
   *                 example: High performance gaming mouse
   *               imgUrl:
   *                 type: string
   *                 example: https://example.com/mouse.jpg
   *     responses:
   *       201:
   *         description: Product created successfully
   */
  router.post('/create', authMiddleware("admin"), validateData(createProductSchema), productController.createProduct);

  /**
   * @swagger
   * /api/detail:
   *   get:
   *     summary: Get product detail by ID (excluding deleted products)
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product detail
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found or deleted
   */
  router.get('/detail', productController.detail);

  /**
   * @swagger
   * /api/search:
   *   get:
   *     summary: Search products by name (excluding deleted products)
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *         description: Partial product name to search
   *     responses:
   *       200:
   *         description: Matching products
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       404:
   *         description: No matching products found
   */
  router.get('/search', productController.searchProducts);

  /**
   * @swagger
   * /api/filther:
   *   get:
   *     summary: Filter products by category (exact match, excluding deleted)
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: category
   *         required: false
   *         schema:
   *           type: string
   *           enum: [Mouse, Mousepad, Mousefeet]
   *         description: Filter products by specific category. If empty, returns all in enum.
   *     responses:
   *       200:
   *         description: Products filtered by category
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   *       404:
   *         description: No products found for this category
   */
  router.get('/filther', productController.filther);

  /**
   * @swagger
   * /api/update:
   *   patch:
   *     summary: Update product (admin only)
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: string
   *               name:
   *                 type: string
   *               price:
   *                 type: number
   *               quantity:
   *                 type: number
   *               brand:
   *                 type: string
   *               category:
   *                 type: string
   *               description:
   *                 type: string
   *               imgUrl:
   *                 type: string
   *     responses:
   *       200:
   *         description: Product updated successfully
   */
  router.patch('/update', authMiddleware("admin"), productController.updateProduct);

  /**
   * @swagger
   * /api/product:
   *   delete:
   *     summary: Soft delete a product (admin only)
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [id, confirmMessage]
   *             properties:
   *               id:
   *                 type: string
   *                 example: 650f1a2b3c4d5e6f7a8b9c0d
   *               confirmMessage:
   *                 type: string
   *                 example: Confirm
   *     responses:
   *       200:
   *         description: Product soft-deleted successfully
   */
  router.delete('/product', authMiddleware("admin"), productController.deleteProduct);

  /**
   * @swagger
   * /api/restore:
   *   patch:
   *     summary: Restore a soft-deleted product (admin only)
   *     tags: [Products]
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
   *               id:
   *                 type: string
   *                 example: 650f1a2b3c4d5e6f7a8b9c0d
   *     responses:
   *       200:
   *         description: Product restored successfully
   *       400:
   *         description: Product is not deleted
   *       404:
   *         description: Product not found
   */
  router.patch('/restore', authMiddleware("admin"), productController.restoreProduct);
};

export default useProductRoute;
