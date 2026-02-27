import prisma from '@/lib/db';

async function main() {
    try {
        const deleteResult = await prisma.profile.deleteMany({
            where: {
                type: 'personal'
            }
        });
        console.log(`Deleted ${deleteResult.count} personal profiles.`);
    } catch (e) {
        console.error("Error deleting:", e);
    }
}

main();
