require('dotenv').config()
const express = require('express')
const {PrismaClient} = require('../../generated/prisma')
const {PrismaPg} = require('@prisma/adapter-pg')
const authMiddleware = require('../middleware/authMiddleware')

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})
const prisma = new PrismaClient({adapter})
const router = express.Router()

//Add a skill
router.post('/', authMiddleware, async (req, res) => {
    const {name, description} = req.body
    if (!name) return res.status(400).json({error:'Skill name is required'})
    try {
    const skill = await prisma.skill.create({
        data: {name,description, userId: req.userId}
    })
    res.status(201).json(skill)
    } catch (err) {
        console.error(err)
        res.status(500).json({error:'Something went wrong'})
    }
})

// Delete a skill
router.delete('/:id', authMiddleware, async (req,res) => {
    try{
        const skill = await prisma.skill.findUnique({where: {id: req.params.id}})
        if (!skill) return res.status(404).json({error: "Skill not found"})
        if (skill.userId !== req.userId) return res.status(403).json({error: 'Not authorized'})
        await prisma.skill.delete({where: {id: req.params.id}})
        res.json({message: 'Skill deleted'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Something went wrong'})
    }
})

module.exports = router