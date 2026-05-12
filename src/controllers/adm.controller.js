import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'

// Home

export async function home_adm(req, res) {
    return res.status(200).send({
        pagina: "Home Administrador"
    })
}

// LOGOUT

export async function logout_adm(req, res) {
    return res.clearCookie('token_adm').status(200).send({
        message: "Logout realizado com sucesso"
    });
}

// CADASTRAR ADM

export async function cadastro_adm(req, res) {
    const { username, email, senha, ativo } = req.body

    try {
        if(!username || typeof username !== "string" || username.length < 2){
            return res.status(400).send("username é obrigatorio e deve ter pelo menos 2 caracteres")
        }
    
        if (!email || typeof email !== "string"){
            return res.status(400).send("email é obrigatorio")
        }
    
        if(!senha || typeof senha !== "string" || senha.length < 6){
            return res.status(400).send("senha é obrigatorio e deve ter pelo menos 6 caracteres")
        }
        
        if (ativo === undefined) {
            return res.status(400).send("ativo é obrigatorio")
        }

        if(typeof ativo !== 'boolean'){
            return res.status(400).send("ativo deve ser 'true' ou 'false' ")
        }
    
        const existing = await prisma.administrador.findFirst({
            where: { ADM_EMAIL: email.trim().toLowerCase() }
        })
    
        const existing2 = await prisma.administrador.findFirst({
            where: { ADM_NOME: username.trim().toLowerCase() }
        })
    
        if(existing){
            return res.status(400).send("Email ja cadastrado")
        }
    
        if(existing2){
            return res.status(400).send("Username ja cadastrado")
        }
    
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(senha, salt)
        
        const administrador = await prisma.administrador.create({
            data: {
                ADM_NOME: username.trim(),
                ADM_ATIVO: ativo,
                ADM_EMAIL: email.trim().toLowerCase(),
                ADM_SENHA: hashedPassword
            }
        })
    
        return res.status(201).send("Administrador cadastrado com sucesso")
    } catch (error) {
        console.error("erro ao atualizar a senha", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// Listar ADM

export async function listar_adm(req, res) {
    try {
        const adms = await prisma.administrador.findMany({
            select: {
                ADM_ID: true,
                ADM_NOME: true,
                ADM_EMAIL: true,
                ADM_ATIVO: true
            }
        })
        return res.status(200).send({
            ADMs: adms
        })
    } catch (error) {
        console.error("erro ao listar adms", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// Listar ADM ESPECIFICO

export async function listar_adm_esp(req, res) {
    const id_adm = Number(req.params.id)
    try {
        const adm = await prisma.administrador.findMany({
            where: { ADM_ID: id_adm },
            select: {
                ADM_ID: true,
                ADM_NOME: true,
                ADM_EMAIL: true,
                ADM_ATIVO: true
            }
        })
        return res.status(200).send({
            ADMs: adm
        })
    } catch (error) {
        console.error("erro ao listar adms", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// EDITAR ADM

export async function editar_adm(req, res) {
    const id_adm = Number(req.params.id)
    const { username, email, senha, ativo } = req.body

    try {
        if(!username || typeof username !== "string" || username.length < 2){
            return res.status(400).send("username é obrigatorio e deve ter pelo menos 2 caracteres")
        }
    
        if (!email || typeof email !== "string"){
            return res.status(400).send("email é obrigatorio")
        }
    
        if(!senha || typeof senha !== "string" || senha.length < 6){
            return res.status(400).send("senha é obrigatorio e deve ter pelo menos 6 caracteres")
        }
        
        if (ativo === undefined) {
            return res.status(400).send("ativo é obrigatorio ")
        }

        if(typeof ativo !== 'boolean'){
            return res.status(400).send("ativo deve ser 'true' ou 'false' ")
        }

        const existing = await prisma.administrador.findFirst({
            where: { ADM_EMAIL: email.trim().toLowerCase(),
                NOT: { ADM_ID: id_adm }
             }
        })
    
        const existing2 = await prisma.administrador.findFirst({
            where: { ADM_NOME: username.trim().toLowerCase(),
                NOT: { ADM_ID: id_adm } }
        })
    
        if(existing){
            return res.status(400).send("Email ja cadastrado")
        }

        if(existing2){
            return res.status(400).send("Username ja cadastrado")
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(senha, salt)
    
        const novo_ADM = await prisma.administrador.update({
            where: { ADM_ID: id_adm },
            data: {
                ADM_NOME: username.trim(),
                ADM_EMAIL: email.trim(),
                ADM_SENHA: hashedPassword,
                ADM_ATIVO: ativo
            }
        })

        return res.status(200).send({
            mensagem: "Administrador editado com sucesso",
            ADM: novo_ADM
        })
    } catch (error) {
        console.error("erro ao editar adms", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }    
}


// Excluir ADM

export async function excluir_adm(req, res) {
    const id_adm = Number(req.params.id)

   try {

    if (!id_adm) {
        return res.status(404).send("Id não encontrado")
    }

    const deletarADM = await prisma.administrador.delete({
        where: { ADM_ID: id_adm }
    })

    const adms = await prisma.administrador.findMany({
        select: {
            ADM_ID: true,
            ADM_NOME: true,
            ADM_EMAIL: true,
            ADM_ATIVO: true
        }
    })

    return res.status(200).send({
        mensagem: "Administrador deletado com sucesso",
        ADMs: adms
    })
    
   } catch (error) {
        console.error("erro ao excluir adms", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
   }
}


// CADASTRO RECEITA

export async function cadastrar_receita(req, res) {
    const { id_produto, id_ingrediente, quantidade } = req.body

    try {
        if (!id_produto || !id_ingrediente || !quantidade) {
            return res.status(200).send({
                mensagem: "Todos os campos são obrigatorios"
            })
        }

        const nova_receita = await prisma.receita.create({
            data: {
                id_produto: id_produto,
                id_ingrediente: id_ingrediente,
                quantidade: quantidade
            } 
        })

        return res.status(201).send({
            mensagem: "Ingrediente atribuido ao produto",
            receita: nova_receita
        })
    } catch (error) {
        console.log("Erro ao cadastrar receita:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// CADASTRAR INGREDIENTE

export async function cadastrar_ingrediente(req, res) {
    const { nome, estoque } = req.body

    try {
        if (!nome || estoque === undefined) {
            return res.status(400).send({
                mensagem: "Nome e estoque inicial sao obrigatorios"
            });
        }

        const novo_ingrediente = await prisma.ingrediente.create({
            data: {
                nome: nome.trim(),
                estoque: Number(estoque)
            }
        })

        return res.status(201).send(novo_ingrediente)
    } catch (error) {
        console.log("Erro cadastrar novo ingrediente:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}


// CADASTRAR PRODUTO

export async function cadastrar_produto(req, res) {
    const { nome, descricao, preco, estoque, categoria } = req.body

    try {
        if (!nome || typeof nome != 'string' || !preco || !categoria || estoque === undefined) {
            return res.status(400).send({
                mensagem: "Nome, preço, categoria e estoque inicial sao obrigatorios"
            });
        }

        const categorias_permitidas = ['pizza', 'bebida', 'combo'];
        const categoria_lower = categoria.toLowerCase()
        if (!categorias_permitidas.includes(categoria_lower)) {
            return res.status(400).send({
                mensagem: "categoria precisa ser 'pizza', 'bebida' ou 'combo' "
            })
        }

        const novo_produto = await prisma.produto.create({
            data: {
                nome: nome.trim(),
                descricao: descricao.trim(),
                preco: Number(preco),
                estoque: Number(estoque),
                categoria: categoria_lower.trim().toUpperCase()
            }
        })

        return res.status(201).send({
            mensagem: "Produto cadastrado com sucesso!",
            produto: novo_produto
        })
    } catch (error) {
        console.log("Erro ao cadastrar produto:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
    }
}

// LISTAR PRODUTOS

export async function listar_produtos(req, res) {
    try {
        const produtos = await prisma.produto.findMany({
            include: {
                receita: { include: { ingrediente: true } }
            }
        })
        return res.status(200).send(produtos)
    } catch (error) {
        console.log("Erro ao listar produtos:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
    }
}

// EDITAR PRODUTO

export async function editar_produto(req, res) {
    const id_produto = Number(req.params.id)
    const { nome, descricao, preco, estoque, categoria } = req.body

    try {
        if (!nome || typeof nome != 'string' || !preco || !categoria || estoque === undefined) {
            return res.status(400).send({
                mensagem: "Nome, preço, categoria e estoque inicial sao obrigatorios"
            });
        }

        const categorias_permitidas = ['pizza', 'bebida', 'combo'];
        const categoria_lower = categoria.toLowerCase()
        if (!categorias_permitidas.includes(categoria_lower)) {
            return res.status(400).send({
                mensagem: "categoria precisa ser 'pizza', 'bebida' ou 'combo' "
            })
        }

        const produto_atualizado = await prisma.produto.update({
            where: { id: id_produto },
            data: {
                nome: nome.trim(),
                descricao: descricao.trim(),
                preco: Number(preco),
                estoque: Number(estoque),
                categoria: categoria_lower.trim().toUpperCase()
            }
        })

        return res.status(200).send({
            mensagem: "Produto editado com sucesso",
            produto: produto_atualizado
        })
    } catch (error) {
        console.log("Erro ao editar um produto:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
    }
}


// EXCLUIR PRODUTO

export async function excluir_produto(req, res) {
    const id_produto = Number(req.params.id)

    try {
        const existe = await prisma.produto.findUnique({
            where: { id: id_produto }
        })

        if (!existe) {
            return res.status(404).send({
                mensagem: "Produto não encontrado"
            })
        }

        await prisma.produto.delete({
            where: { id: id_produto }
        })

        return res.status(200).send({
            mensagem: "Produto excluido com sucesso"
        })
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).send({
                mensagem: "Não é possível excluir: este produto já possui receitas ou pedidos vinculados."
            });
        }
        console.log("Erro ao excluir um produto:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
    }
}