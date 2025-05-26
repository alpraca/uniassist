import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  try {
    const { essay, instructions, topic, university, profile } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const promptText = `As an expert college admissions consultant, please edit the following essay according to these instructions: "${instructions}"

Original Essay:
${essay}

Context:
- Topic: ${topic.title}
- Prompt: ${topic.prompt}
- Word Limit: ${topic.wordLimit}
- University: ${university.name}

Student Profile:
- Academic Goals: ${profile.goals}
- Relevant Experience: ${profile.experience}
- Key Achievements: ${profile.achievements}
- Extracurricular Activities: ${profile.extracurricular}

Editing Guidelines:
1. Maintain the personal voice and authenticity
2. Ensure the essay stays focused on the prompt
3. Keep the student's unique experiences and perspective
4. Preserve important examples and achievements
5. Follow the word limit
6. Improve clarity and flow
7. Strengthen connections to the university's values
8. Enhance the narrative structure
9. Make the requested changes while keeping the essay's core message
10. Ensure proper grammar and style

Please provide the edited version of the essay while maintaining its personal voice and authenticity. Return only the edited essay text.`;

    const result = await model.generateContent(promptText);
    const response = result.response;
    const editedEssay = response.text();
    
    // Calculate word count
    const wordCount = editedEssay.split(/\s+/).length;

    return NextResponse.json({
      essay: editedEssay,
      wordCount
    });
  } catch (error) {
    console.error('Error editing essay:', error);
    return NextResponse.json(
      { error: 'Failed to edit essay content' },
      { status: 500 }
    );
  }
} 