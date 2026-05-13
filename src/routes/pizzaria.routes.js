import { Router } from 'express'
import { cancelar_pedido, fazer_pedido, home, listar_cardapio, listar_pedidos } from '../controllers/pizzaria.controller.js'
import { verificarToken } from '../middlewares/logger.middlewares.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Pizzaria - Geral
 *     description: Rotas públicas de visualização
 *   - name: Pizzaria - Cliente
 *     description: Ações do usuário logado (Pedidos)
 */


// --- ROTAS NORMAIS ---

/**
 * @swagger
 * /:
 *   get:
 *     summary: Página inicial da pizzaria
 *     tags: [Pizzaria - Geral]
 *     responses:
 *       200:
 *         description: Bem-vindo à Home
 */

router.get("", home)

/**
 * @swagger
 * /cardapio:
 *   get:
 *     summary: Lista todos os produtos disponíveis no cardápio
 *     description: Retorna apenas produtos que possuem estoque maior que zero.
 *     tags: [Pizzaria - Geral]
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 */

router.get('/cardapio', listar_cardapio)


// --- ROTAS CLIENTE ---

/**
 * @swagger
 * /pedido:
 *   post:
 *     summary: Realiza um novo pedido
 *     tags: [Pizzaria - Cliente]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itens]
 *             properties:
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_produto:
 *                       type: integer
 *                     quantidade:
 *                       type: integer
 *                 example: [{ "id_produto": 1, "quantidade": 2 }]
 *     responses:
 *       201:
 *         description: Pedido criado. O status mudará para PREPARANDO em 3min e ENTREGUE em 10min.
 *       400:
 *         description: Estoque insuficiente de produtos ou ingredientes
 */

router.post("/pedido", verificarToken, fazer_pedido)

/**
 * @swagger
 * /meus-pedidos:
 *   get:
 *     summary: Lista o histórico de pedidos do cliente logado
 *     description: Não exibe pedidos com status CANCELADO. Esconde IDs internos e estoque.
 *     tags: [Pizzaria - Cliente]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos personalizada
 */

router.get("/meus-pedidos", verificarToken, listar_pedidos)

/**
 * @swagger
 * /cancelar/{id}:
 *   get:
 *     summary: Cancela um pedido específico
 *     tags: [Pizzaria - Cliente]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 *       404:
 *         description: Pedido não encontrado ou não pertence ao usuário
 */

router.get("/cancelar/:id", verificarToken, cancelar_pedido)


export default router