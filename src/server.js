import 'dotenv/config'
import express from 'express'
import { logger } from './middlewares/auth.middlewares.js'


const app = express()
const Port = 3000

app.use(express.json())
app.use(logger)


app.listen(Port, ()=> {
    console.log(`API rodando na porta ${Port}`);
})