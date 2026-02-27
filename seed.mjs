
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Criar Perfil Pessoal (ID 1)
    const personal = await prisma.profile.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1, // Forçar ID 1 para bater com hardcode do front
            name: 'Meu Perfil Pessoal',
            type: 'personal',
            currency: 'BRL'
        },
    });

    // Criar Perfil Empresarial (ID 2)
    const business = await prisma.profile.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2, // Forçar ID 2 para bater com hardcode do front
            name: 'Minha Empresa',
            type: 'business',
            currency: 'BRL'
        },
    });

    console.log({ personal, business });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
