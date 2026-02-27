import { getServices } from "@/app/actions/services";
import { getCurrentProfileId } from "@/app/actions/settings";
import prisma from "@/lib/db";

async function main() {
    const services = await getServices();
    console.log("Services from Action:", JSON.stringify(services, null, 2));

    const currentProfileId = await getCurrentProfileId();
    console.log("Current Profile via Cookie:", currentProfileId);
}

main();
