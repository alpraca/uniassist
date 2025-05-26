import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';

export async function POST(request) {
  try {
    const { userId: clerkUserId } = auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      userId,
      universityId,
      answers,
      socialLinks,
      essays,
      progress,
      analysis
    } = await request.json();

    // Verify the authenticated user matches the request
    if (clerkUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save or update the application in the database
    const application = await db.applications.upsert({
      where: {
        userId_universityId: {
          userId,
          universityId
        }
      },
      update: {
        answers,
        socialLinks,
        essays,
        progress,
        analysis,
        updatedAt: new Date()
      },
      create: {
        userId,
        universityId,
        answers,
        socialLinks,
        essays,
        progress,
        analysis,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error saving application:', error);
    return NextResponse.json(
      { error: 'Failed to save application' },
      { status: 500 }
    );
  }
} 