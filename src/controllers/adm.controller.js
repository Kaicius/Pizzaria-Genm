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
    const { id_produto, id_ingrediente, quantidade, quantidade_uso } = req.body

    try {
        if (!id_produto || !id_ingrediente || !quantidade || !quantidade_uso) {
            return res.status(200).send({
                mensagem: "Todos os campos são obrigatorios"
            })
        }

        const nova_receita = await prisma.receita.create({
            data: {
                id_produto: id_produto,
                id_ingrediente: id_ingrediente,
                quantidade: quantidade,
                quantidade_uso: quantidade_uso
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

// LISTAR RECEITA

export async function listar_receitas(req, res) {
    try {
        const dados = await prisma.receita.findMany()

        return res.status(200).send(dados)
    } catch (error) {
        console.log("Erro ao listar receitas:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LISTAR RECEITA ESPECIFICA

export async function listar_receita_esp(req, res) {
    const id_receita = Number(req.params.id)

    try {
        if (!id_receita) {
            return res.status(404).send("Id não encontrado")
        }

        const receita = await prisma.receita.findMany({
            where: { id: id_receita }
        })

        return res.status(200).send({
            receita: receita
        })
    } catch (error) {
        console.error("erro ao listar a receita", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// EDITAR RECEITA

export async function editar_receita(req, res) {
    const id_receita = Number(req.params.id)
    const { quantidade, quantidade_uso } = req.body

    try {
        if (!id_receita) {
            return res.status(404).send("Id não encontrado")
        }

        if (quantidade === undefined && !quantidade_uso) {
            return res.status(400).send({
                mensagem: "Esses campos são obrigatorios"
            })
        }

        const receita_atualizada = await prisma.receita.update({
            where: { id: id_receita },
            data: {
                quantidade: quantidade,
                quantidade_uso: quantidade_uso.trim()
            }
        })

        return res.status(200).send({
            mensagem: "Item da receita atualizado",
            nova_receita: receita_atualizada
        })
    } catch (error) {
        console.log("Erro ao editar a receita:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
    }
}

// EXCLUIR ITEM DA RECEITA

export async function excluir_item_receita(req, res) {
    const id = Number(req.params.id)
    
    try {
        if (!id) {
            return res.status(404).send("Id não encontrado")
        }
        await prisma.receita.delete({
            where: { id }
        })
        return res.status(200).send({
            mensagem: "item removido da receita"
        })
    } catch (error) {
        console.log("Erro ao excluir item da receita:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
    }
}

// EXCLUIR RECEITA

export async function excluir_receita(req, res) {
    const id_receita = Number(req.params.id)

    try {
        if (!id_receita) {
            return res.status(404).send("Id não encontrado")
        }

        await prisma.receita.delete({
            where: { id: id_receita }
        })

        return res.status(200).send({
            mensagem: "Receita excluido com sucesso"
        })
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).send({
                mensagem: "Não é possível excluir: esta receita já possui ingredientes ou pedidos vinculados."
            });
        }
        console.log("Erro ao excluir uma receita:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
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

// EDITAR INGREDIENTE

export async function editar_ingrediente(req, res) {
    const { nome, estoque } = req.body
    const id_ingrediente =  Number(req.params.id)

    try {
        if (!id_ingrediente) {
            return res.status(404).send("Id não encontrado")
        }

        const atualizado = await prisma.ingrediente.update({
            where: { id: id_ingrediente },
            data: {
                nome: nome.trim(),
                estoque: estoque !== undefined ? Number(estoque) :undefined
            }
        })

        return res.status(200).send(atualizado)
    } catch (error) {
        console.log("Erro editar ingrediente:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LISTAR INGREDIENTE

export async function listar_ingredientes(req, res) {
    try {
        const dados = await prisma.ingrediente.findMany()

        return res.status(200).send(dados)
    } catch (error) {
        console.log("Erro ao listar ingredientes:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// LISTAR INGREDIENTE ESPECIFICO

export async function listar_ingredientes_esp(req, res) {
    const id_ingrediente = Number(req.params.id)

    try {
        if (!id_ingrediente) {
            return res.status(404).send("Id não encontrado")
        }

        const ingrediente = await prisma.ingrediente.findMany({
            where: { id: id_ingrediente }
        })

        return res.status(200).send({
            ingrediente: ingrediente
        })
    } catch (error) {
        console.error("erro ao listar o ingrediente", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
    }
}

// EXCLUIR INGREDIENTE

export async function excluir_ingrediente(req, res) {
    const id_ingrediente = Number(req.params.id)

    try {
        if (!id_ingrediente) {
            return res.status(404).send("Id não encontrado")
        }

        await prisma.ingrediente.delete({
            where: { id: id_ingrediente }
        })

        return res.status(200).send({
            mensagem: "Ingrediente excluido com sucesso"
        })
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).send({
                mensagem: "Não é possível excluir: este ingrediente já possui receitas ou pedidos vinculados."
            });
        }
        console.log("Erro ao excluir um ingreidente:", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        });
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

// LISTAR PRODUTO ESPECIFICO

export async function listar_produto_esp(req, res) {
    const id_produto = Number(req.params.id)

    try {
        if (!id_produto) {
            return res.status(404).send("Id não encontrado")
        }

        const produto = await prisma.produto.findMany({
            where: { id: id_produto }
        })

        return res.status(200).send({
            produto: produto
        })
    } catch (error) {
        console.error("erro ao listar o produto", error);
        return res.status(500).send({
            mensagem: "Erro interno do servidor"
        })
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

        if (!id_produto) {
            return res.status(404).send("Id não encontrado")
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
        if (!id_produto) {
            return res.status(404).send("Id não encontrado")
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