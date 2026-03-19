require('dotenv').config()
const express = require('express')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const authMiddleware = require('../middleware/authMiddleware')

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})
const router = express.Router()

//Volunteer to help (create exchange)
router.post('/', authMiddleware, async (req,res) => {
    const {requestId} = req.body
    if (!requestId) {
        return res.status(400).json({error: 'requestId is required'})
    }
    try {
        const request = await prisma.request.findUnique({where: {id: requestId}})
        if(!request) return res.status(404).json({error: 'Request not found'})
        if (request.userId === req.userId) {
            return res.status(400).json({error: 'You cannot volunteer for your own request'})
        }
        if (request.status !== 'open') {
            return res.status(400).json({error: 'Request is no longer open'})
        }

        const existingExchange = await prisma.helperExchange.findFirst({
        where: {
        requestId,
        helperId: req.userId}
        })
        if (existingExchange) {
            return res.status(400).json({error: 'You have offered help for this task'})
        }

        const exchange = await prisma.helperExchange.create({
            data: {requestId, helperId: req.userId, status: 'pending' },
        })

        res.status(201).json(exchange)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Get all exchanges for a request
router.get('/request/:requestId', async (req, res) => {
    try {
        const exchanges = await prisma.helperExchange.findMany({
            where: {requestId: req.params.requestId},
            include: {
                helper: {select: {
                    id:true, 
                    name: true,
                    location: true,
                }}
            }
        })
        res.json(exchanges)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Get all exchanges for logged in user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const exchanges = await prisma.helperExchange.findMany({
            where: {helperId: req.userId},
            include: {
                request: {select: {
                    id:true,
                    title: true,
                    location: true, 
                    status: true
                }}
            }
        })
        res.json(exchanges)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Accept an exchange (task owner only)
router.put('/:id/accept', authMiddleware, async (req, res) => {
    try {
        const exchange = await prisma.helperExchange.findUnique({
            where: {id: req.params.id},
            include: {request: true }
        })
        if (!exchange) return res.status(404).json({error: 'Exchange not found'})
        if (exchange.request.userId !== req.userId) {
            return res.status(403).json({error: 'Not authorized'})
        }
        if (exchange.status !== 'pending') {
            return res.status(400).json({error:'Exchange is not pending'})
        }

        const updated = await prisma.helperExchange.update({
            where: {id: req.params.id},
            data: {status: 'in_progress'},
        })

        await prisma.request.update({
            where: { id: exchange.requestId},
            data: {status: 'in_progress'},
        })

        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Decline an exchange (task owner only)
router.put('/:id/decline', authMiddleware, async (req, res) => {
    try {
        const exchange = await prisma.helperExchange.findUnique({
            where: {id: req.params.id},
            include: {request: true}
        })
        if (!exchange) return res.status(404).json({error: 'Exchange not found'})
        if (exchange.request.userId !== req.userId) {
            return res.status(403).json({error: 'Not authorized'})
        }
        
        const updated = await prisma.helperExchange.update({
            where: {id: req.params.id},
            data: {status: 'declined'},
        })

        await prisma.request.update({
            where: {id: exchange.requestId},
            data: {status: 'open'}
        })

        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Get pending exchanges for task owner
router.get('/pending', authMiddleware, async (req, res) => {
    try {
        const requests = await prisma.request.findMany ({
            where: {userId: req.userId},
            select: {id: true}
        })
        const requestIds = requests.map(r => r.id)

        const exchanges = await prisma.helperExchange.findMany({
            where: {
                requestId: {in:requestIds},
                status:'pending'
            },
            include: {
                helper: {select: {id: true, name: true, avatar: true, location: true}},
                request: {select: {id: true, title: true}}
            }
        })
        res.json(exchanges)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Get active (in_progress) exchanges for task owner
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const requests = await prisma.request.findMany({
            where: {userId: req.userId},
            select: {id:  true}
        })
        const requestIds = requests.map(r => r.id)

        const exchanges = await prisma.helperExchange.findMany({
            where: {
                requestId: {in: requestIds},
                status: 'in_progress'
            },
            include: {
                helper: {select: {id: true, name: true, avatar:true, location:true}},
                request: {select: {id:true, title: true}}
            }
        })
        res.json(exchanges)
    } catch (err) {
        console.error(err)
        res.status(500).json({error:'Something went wrong'})
    }
})

//Mark exchange as completed
router.put('/:id/complete', authMiddleware, async (req, res) => {
    try {
        const exchange = await prisma.helperExchange.findUnique({
            where: {id:req.params.id},
            include: {request: true}
        })
        if (!exchange) return res.status(404).json({error: 'Exchange not found'})
        if (exchange.request.userId !== req.userId) {
            return res.status(403).json({error: 'Not authorized'})
        }

        const updated = await prisma.helperExchange.update({
            where: {id: req.params.id},
            data: {status: 'completed', completedAt: new Date()}
        })

        //Update request status to completed
        await prisma.request.update({
            where: {id: exchange.requestId},
            data: {status: 'completed'}
        })

        res.json(updated)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Get single exchange by ID
router.get('/detail/:id', authMiddleware, async (req, res) => {
    try {
        const exchange = await prisma.helperExchange.findUnique({
            where: {id: req.params.id},
            include: {
                request: {select: {id: true, title: true, price: true, location: true, userId: true, currency: true}},
                helper: {select: {id: true, name: true, avatar: true}},
            }
        })
        if (!exchange) return res.status(404).json({error:'Exchange not found'})
        res.json(exchange)
    } catch (err) {
        console.error(err)
        res.status(500).json({error:'Something went wrong'})
    }
}) 
module.exports = router