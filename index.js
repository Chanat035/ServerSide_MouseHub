import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import router from './routes/router.js'
import bodyParser from 'body-parser'
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import cookieParser from "cookie-parser";
import path from 'path'
import { fileURLToPath } from 'url'
import  authMiddleware from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express() // ต้องประกาศก่อนใช้ app.set()
const port = 3000
dotenv.config()


// ตั้งค่า view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views')) // โฟลเดอร์ views

// Serve ไฟล์ static
app.use(express.static(path.join(__dirname, 'public')))

const dbUrl = process.env.DB_URL
const connect = async () => {
   try {
      await mongoose.connect(dbUrl)  
      console.log('Connected to MongoDB successfully')
   } catch (error) {
      console.error('Error connecting to MongoDB:', error)
   }
}
await connect()

app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.json());
app.use(authMiddleware(undefined, true)); // attachOnly = true
// Middleware;
app.use(express.urlencoded({ extended: true })); // สำคัญ ต้องมี
// Routes
app.get('/', (req, res) => {
   const username = req.cookies.username;
  res.render('index', { title: 'หน้าแรก MouseHub', username }) // render หน้า index.ejs
})

router.get("/admin", authMiddleware("admin"), (req, res) => {
  res.render("admin", { user: res.locals.user });
});

app.use('/api', router)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`MouseHub listening on port ${port}`)
})

