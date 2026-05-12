import { Router } from 'express'
import { fazer_pedido, listar_cardapio, listar_pedidos } from '../controllers/pizzaria.controller.js'
import { verificarToken } from '../middlewares/logger.middlewares.js'

const router = Router()

// --- ROTAS NORMAIS ---
router.get('/cardapio', listar_cardapio)


// --- ROTAS CLIENTE ---
router.post("/pedido", verificarToken, fazer_pedido)
router.get("/meus-pedidos", verificarToken, listar_pedidos)


export default router