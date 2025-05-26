import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { topic, answers, socialLinks, university, prompt, existingEssay, editInstructions } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let promptText;

    if (editInstructions && existingEssay) {
      // Edit existing essay based on instructions
      promptText = `As a university admissions expert, please edit the following essay according to these instructions: "${editInstructions}"

Current Essay:
${existingEssay}

Please provide the edited version while maintaining the personal voice and authenticity. Return only the edited essay text.`;
    } else {
      // Generate new essay
      promptText = `As a university admissions expert, write a compelling essay for ${university.name} addressing the following topic:

Topic: ${topic.title}
Prompt: ${topic.prompt}
Word Limit: ${topic.wordLimit}

Student Profile:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Social Media/Portfolio:
${Object.entries(socialLinks).map(([platform, url]) => `${platform}: ${url}`).join('\n')}

University Context:
- University Name: ${university.name}
- University Strengths: ${university.strengths.join(', ')}
- Program Focus: ${university.programSpecificInfo[answers.intendedMajor]?.description || 'General program'}

Writing Guidelines:
1. Maintain a personal and authentic voice
2. Include specific examples from the student's background
3. Connect experiences to future goals
4. Show alignment with university values
5. Follow the word limit of ${topic.wordLimit} words
6. Address all aspects of the prompt
7. Incorporate relevant experiences and achievements
8. Show growth and self-reflection

Please write a compelling essay that showcases the student's unique qualities and fit for ${university.name}. Return only the essay text.`;
    }

    const result = await model.generateContent(promptText);
    const response = result.response;
    const essayText = response.text();

    return NextResponse.json({
      essay: essayText,
      wordCount: essayText.split(/\s+/).length
    });
  } catch (error) {
    console.error('Error generating essay:', error);
    return NextResponse.json(
      { error: 'Failed to generate essay content' },
      { status: 500 }
    );
  }
} 