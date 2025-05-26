import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { clerkClient } from '@clerk/nextjs';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const profile = user.publicMetadata.profile || {};

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error getting profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { profile } = data;

    // Get existing metadata
    const user = await clerkClient.users.getUser(userId);
    const existingMetadata = user.publicMetadata;

    // Update metadata with new profile data
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...existingMetadata,
        profile: {
          ...profile,
          lastUpdated: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 