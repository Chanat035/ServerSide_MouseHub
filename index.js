import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/router.js';
import useWebRoute from './routes/webRoutes.js';
import bodyParser from 'body-parser';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
dotenv.config();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
const dbUrl = process.env.DB_URL;
await mongoose.connect(dbUrl);
console.log('✅ Connected to MongoDB successfully');

// ✅ Middleware พื้นฐาน
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

// ✅ ให้ทุกหน้า EJS ใช้ user
app.use(authMiddleware(undefined, true));
useWebRoute(router);

app.use('/', router);
app.use('/api', router);          // API

// Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Start
app.listen(port, () => {
  console.log(`🚀 MouseHub running on http://localhost:${port}`);
});
