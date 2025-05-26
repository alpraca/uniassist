import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  try {
    const { topic, university, profile, structureOnly } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let promptText = `As an expert college admissions consultant, ${structureOnly ? 'create a detailed outline' : 'write a compelling essay'} for ${university.name} addressing the following topic:

Topic: ${topic.title}
Prompt: ${topic.prompt}
Word Limit: ${topic.wordLimit}

Student Profile:
- Academic Goals: ${profile.goals}
- Relevant Experience: ${profile.experience}
- Key Achievements: ${profile.achievements}
- Extracurricular Activities: ${profile.extracurricular}

University Context:
- University Name: ${university.name}
- University Strengths: ${university.strengths?.join(', ') || 'Not specified'}
- Program Focus: ${university.programSpecificInfo?.[topic.title]?.description || 'General program'}

${structureOnly ? `
Please provide a detailed outline with:
1. Introduction structure
2. Main body points with supporting evidence from the student's profile
3. Conclusion approach
4. Key themes to emphasize
5. Specific examples to include from the student's background` 
: `
Writing Guidelines:
1. Maintain a personal and authentic voice
2. Include specific examples from the student's background
3. Connect experiences to future goals
4. Show alignment with university values
5. Follow the word limit
6. Address all aspects of the prompt
7. Demonstrate growth and self-reflection
8. Use active voice and engaging language
9. Create a compelling narrative arc
10. End with a strong conclusion that ties back to the introduction`}

${structureOnly ? 'Return only the outline structure.' : 'Write a compelling essay that showcases the student\'s unique qualities and fit for the university.'}`;

    const result = await model.generateContent(promptText);
    const response = result.response;
    const essayText = response.text();
    
    // Calculate word count
    const wordCount = essayText.split(/\s+/).length;

    return NextResponse.json({
      essay: essayText,
      wordCount,
      structure: structureOnly
    });
  } catch (error) {
    console.error('Error generating essay:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay content' },
      { status: 500 }
    );
  }
} 