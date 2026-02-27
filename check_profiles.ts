import prisma from '@/lib/db';

async function main() {
    const profiles = await prisma.profile.findMany();
    console.log("Profiles found:", profiles);
}

main();
