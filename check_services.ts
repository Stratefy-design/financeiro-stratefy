import prisma from '@/lib/db';

async function main() {
    const services = await prisma.service.findMany({
        include: { profile: true }
    });
    console.log("All Services:", JSON.stringify(services, null, 2));

    const profiles = await prisma.profile.findMany();
    console.log("All Profiles:", JSON.stringify(profiles, null, 2));
}

main();
