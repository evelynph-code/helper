require('dotenv').config()
const express = require('express')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const authMiddleware = require('../middleware/authMiddleware')

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})
const router = express.Router()

//Create a review
router.post('/', authMiddleware, async (req, res) => {
    const {exchangeId, rating, comment} = req.body
    if (!exchangeId || !rating) {
        return res.status(400).json({error: 'exchangeId and rating are required'})
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({error: 'Rating must be between 1 and 5'})
    }
    try {
        const exchange = await prisma.helperExchange.findUnique({
            where: {id: exchangeId},
            include: {request: true}
        })
        if (!exchange) return res.status(404).json({error: 'Exchange not found'})
        if (exchange.status !== 'completed') {
            return res.status(400).json({error: 'Can only review completed exchanges'})
        }

        //Check if reviewer is either the task owner or the helper
        const isOwner = exchange.request.userId === req.userId
        const isHelper = exchange.helperId === req.userId
        if (!isOwner && !isHelper) {
            return res.status(403).json({error: 'Not authorized to review this exchange'})
        }

        //reviewee is the other person
        const revieweeId = isOwner ? exchange.helperId : exchange.request.userId
        
        // Check if already reviewed
        const existing = await prisma.review.findFirst({
            where: {exchangeId, reviewerId: req.userId}
        })
        if (existing) return res.status(400).json({error: 'You already reviewed this exchange'})
        
        const review = await prisma.review.create({
            data: {exchangeId, reviewerId: req.userId, revieweeId, rating, comment},
        })
        res.status(201).json(review)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Get all reviews for a user (as reviewee)
router.get('/user/:userId', async(req,res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: {revieweeId: req.params.userId},
            include: {
                reviewer: {select: {id: true, name: true, avatar: true}}
            },
            orderBy: {id: 'desc'}
        })
        res.json(reviews)
    } catch (err) {
        res.status(500).json({error:'Something went wrong'})
    }
})

//Get all reviews for an exchange
router.get('/exchange/:exchangeId',async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where:{exchangeId: req.params.exchangeId},
            include:{
                reviewer: {select: {id:true, name:true}}
            }
        })
        res.json(reviews)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

// Get reviews given by a user
router.get('/given/:userId', async (req,res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: {reviewerId: req.params.userId},
            include: {
                reviewee: {select: {id: true, name: true, avatar: true}},
                exchange: {select: {id: true}}
            },
            orderBy: {id: 'desc'}
        })
        res.json(reviews)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

module.exports = router