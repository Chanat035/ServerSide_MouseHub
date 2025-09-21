import express from 'express'
import useUserRoute from './userRoutes.js'
import useProductRoute from './productRoutes.js'
import useCartRoute from './cartRoutes.js'
const router = express.Router()

useUserRoute(router);
useProductRoute(router);
useCartRoute(router);

export default router