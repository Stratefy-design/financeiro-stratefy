import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const personal = await prisma.profile.findFirst({ where: { type: 'personal' } })

    if (!personal) {
        await prisma.profile.create({
            data: {
                name: 'Pessoal',
                type: 'personal',
                currency: 'BRL'
            }
        })
        console.log('Perfil Pessoal criado via seed.')
    }

    const business = await prisma.profile.findFirst({ where: { type: 'business' } })

    if (!business) {
        await prisma.profile.create({
            data: {
                name: 'Minha Empresa',
                type: 'business',
                currency: 'BRL'
            }
        })
        console.log('Perfil Empresa criado via seed.')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
