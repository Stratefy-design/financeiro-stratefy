'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { auth, currentUser } from "@clerk/nextjs/server";
// Removed explicit redirect to avoid loops in layout
// import { redirect } from "next/navigation"; 

export async function getCurrentProfileId() {
    const { userId } = await auth();
    if (!userId) return undefined;

    // 1. Check if user already has a profile
    const existingProfile = await prisma.profile.findFirst({
        where: { userId: userId }
    });

    if (existingProfile) {
        // User already setup. Return cookie preference if valid, else first profile.
        const cookieStore = await cookies();
        const cookieId = cookieStore.get('currentProfileId')?.value;

        if (cookieId) {
            // Verify ownership
            const validProfile = await prisma.profile.findFirst({
                where: { id: parseInt(cookieId), userId: userId }
            });
            if (validProfile) return validProfile.id;
        }
        return existingProfile.id;
    }

    // 2. New User Setup - Check for Legacy Data Claim
    const user = await currentUser();
    const userIdInClerk = userId; // from auth()

    // LEGACY CLAIM: Link all orphan profiles (userId: null) to this user
    // We do this for the first user that logs in after migration.
    const orphanProfiles = await prisma.profile.findMany({
        where: { userId: null }
    });

    if (orphanProfiles.length > 0) {
        await prisma.profile.updateMany({
            where: { userId: null },
            data: { userId: userIdInClerk }
        });

        // Return the first profile found
        return orphanProfiles[0].id;
    }

    // 3. Brand New User - Create Fresh Profile
    const newProfile = await prisma.profile.create({
        data: {
            name: "Meu Perfil",
            type: "personal", // Default to Personal
            currency: "BRL",
            revenueGoal: 0,
            userId: userId // Link to Clerk ID
        }
    });

    return newProfile.id;
}

export async function switchProfile(profileId: number) {
    const cookieStore = await cookies();
    cookieStore.set('currentProfileId', profileId.toString());
    revalidatePath('/');
}

export async function getProfiles() {
    const { userId } = await auth();
    if (!userId) return [];
    return await prisma.profile.findMany({
        where: { userId }
    });
}

export async function getCurrentProfile() {
    const profileId = await getCurrentProfileId();
    return await prisma.profile.findUnique({
        where: { id: profileId }
    });
}

export async function createProfile(data: { name: string; type: 'personal' | 'business' }) {
    await prisma.profile.create({
        data: {
            name: data.name,
            type: data.type,
            currency: 'BRL',
            revenueGoal: 0
        }
    });
    revalidatePath('/');
}

export async function updateProfile(formData: FormData) {
    const profileIdStr = formData.get('profileId') as string;
    const name = formData.get('name') as string;
    const currency = formData.get('currency') as string;

    const companyName = formData.get('companyName') as string;
    const companyAddress = formData.get('companyAddress') as string;
    const companyEmail = formData.get('companyEmail') as string;
    const companyPhone = formData.get('companyPhone') as string;
    const companyWebsite = formData.get('companyWebsite') as string;
    const companyAvatar = formData.get('companyAvatar') as string;
    const businessDaysConfig = formData.get('businessDaysConfig') as string;

    // Use raw SQL to bypass Prisma Client runtime validation if the client is out of date
    try {
        await (prisma as any).$executeRawUnsafe(
            `UPDATE Profile SET 
            name = ?, 
            currency = ?, 
            companyName = ?, 
            companyAddress = ?, 
            companyEmail = ?, 
            companyPhone = ?, 
            companyWebsite = ?, 
            companyAvatar = ?,
            businessDaysConfig = ?
            WHERE id = ?`,
            name,
            currency,
            companyName,
            companyAddress,
            companyEmail,
            companyPhone,
            companyWebsite,
            companyAvatar,
            businessDaysConfig,
            parseInt(profileIdStr)
        );
    } catch (error) {
        console.error("Raw SQL update failed, falling back to standard update", error);
        // Fallback for when the client IS updated
        await prisma.profile.update({
            where: { id: parseInt(profileIdStr) },
            data: {
                name,
                currency,
                companyName,
                companyAddress,
                companyEmail,
                companyPhone,
                companyWebsite,
                companyAvatar,
                businessDaysConfig: businessDaysConfig as any
            } as any
        });
    }

    revalidatePath('/settings');
    revalidatePath('/');
}
