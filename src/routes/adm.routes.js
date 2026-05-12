import { Router } from 'express'
import { verificarTokenAdmin } from '../middlewares/logger.middlewares.js'
import { login_adm, logout } from '../controllers/auth.controller.js'
import { cadastrar_ingrediente, cadastrar_produto, cadastrar_receita, cadastro_adm, editar_adm, editar_produto, excluir_adm, excluir_produto, home_adm, listar_adm, listar_adm_esp, listar_produtos } from '../controllers/adm.controller.js'
import { restocar_produto, ver_financeiro } from '../controllers/pizzaria.controller.js'

const router = Router()

// --- ROTAS ADMIN ---
router.get("/", verificarTokenAdmin, home_adm)
router.post('/login', login_adm)
router.get("/logout", verificarTokenAdmin, logout)

// --- ROTAS ADMIN CRUD ---
router.get("/listar/adm", verificarTokenAdmin, listar_adm)
router.get("/listar/adm/:id", verificarTokenAdmin, listar_adm_esp)
router.put("/listar/adm/editar/:id", verificarTokenAdmin, editar_adm)
router.post("/listar/adm/cadastrar", verificarTokenAdmin, cadastro_adm)
router.post("/listar/adm/cadastrar/debug", cadastro_adm)
router.delete("/listar/adm/excluir/:id", verificarTokenAdmin, excluir_adm)

// --- ROTAS FINANCEIRO ---
router.get('/financeiro', verificarTokenAdmin, ver_financeiro)
router.post('/restocar/:id', verificarTokenAdmin, restocar_produto)

// --- ROTAS PRODUTO --
router.post("/listar/produto/cadastrar", verificarTokenAdmin, cadastrar_produto)
router.get("/listar/produtos", verificarTokenAdmin, listar_produtos)
router.put("/listar/produto/editar/:id", verificarTokenAdmin, editar_produto)
router.delete("/listar/produto/excluir/:id", verificarTokenAdmin, excluir_produto)

// --- ROTAS INGREDIENTES ---
router.post("/listar/ingrediente/cadastrar", verificarTokenAdmin, cadastrar_ingrediente)

// --- ROTAS RECEITAS ---
router.post("/listar/receita/cadastrar", verificarTokenAdmin, cadastrar_receita)


export default router