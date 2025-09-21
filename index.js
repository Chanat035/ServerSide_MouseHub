import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import router from './routes/router.js'
import bodyParser from 'body-parser'
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import cookieParser from "cookie-parser";


const app = express()
const port = 3000
dotenv.config()

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

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(bodyParser.json());
app.use('/api', router)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`MouseHub listening on port ${port}`)
})