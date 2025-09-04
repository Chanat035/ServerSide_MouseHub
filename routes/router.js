import express from 'express'
import useUserRoute from './userRoutes.js'
const router = express.Router()

useUserRoute(router)

export default router