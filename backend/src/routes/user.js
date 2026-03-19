require('dotenv').config()
const express = require('express')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const authMiddleware = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})
const prisma = new PrismaClient({adapter})
const router = express.Router()

//Get own profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id:req.userId},
            select: {
                id: true,
                name: true,
                email: true,
                location: true,
                bio: true,
                createdAt: true,
                skills: true,
                avatar: true,
            }
        })
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Update own profile
router.put('/me', authMiddleware, async (req,res) => {
    const {name, location, bio} = req.body
    try {
        const user = await prisma.user.update({
            where: {id: req.userId},
            data: {name, location, bio},
            select: {
                id: true,
                name: true,
                email: true,
                location: true,
                bio: true,
                avatar: true,
            }
        })
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }

})

//Upload avatar
router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        console.log('req.file: ', JSON .stringify(req.file, null, 2))
        if (!req.file) return res.status(400).json({error: 'No file uploaded'})

        const avatarUrl = req.file.path
        console.log('avatarUrl:', avatarUrl)
        const user = await prisma.user.update({
            where: {id: req.userId},
            data: {avatar: avatarUrl},
            select: {id: true, name: true, email: true, avatar: true },
        })

        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

//Get any user's public profile
router.get('/:id', async (req,res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id},
            select: {
                id: true,
                name: true,
                location: true,
                bio: true,
                createdAt: true,
                skills: true,
                avatar: true,
            }
        })
        if (!user) return res.status(404).json({error: 'user not found'})
            res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

module.exports = router