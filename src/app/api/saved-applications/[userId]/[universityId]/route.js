import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { userId, universityId } = params;

    if (!userId || !universityId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const application = await db.applications.findUnique({
      where: {
        userId_universityId: {
          userId,
          universityId
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error loading saved application:', error);
    return NextResponse.json(
      { error: 'Failed to load application' },
      { status: 500 }
    );
  }
} 