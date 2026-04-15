import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'


export async function cadastro(req, res) {
    const {name, email, password} = req.body
}