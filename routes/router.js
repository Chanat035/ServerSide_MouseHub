import express from 'express'
import useUserRoute from './userRoutes.js'
import useProductRoute from './productRoutes.js'
import useCartRoute from './cartRoutes.js'
import usePaymentRoute from './paymentRoutes.js'
import useOrderRoute from './orderRoutes.js'

const router = express.Router()

useUserRoute(router);
useProductRoute(router);
useCartRoute(router);
usePaymentRoute(router);
useOrderRoute(router);

export default router