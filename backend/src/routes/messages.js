require('dotenv').config()
const express = require('express')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const authMiddleware = require('../middleware/authMiddleware')

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})
const router = express.Router()

//Get all messages for an exchange
router.get('/:exchangeId', authMiddleware, async (req,res) => {
    try {
        const messages = await prisma.message.findMany ({
            where: { exchangeId: req.params.exchangeId},
            include: {
                sender: {select: {id: true, name: true, avatar: true}}
            },
            orderBy: {createdAt: 'asc'}
        })
        res.json(messages)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

module.exports = router