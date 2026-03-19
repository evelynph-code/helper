require('dotenv').config()
const express = require('express')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const authMiddleware = require('../middleware/authMiddleware')

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})
const prisma = new PrismaClient({adapter})
const router = express.Router()

//Create a request
router.post('/', authMiddleware, async (req,res) => {
    const {title, description, location, price, paymentMethod, currency} = req.body
    console.log('currency received:', currency)
    console.log('full body:', req.body)
    if (!title || !description || !location) {
        return res.status(400).json({error: 'Title, description and location are required'})
    }
    try{
        const request = await prisma.request.create({
            data: {title, 
                description, 
                location, 
                price: price || 0,
                paymentMethod: paymentMethod || 'cash',
                currency: currency || 'USD',
                userId: req.userId},
        })
        res.status(201).json(request)
    } catch (err){
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//List all open requests
router.get('/', async (req,res) => {
    try {
        const requests = await prisma.request.findMany({
            orderBy: {createdAt: 'desc'},
            include: {
                user: {
                    select: {
                        id:true, 
                        name: true, 
                        location: true
                    }}
            }
        })
        res.json(requests)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Get a single request
router.get('/:id', async (req, res) => {
    try {
        const request = await prisma.request.findUnique({
            where: {id: req.params.id},
            include: {
                user: {
                    select: {
                        id: true, 
                        name: true,
                        location: true
                    }
                },
                exchanges: true,
            }
        })
        if (!request) return res.status(404).json({error: "Request not found"})
            res.json(request)
    } catch (err) {
        console.error(err)
        res.status(500).json({error:'Something went wrong'})
    }
})

//Update request status
router.put('/:id', authMiddleware, async (req,res) => {
    const { status } = req.body
    try {
        const request = await prisma.request.findUnique({
            where: {
                id: req.params.id}
            })
        if (!request) return res.status(404).json({error: "Request not found"})
        if (request.userId !== req.userId) return res.status(403).json({error: 'Not authorized'})

        const updated = await prisma.request.update({
            where: {id: req.params.id},
            data: {status},
        })
        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Edit a request
router.put('/:id/edit', authMiddleware, async (req, res) => {
    const {title, description, location, price, paymentMethod, currency} = req.body
    try {
        const request = await prisma.request.findUnique({where: {id: req.params.id}})
        if (!request) return res.status(404).json({error: 'Request not found'})
        if (request.userId !== req.userId) return res.status(403).json({error: 'Not authorized'})
        if (request.status !== 'open') return res.status(400).json({error: 'Can only edit open tasks'})
        
        const updated = await prisma.request.update({
            where: {id: req.params.id},
            data: {title, description, location, price: parseFloat(price), paymentMethod, currency}
        })
        res.json(updated)
    } catch (err) {
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Delete a request
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const request = await prisma.request.findUnique({
            where:
            {id: req.params.id}
        })
        if (request.status !== 'open') {
        return res.status(400).json({error: 'Cannot delete a task that is in progress or completed'})
        }
        if (!request) return res.status(404).json({error: 'Request not found'})
        if (request.userId !== req.userId) return res.status(403).json({error: 'Not authorized'})
        
        await prisma.request.delete({where: {id: req.params.id}})
        res.json({message: "Request deleted"})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

module.exports = router