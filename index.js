import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import router from './routes/router.js'
import bodyParser from 'body-parser'
import swaggerUI from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import authMiddleware from './middleware/authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3000
dotenv.config()

// ✅ ตั้งค่า view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// ✅ Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')))

// ✅ เชื่อมต่อ MongoDB
const dbUrl = process.env.DB_URL
const connect = async () => {
   try {
      await mongoose.connect(dbUrl)
      console.log('✅ Connected to MongoDB successfully')
   } catch (error) {
      console.error('❌ Error connecting to MongoDB:', error)
   }
}
await connect()

// ✅ Middleware พื้นฐาน
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

// ✅ ใช้ authMiddleware ให้ทุกหน้า EJS เข้าถึง user ได้ผ่าน res.locals.user
app.use(authMiddleware(undefined, true));

// ✅ Route หน้าแรก
app.get('/', (req, res) => {
   res.render('index', { title: 'หน้าแรก MouseHub', user: res.locals.user });
});

// ✅ Route เฉพาะ admin
app.get('/admin', authMiddleware('admin'), (req, res) => {
   res.render('admin', {
      title: 'แผงควบคุมผู้ดูแลระบบ',
      user: res.locals.user,
   })
})

// ✅ Routes อื่น ๆ (API)
app.use('/api', router)

// ✅ Swagger API Docs
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

// ✅ Start server
app.listen(port, () => {
   console.log(`🚀 MouseHub running on http://localhost:${port}`)
})
