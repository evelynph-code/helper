require('dotenv').config()
const {PrismaClient} = require("./generated/prisma")
const {PrismaPg} = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({adapter})

async function main() {
    const users = await prisma.user.findMany();
    console.log("Users:", users)
}

main()
.catch(console.error)
.finally(() => prisma.$disconnect())