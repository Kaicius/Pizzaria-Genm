import 'dotenv/config'
import express from 'express'
import { logger } from './middlewares/logger.middlewares.js'
import authRoutes from './routes/auth.routes.js'
import admRoutes from './routes/adm.routes.js'
import pizzariaRoutes from './routes/pizzaria.routes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './docs/swagger.js'
import cookieParser from 'cookie-parser'


const app = express()
const Port = 3000

app.use(express.json())
app.use(logger)
app.use(cookieParser())

app.use("/user", authRoutes)
app.use("/adm", admRoutes)
app.use("/", pizzariaRoutes)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/docs-json', (req, res) => {
    res.json(swaggerSpec)
})


app.get("/health", async (req, res) => {
    try {
        await prisma.$connect()
        await prisma.$queryRaw`SELECT 1`
        
        return res.status(200).send({
            API: "Rodando",
            DB: "ON"
        })
    } catch (error) {
        
        return res.status(503).send({
            API: "Rodando",
            DB: "OFF"
        })
    }
})


app.listen(Port, ()=> {
    console.log(`API rodando na porta ${Port}`);
})