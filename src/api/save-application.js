import { db } from '../lib/db';

export async function POST(request) {
  try {
    const {
      userId,
      universityId,
      answers,
      socialLinks,
      essays,
      progress,
      analysis
    } = await request.json();

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

    return new Response(JSON.stringify(application), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving application:', error);
    return new Response(JSON.stringify({ error: 'Failed to save application' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 